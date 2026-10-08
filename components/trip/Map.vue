<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'

// The trip's map: every day's stops at once, or one day's stops joined by a walking route. One Mapbox map for the life
// of the page; changing `selected` swaps its markers and route instead of building a new map.
//   days      [{ number, coordinates: [[lng, lat]...], names: [...] }]  (see parseItinerary in utils/itinerary.js)
//   selected  index of the day shown alone, or null for every day
//   refit     any number: a new value fits the view to the stops again, even when `selected` did not change
// All days: each stop is a marker in its day's pill colour (blue, coral, peach) with the day's number. One day: royal-blue
// markers numbered 1, 2, 3 like the stops on that day's card, and the route between them. A marker opens a small card
// with the place's photo and first sentence. The card is built from DOM nodes and text, never from an HTML string: the
// names come from a language model and the text from TripAdvisor, and neither should be able to put markup on the page.

const props = defineProps({
  days: { type: Array, required: true },
  selected: { type: Number, default: null },
  refit: { type: Number, default: 0 },
})

const copy = itineraryContent.map

// The Mapbox token is a public (pk.) one and goes to the browser, but it is kept out of the code: set NUXT_PUBLIC_MAPBOX_TOKEN
// (see .env.example) and restrict it to this site's addresses in the Mapbox dashboard.
const MAPBOX_TOKEN = useRuntimeConfig().public.mapboxToken
const STYLE = 'mapbox://styles/mapbox/light-v11'
const MAX_ROUTE_STOPS = 25 // the Directions API takes at most this many waypoints
const NO_IMAGE = 'No image available'
const NO_DESCRIPTION = 'No description available'

const element = ref(null)
const ready = ref(false)
const unavailable = ref(false) // no WebGL on this device, or the map's style could not be fetched

let mapboxgl = null
let map = null
let markers = []
let popup = null
let observer = null
let drawn = 0 // counts draws, so a slow route answer for an old selection is ignored
let started = false
let startTimer = null
let tileWatch = null

const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const emptyLine = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }

const inView = computed(() =>
  (props.selected === null ? props.days.map((day, index) => [day, index]) : [[props.days[props.selected], props.selected]]).filter(([day]) => day),
)
const hasStops = computed(() => inView.value.some(([day]) => day.coordinates.length))

onMounted(async () => {
  try {
    if (!MAPBOX_TOKEN) throw new Error('NUXT_PUBLIC_MAPBOX_TOKEN is not set')
    mapboxgl = (await import('mapbox-gl')).default
    mapboxgl.accessToken = MAPBOX_TOKEN
    map = new mapboxgl.Map({
      container: element.value,
      style: STYLE,
      center: [0, 20],
      zoom: 1.2,
      attributionControl: false,
      // in a phone's page flow one finger should scroll the page, not drag the map
      cooperativeGestures: window.matchMedia('(max-width: 979px)').matches,
    })
  } catch {
    unavailable.value = true // the library could not be fetched, or this device has no WebGL
    return
  }
  map.addControl(new mapboxgl.AttributionControl({ compact: true }))
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

  // the stops go on once the map has loaded: moving the camera while its first tiles are still arriving left a hole in the
  // map about one load in twenty. If the tiles are very slow, the stops go on anyway after a while.
  const start = () => {
    if (started || !map) return
    started = true
    tintLandAndWater()
    addRouteLayers()
    ready.value = true
    draw()
  }
  map.once('load', start)
  map.once('style.load', () => { startTimer = setTimeout(start, 10000) })
  map.on('error', (event) => {
    if (!ready.value && /\/styles\//.test(event.error?.url ?? '')) unavailable.value = true
  })

  observer = new ResizeObserver(() => map?.resize())
  observer.observe(element.value)
})

onBeforeUnmount(() => {
  clearTimeout(startTimer)
  clearTimeout(tileWatch)
  observer?.disconnect()
  clear()
  map?.remove()
  map = null
})

watch(() => [props.days, props.selected, props.refit], () => ready.value && draw())

/** The light style is grey; bring its water and land toward the page's own pale blue-grey. */
function tintLandAndWater() {
  const paint = (id, property, value) => map.getLayer(id) && map.setPaintProperty(id, property, value)
  paint('water', 'fill-color', cssVar('--vp-standin-3', '#c9d4f5'))
  paint('land', 'background-color', cssVar('--vp-paper', '#f3f5f9'))
}

/** The route is a white casing under a blue line, below the map's own labels. */
function addRouteLayers() {
  const firstLabel = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id
  map.addSource('route', { type: 'geojson', data: emptyLine })
  const layout = { 'line-join': 'round', 'line-cap': 'round' }
  map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout, paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.95 } }, firstLabel)
  map.addLayer({ id: 'route', type: 'line', source: 'route', layout, paint: { 'line-color': cssVar('--vp-blue', '#3558e6'), 'line-width': 5 } }, firstLabel)
}

function clear() {
  popup?.remove()
  popup = null
  markers.forEach((marker) => marker.remove())
  markers = []
}

async function draw() {
  const thisDraw = ++drawn
  clear()
  map.getSource('route')?.setData(emptyLine)

  const single = props.selected !== null
  const bounds = new mapboxgl.LngLatBounds()
  for (const [day, dayIndex] of inView.value) {
    day.coordinates.forEach((coordinate, i) => {
      addMarker(coordinate, day.names[i], single ? { label: i + 1, tone: 'blue', aria: `Stop ${i + 1}: ${day.names[i]}` } : { label: day.number, tone: toneOfDay(dayIndex), aria: `Day ${day.number}: ${day.names[i]}` })
      bounds.extend(coordinate)
    })
  }
  fit(bounds)

  if (single) {
    const { coordinates } = inView.value[0][0]
    if (coordinates.length > 1) {
      const line = await walkingRoute(coordinates)
      if (thisDraw === drawn) map.getSource('route')?.setData(line)
    }
  }
}

function fit(bounds) {
  if (bounds.isEmpty()) return
  watchTiles()
  const duration = reducedMotion() ? 0 : 700
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  if (sw.lng === ne.lng && sw.lat === ne.lat) map.easeTo({ center: sw, zoom: 14, duration })
  else map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration })
}

/**
 * A tile request that never answers leaves a hole in the map, and the map never asks for that tile again. A few seconds
 * after the camera settles, if tiles are still missing, reload the map's sources (at most twice).
 */
function watchTiles(attempt = 0) {
  clearTimeout(tileWatch)
  tileWatch = setTimeout(() => {
    if (!map || map.areTilesLoaded() || attempt >= 2) return
    for (const id of Object.keys(map.getStyle().sources)) map.getSource(id)?.reload?.()
    watchTiles(attempt + 1)
  }, 6000)
}

function addMarker(coordinate, name, { label, tone, aria }) {
  // Mapbox moves the outer element with a transform, so the look (and its hover) lives on the button inside it
  const holder = document.createElement('div')
  const pin = document.createElement('button')
  pin.type = 'button'
  pin.className = `trip-marker trip-marker--${tone}`
  pin.textContent = String(label)
  pin.setAttribute('aria-label', aria)
  pin.addEventListener('click', (event) => {
    // the map counts a click on a marker as a click on the map, and a map click closes the card this one has just opened
    event.stopPropagation()
    openPlace(coordinate, name)
  })
  holder.append(pin)
  markers.push(new mapboxgl.Marker({ element: holder }).setLngLat(coordinate).addTo(map))
}

/** The walking route through the stops, or a straight line between them when Mapbox cannot route them. */
async function walkingRoute(coordinates) {
  const straight = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
  if (coordinates.length > MAX_ROUTE_STOPS) return straight
  try {
    const path = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';')
    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${path}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`)
    const route = (await response.json()).routes?.[0]
    return route ? { type: 'Feature', properties: {}, geometry: route.geometry } : straight
  } catch {
    return straight
  }
}

const firstSentence = (text) => (text.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? text).trim()

/** The card a marker opens. Only text nodes and an <img> whose address starts with http(s): nothing from outside is parsed as HTML. */
function placeCard({ name, photo, text, waiting }) {
  const card = document.createElement('div')
  const withPhoto = Boolean(photo && /^https?:\/\//i.test(photo))
  card.className = withPhoto ? 'trip-pop' : 'trip-pop trip-pop--plain'
  if (withPhoto) {
    const frame = document.createElement('div')
    frame.className = 'trip-pop__photo'
    const image = document.createElement('img')
    image.alt = ''
    image.src = photo
    frame.append(image)
    card.append(frame)
  }
  const body = document.createElement('div')
  body.className = 'trip-pop__body'
  const title = document.createElement('p')
  title.className = 'trip-pop__name'
  title.textContent = name
  body.append(title)
  if (text || waiting) {
    const line = document.createElement('p')
    line.className = waiting ? 'trip-pop__text trip-pop__text--wait' : 'trip-pop__text'
    line.textContent = waiting ? copy.findingPhoto : text
    body.append(line)
  }
  card.append(body)
  return card
}

async function openPlace(coordinate, name) {
  popup?.remove()
  const current = new mapboxgl.Popup({ offset: 24, maxWidth: '280px', className: 'trip-popup' })
    .setLngLat(coordinate)
    .setDOMContent(placeCard({ name, waiting: true }))
    .addTo(map)
  popup = current
  current.on('close', () => { if (popup === current) popup = null })
  // the card opens above its stop and is at most about 270px tall: in a short map (a phone's) keep the stop low enough for the card to fit over it
  const height = map.getContainer().clientHeight
  const lowered = Math.min(Math.max(height / 2, 24 + 270 + 18), height - 30) - height / 2
  map.easeTo({ center: coordinate, zoom: Math.max(map.getZoom(), 13.5), offset: [0, lowered], duration: reducedMotion() ? 0 : 600 })

  try {
    const place = await $fetch('/api/GetLocationByName', { query: { destination: name, lat: coordinate[1], long: coordinate[0] } })
    if (popup !== current) return
    const text = place.description && place.description !== NO_DESCRIPTION ? firstSentence(place.description) : ''
    current.setDOMContent(place.error ? placeCard({ name }) : placeCard({ name: place.name || name, photo: place.imageUrl === NO_IMAGE ? '' : place.imageUrl, text }))
  } catch {
    if (popup === current) current.setDOMContent(placeCard({ name }))
  }
}
</script>

<template>
  <div class="tmap">
    <div ref="element" class="tmap__canvas" role="region" :aria-label="copy.label" />
    <p v-if="unavailable" class="tmap__empty">{{ copy.unavailable }}</p>
    <p v-else-if="ready && !hasStops" class="tmap__empty">{{ copy.none }}</p>
  </div>
</template>

<style scoped>
.tmap { position: relative; width: 100%; height: 100%; min-height: 320px; }
.tmap__canvas { position: absolute; inset: 0; }
.tmap__empty { position: absolute; left: 50%; top: 50%; max-width: 80%; margin: 0; padding: 12px 18px; border: 1px solid var(--vp-line); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink-2); font: 500 15px/1.4 var(--vp-font); text-align: center; transform: translate(-50%, -50%); }

/* markers: a white-ringed disc in the day's pill colour; the numbers are the data, so they are heavy and tabular. Their shadow is
   neutral black: a tinted glow under a saturated disc is the "glow" look, and over map imagery nothing is tinted anyway */
.tmap :deep(.mapboxgl-marker) { border-radius: 50%; } /* the box the map moves is round too, so its corners do not hide the marker under them */
.tmap :deep(.trip-marker) { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 2px solid #fff; border-radius: 50%; font: 800 14px/1 var(--vp-font); font-variant-numeric: tabular-nums; cursor: pointer; box-shadow: 0 6px 12px -4px rgba(0, 0, 0, .4), 0 2px 4px rgba(0, 0, 0, .18); transition: transform .25s var(--vp-ease); }
.tmap :deep(.trip-marker:hover) { transform: scale(1.1); }
.tmap :deep(.trip-marker:focus-visible) { outline: 3px solid var(--vp-blue); outline-offset: 3px; }
.tmap :deep(.trip-marker--blue) { background: var(--vp-blue); color: #fff; }
.tmap :deep(.trip-marker--coral) { background: var(--vp-coral); color: var(--vp-ink); }
.tmap :deep(.trip-marker--peach) { background: var(--vp-peach); color: var(--vp-ink); }

/* the card a marker opens: a small destination card, the photo through the same halftone and grain as every photo */
.tmap :deep(.trip-popup .mapboxgl-popup-content) { width: min(264px, calc(100vw - 48px)); padding: 0; border: 1px solid var(--vp-line); border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 24px 40px -20px rgba(0, 0, 0, .35), 0 6px 14px -8px rgba(0, 0, 0, .18); font-family: var(--vp-font); }
.tmap :deep(.trip-popup) { z-index: 3; } /* above the zoom buttons: a card near the edge of a phone's map must not slide under them */
.tmap :deep(.trip-popup .mapboxgl-popup-tip) { display: none; }
.tmap :deep(.trip-popup .mapboxgl-popup-close-button) { top: 8px; right: 8px; z-index: 2; width: 28px; height: 28px; padding: 0; border-radius: 999px; background: rgba(255, 255, 255, .94); color: var(--vp-ink); font-size: 18px; line-height: 1; }
.tmap :deep(.trip-popup .mapboxgl-popup-close-button:hover) { background: #fff; color: var(--vp-blue); }
.tmap :deep(.trip-pop__photo) { position: relative; isolation: isolate; aspect-ratio: 16 / 9; overflow: hidden; background: var(--vp-standin-2); }
.tmap :deep(.trip-pop__photo img) { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.tmap :deep(.trip-pop__photo::before) { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(8, 14, 36, .55) 0 1px, transparent 1.5px) 0 0 / 4px 4px; mix-blend-mode: multiply; opacity: .45; }
.tmap :deep(.trip-pop__photo::after) { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: var(--vp-grain); mix-blend-mode: overlay; opacity: .5; }
.tmap :deep(.trip-pop__body) { padding: 12px 14px 14px; }
.tmap :deep(.trip-pop--plain .trip-pop__body) { padding-right: 46px; } /* no photo: the close button sits in the corner of the text */
.tmap :deep(.trip-pop__name) { margin: 0; color: var(--vp-ink); font: 700 17px/1.25 var(--vp-font); letter-spacing: -.015em; }
.tmap :deep(.trip-pop__text) { display: -webkit-box; margin: 6px 0 0; overflow: hidden; color: var(--vp-ink-2); font: 400 14px/1.5 var(--vp-font); -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.tmap :deep(.trip-pop__text--wait) { color: var(--vp-ink-3); }

/* zoom buttons: the world's 8px controls with a visible edge */
.tmap :deep(.mapboxgl-ctrl-group) { overflow: hidden; border: 1px solid color-mix(in srgb, var(--vp-ink-3) 75%, #fff); border-radius: var(--vp-radius); background: #fff; box-shadow: none; }
.tmap :deep(.mapboxgl-ctrl-group button) { width: 36px; height: 36px; }
.tmap :deep(.mapboxgl-ctrl-group button + button) { border-top: 1px solid var(--vp-line); }
.tmap :deep(.mapboxgl-ctrl-group button:focus-visible) { outline: 3px solid var(--vp-blue); outline-offset: -3px; }
.tmap :deep(.mapboxgl-ctrl-attrib) { font-family: var(--vp-font); }
</style>
