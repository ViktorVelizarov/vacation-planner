<script setup>
import { ArrowLeft, Calendar, ChevronsDownUp, ChevronsUpDown, MapPin, Users } from 'lucide-vue-next'

// The itinerary: where the trip form leads. The header is the trip as it was asked for (it needs no waiting: it comes from
// the address), then one card per day and a map. The plan is drafted by a language model and takes around 20 seconds, so the
// page shows the days as labelled placeholders while it waits; the destination's photo and description come from a faster
// lookup and fill in on their own. A day card folds (the plan opens with only the first day showing, so a long trip is a
// short page; "Expand all" opens them). A day's "Show on map" button, or its button on the map, puts its stops on the map
// and opens that day alone; pressing it again shows every day.
// Reading the model's reply is in utils/itinerary.js, the words in utils/itinerary-content.js, the map in components/trip/Map.vue.
const copy = itineraryContent
const route = useRoute()

const first = (value) => (Array.isArray(value) ? value[0] : value)

// ── the trip, as the form asked for it ──
const destination = computed(() => String(first(route.query.destination) ?? '').trim())
const start = computed(() => calendarDay(route.query.selectedStartDate))
const end = computed(() => calendarDay(route.query.selectedEndDate))
const length = computed(() => (start.value && end.value ? daysBetween(start.value, end.value) : 0))
const people = computed(() => Math.max(1, Math.round(Number(first(route.query.people))) || 1))
const interests = computed(() => interestsFrom(route.query.selectedPreferences))

// an address that does not describe a trip we can plan: no destination, no dates, or more days than the planner takes
const problem = computed(() => (!destination.value || length.value < 1 ? 'missing' : length.value > MAX_TRIP_DAYS ? 'tooLong' : ''))

const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const range = computed(() => {
  const [a, b] = [start.value, end.value]
  if (!a || !b) return ''
  return a.getFullYear() === b.getFullYear() ? `${dayMonth.format(a)} – ${dayMonth.format(b)} ${b.getFullYear()}` : `${dayMonth.format(a)} ${a.getFullYear()} – ${dayMonth.format(b)} ${b.getFullYear()}`
})

useSeoMeta({ title: () => copy.meta(destination.value).title, description: () => copy.meta(destination.value).description, robots: 'noindex' })

// ── what comes back ──
const status = ref(problem.value ? 'missing' : 'loading') // loading | ready | failed | limit | missing
const days = ref([])
const selected = ref(null) // index of the day on the map, or null for every day
const open = ref(new Set()) // indexes of the day cards that are showing their stops
const place = ref(null) // { description, imageUrl } from the destination lookup
const placeDone = ref(false)
const note = ref(null)
let attempt = 0

// typed in lower case ("kyoto, japan"), the name is capitalised for the heading; anything else is shown as typed
const title = computed(() => (destination.value === destination.value.toLowerCase() ? destination.value.replace(/(^|[\s,-])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase()) : destination.value))
const photo = computed(() => (place.value?.imageUrl && /^https?:\/\//i.test(place.value.imageUrl) ? place.value.imageUrl : ''))
const about = computed(() => (place.value?.description && place.value.description !== 'No description available' ? place.value.description : ''))
// the arch is there from the start with its flat stand-in, so the photo does not push the heading when it arrives
const showArch = computed(() => Boolean(photo.value) || !placeDone.value)
const stopCount = computed(() => days.value.reduce((sum, day) => sum + day.coordinates.length, 0))
const announcement = computed(() => (status.value === 'ready' ? `Your ${copy.days(days.value.length)} are ready. ${copy.stops(stopCount.value)} on the map.` : ''))
// the map sits beside the days only while there are days to show it for
const alone = computed(() => ['missing', 'failed', 'limit'].includes(status.value))

async function loadPlace(mine) {
  placeDone.value = false
  place.value = null
  try {
    const data = await $fetch('/api/GetLocationByName', { query: { destination: destination.value } })
    if (mine === attempt && data && !data.error) place.value = data
  } catch {
    // the page works without the header photo and description
  }
  if (mine === attempt) placeDone.value = true
}

async function load() {
  if (problem.value) return
  const mine = ++attempt
  status.value = 'loading'
  days.value = []
  selected.value = null
  open.value = new Set()
  loadPlace(mine)
  try {
    const preferences = interests.value.join(',')
    const reply = await $fetch('/api/GetItinerary', {
      query: { days: length.value, destination: destination.value, ...(preferences ? { selectedPreferences: preferences } : {}) },
      responseType: 'text',
    })
    if (mine !== attempt) return
    const parsed = parseItinerary(reply)
    if (!parsed.length) throw new Error('the reply was not a plan')
    days.value = parsed
    open.value = new Set([0])
    status.value = 'ready'
  } catch (error) {
    // 402: this account has used its free trips (an answer, not a failure: there is nothing to try again)
    if (mine === attempt) status.value = error?.statusCode === 402 ? 'limit' : 'failed'
  }
}

/** Try again: the button that was pressed goes away, so the keyboard moves on to the "drafting" note. */
async function retry() {
  load()
  await nextTick()
  note.value?.focus()
}

onMounted(() => {
  load()
  // the map library is large: fetch it while the plan is being drafted, so the map is there the moment the days are
  if (!problem.value) import('mapbox-gl').catch(() => {})
})

// ── the map ──
const mapCard = ref(null)
const presses = ref(0) // counts presses of a day button, so the map fits its view again even when the choice did not change
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pick(index) {
  selected.value = index
  presses.value++
  if (index === null) return
  // looking at one day: its card opens and the others close, so what is read is what is on the map
  open.value = new Set([index])
  if (window.matchMedia('(max-width: 979px)').matches) {
    // in the phone layout the map is above the days: bring it into view when a day is chosen from far below
    mapCard.value?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  } else {
    reveal(index)
  }
}
const toggleOnMap = (index) => pick(selected.value === index ? null : index)

// ── folding the day cards ──
const allOpen = computed(() => days.value.length > 0 && open.value.size === days.value.length)

function fold(index) {
  const next = new Set(open.value)
  if (!next.delete(index)) next.add(index)
  open.value = next
}
const foldAll = () => { open.value = allOpen.value ? new Set() : new Set(days.value.keys()) }

/**
 * In the wide layout the map stays pinned while the days scroll: after a day is chosen on the map, bring its card into view if
 * it is not. The map is only pinned while the days column is long enough, so never scroll further than the point where the
 * map would start to slide up with the page; a card that is then a little lower on the screen is still in view.
 */
async function reveal(index) {
  await nextTick()
  // the other cards are closing as this one opens: look where it ended up once they have settled
  if (!reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 380))
  const card = document.getElementById(`day-${days.value[index]?.number}`)
  const map = mapCard.value
  if (!card || !map) return
  const pinned = parseFloat(getComputedStyle(map).top) || 0 // where the map sits while it is pinned: just under the header
  const { top } = card.getBoundingClientRect()
  if (top >= pinned && top <= window.innerHeight - 200) return
  const wrap = map.parentElement
  const limit = wrap.getBoundingClientRect().bottom + window.scrollY - parseFloat(getComputedStyle(wrap).paddingBottom) - map.offsetHeight - pinned
  const target = Math.min(window.scrollY + top - pinned, limit)
  window.scrollTo({ top: Math.max(0, target), behavior: reducedMotion() ? 'auto' : 'smooth' })
}
</script>

<template>
  <div class="landing plan flex-grow">
    <div class="plan__wrap" :class="{ 'plan__wrap--alone': alone }">
      <header class="plan__head">
        <template v-if="status !== 'missing'">
          <NuxtLink class="plan__back" to="/vacationForm"><ArrowLeft aria-hidden="true" :stroke-width="2" />{{ copy.back }}</NuxtLink>
          <div class="plan__intro">
            <div class="plan__who">
              <h1>{{ title }}</h1>
              <ul class="plan__facts" :aria-label="copy.facts">
                <li class="fact"><Calendar aria-hidden="true" :stroke-width="1.75" />{{ range }} <span class="mono">{{ copy.days(length) }}</span></li>
                <li class="fact"><Users aria-hidden="true" :stroke-width="1.75" />{{ copy.people(people) }}</li>
                <li v-for="interest in interests" :key="interest" class="fact fact--plain">{{ interest }}</li>
              </ul>
            </div>
            <LandingPhoto v-if="showArch" class="plan__arch" shape="arch" standin="var(--vp-standin-3)" :src="photo" alt="" :width="600" :height="800" eager />
          </div>

          <div v-if="status === 'loading'" ref="note" class="plan__note" role="status" tabindex="-1">
            <p class="plan__note-title">{{ copy.loading.title }}</p>
            <p>{{ copy.loading.text }}</p>
          </div>
          <div v-else-if="status === 'failed'" class="plan__fail">
            <LandingAlert id="plan-failed">{{ copy.failed.text(title) }}</LandingAlert>
            <div class="plan__actions">
              <LandingButton size="lg" arrow @click="retry">{{ copy.failed.retry }}</LandingButton>
              <LandingButton to="/vacationForm" variant="ghost" size="lg">{{ copy.failed.change }}</LandingButton>
            </div>
          </div>

          <div v-else-if="status === 'limit'" class="plan__fail" role="status">
            <p class="plan__limit">{{ copy.limit.text(FREE_TRIPS) }}</p>
            <div class="plan__actions">
              <LandingButton to="/#pricing" size="lg" arrow>{{ copy.limit.cta }}</LandingButton>
              <LandingButton to="/vacationForm" variant="ghost" size="lg">{{ copy.limit.back }}</LandingButton>
            </div>
          </div>

          <p v-if="about" class="plan__about">{{ about }}</p>
        </template>
        <h1 v-else>{{ copy.missing.title }}</h1>
      </header>

      <section v-if="status === 'missing'" class="plan__days">
        <LandingCard>
          <div class="plan__empty">
            <p>{{ problem === 'tooLong' ? copy.missing.tooLong(MAX_TRIP_DAYS) : copy.missing.text }}</p>
            <LandingButton to="/vacationForm" size="lg" arrow>{{ copy.missing.cta }}</LandingButton>
          </div>
        </LandingCard>
      </section>

      <template v-else>
        <div v-if="!alone" ref="mapCard" class="plan__map">
          <div class="mapcard">
            <div v-if="status === 'ready'" class="mapcard__bar" role="group" :aria-label="copy.map.group">
              <button class="pick" type="button" :aria-pressed="selected === null" @click="pick(null)">{{ copy.map.all }}</button>
              <button v-for="(day, i) in days" :key="day.number" class="pick" type="button" :aria-pressed="selected === i" :disabled="!day.coordinates.length" @click="pick(i)">
                <span class="pick__dot" :class="`pick__dot--${toneOfDay(i)}`" aria-hidden="true" />{{ copy.day.label(day.number) }}
              </button>
            </div>
            <div class="mapcard__map">
              <TripMap v-if="status === 'ready'" :days="days" :selected="selected" :refit="presses" />
              <div v-else class="mapcard__wait">
                <span class="mapcard__tile"><MapPin aria-hidden="true" :stroke-width="1.75" /></span>
                <p>{{ copy.loading.map }}</p>
              </div>
            </div>
          </div>
        </div>

        <section v-if="!alone" class="plan__days" :aria-busy="status === 'loading'">
          <p class="sr-only" role="status">{{ announcement }}</p>
          <template v-if="status === 'loading'">
            <TripDay v-for="n in length" :key="n" :number="n" :tone="toneOfDay(n - 1)" />
          </template>
          <template v-else>
            <div v-if="days.length > 1" class="plan__fold">
              <p class="plan__count mono">{{ copy.days(days.length) }} · {{ copy.stops(stopCount) }}</p>
              <button class="plan__foldall" type="button" @click="foldAll">
                <component :is="allOpen ? ChevronsDownUp : ChevronsUpDown" aria-hidden="true" :stroke-width="1.75" />{{ allOpen ? copy.fold.collapse : copy.fold.expand }}
              </button>
            </div>
            <TripDay
              v-for="(day, i) in days"
              :key="day.number"
              :number="day.number"
              :day="day"
              :tone="toneOfDay(i)"
              :open="open.has(i)"
              :selected="selected === i"
              @toggle="fold(i)"
              @show="toggleOnMap(i)"
            />
          </template>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.plan { --bar: var(--app-bar, 66px); }
.plan__wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: 'head map' 'days map'; grid-template-rows: auto 1fr; gap: 28px clamp(24px, 3.5vw, 48px); align-items: start; max-width: var(--vp-wrap); margin: 0 auto; padding: 16px var(--vp-pad) clamp(48px, 7vw, 96px); }
.plan__wrap--alone { grid-template-columns: minmax(0, 640px); grid-template-areas: 'head' 'days'; grid-template-rows: auto; row-gap: 0; }
.plan__wrap--alone .plan__days { margin-top: 28px; }
.plan__head { grid-area: head; min-width: 0; padding-top: calc(clamp(20px, 3vw, 36px) - 16px); } /* the wide layout's 16px top is where the pinned map starts */
.plan__days { grid-area: days; display: grid; gap: 14px; min-width: 0; }
.plan__fold { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: -4px; }
.plan__count { margin: 0; color: var(--vp-ink-3); font-size: 12px; }
.plan__foldall { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 4px 0 8px; border: 0; background: none; color: var(--vp-blue-deep); font: 600 14.5px/1 var(--vp-font); cursor: pointer; transition: color .2s; }
.plan__foldall:hover { color: var(--vp-blue); }
.plan__foldall svg { width: 18px; height: 18px; }
.plan__map { grid-area: map; position: sticky; top: calc(var(--bar) + 16px); height: calc(100vh - var(--bar) - 32px); min-height: 440px; scroll-margin-top: calc(var(--bar) + 12px); }

.plan__back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; padding-block: 6px; color: var(--vp-ink-2); font: 500 15px/1 var(--vp-font); text-decoration: none; transition: color .2s; }
.plan__back:hover { color: var(--vp-blue); }
.plan__back svg { width: 18px; height: 18px; }

.plan__intro { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: end; }
.plan__who { min-width: 0; }
.plan h1 { margin: 0; font: 800 clamp(2.2rem, 4.6vw, 3.4rem)/1.03 var(--vp-font); letter-spacing: -.025em; text-wrap: balance; overflow-wrap: anywhere; }
.plan__facts { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; padding: 0; list-style: none; }
.fact { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px 9px 12px; border-radius: 999px; background: var(--vp-wash); color: var(--vp-ink); font: 600 14.5px/1 var(--vp-font); }
.fact svg { width: 16px; height: 16px; color: var(--vp-blue); }
.fact .mono { margin-left: 2px; color: var(--vp-blue-deep); font-size: 12px; white-space: nowrap; }
.fact--plain { padding-left: 14px; background: var(--vp-paper); color: var(--vp-ink-2); font-weight: 500; }
.plan__arch { width: clamp(104px, 10vw, 136px); aspect-ratio: 3 / 4; }
.plan__about { max-width: 54ch; margin: 22px 0 0; color: var(--vp-ink-2); text-wrap: pretty; }

.plan__note { margin-top: 22px; color: var(--vp-ink-2); font: 400 15px/1.5 var(--vp-font); }
.plan__note p { margin: 0; }
.plan__note .plan__note-title { color: var(--vp-ink); font: 700 17px/1.3 var(--vp-font); letter-spacing: -.015em; }
.plan__empty { display: grid; gap: 18px; color: var(--vp-ink-2); }
.plan__empty p { margin: 0; }
.plan__empty .btn { justify-self: start; }
.plan__fail { display: grid; gap: 16px; margin-top: 22px; }
.plan__limit { margin: 0; padding: 14px 16px; border: 1px solid var(--vp-line); border-radius: var(--vp-radius); background: var(--vp-paper); color: var(--vp-ink); font: 500 15px/1.5 var(--vp-font); }
.plan__actions { display: flex; flex-wrap: wrap; gap: 12px; }

/* the map card: a hairline card holding the day buttons and the map */
.mapcard { display: flex; flex-direction: column; height: 100%; border: 1px solid var(--vp-line); border-radius: 12px; background: #fff; overflow: hidden; }
.mapcard__bar { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; padding: 12px; border-bottom: 1px solid var(--vp-line); }
.mapcard__map { position: relative; flex: 1; min-height: 0; }
.mapcard__wait { display: grid; place-content: center; justify-items: center; gap: 14px; height: 100%; padding: 24px; background: var(--vp-paper); color: var(--vp-ink-2); text-align: center; }
.mapcard__wait p { max-width: 26ch; margin: 0; font: 400 15px/1.5 var(--vp-font); }
.mapcard__tile { display: grid; place-items: center; width: 48px; height: 48px; border-radius: var(--vp-radius); background: var(--vp-wash); color: var(--vp-blue); }
.mapcard__tile svg { width: 24px; height: 24px; }

/* the day buttons: the trip form's chip; the dot is the day's pill colour, the colour of its stops on the map */
.pick { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 6px; border: 1px solid color-mix(in srgb, var(--vp-ink-3) 75%, #fff); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); font: 600 14px/1 var(--vp-font); white-space: nowrap; cursor: pointer; transition: background-color .25s var(--vp-ease), border-color .25s var(--vp-ease), color .25s var(--vp-ease); }
.pick:hover:not(:disabled):not([aria-pressed="true"]) { border-color: var(--vp-blue); color: var(--vp-blue); }
.pick[aria-pressed="true"] { border-color: var(--vp-blue); background: var(--vp-blue); color: #fff; }
.pick:disabled { border-color: var(--vp-line); color: var(--vp-ink-3); opacity: .55; cursor: default; }
.pick__dot { width: 10px; height: 10px; border: 1.5px solid rgba(15, 26, 54, .18); border-radius: 50%; }
.pick[aria-pressed="true"] .pick__dot { border-color: #fff; }
.pick__dot--blue { background: var(--vp-blue); }
.pick__dot--coral { background: var(--vp-coral); }
.pick__dot--peach { background: var(--vp-peach); }

/* under 980px the map sits above the days, in the page's flow */
@media (max-width: 979px) {
  .plan__wrap { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'head' 'map' 'days'; grid-template-rows: auto; gap: 24px; padding-top: clamp(20px, 3vw, 36px); }
  .plan__wrap--alone { grid-template-areas: 'head' 'days'; }
  .plan__head { padding-top: 0; }
  .plan__map { position: relative; top: auto; height: auto; min-height: 0; }
  .mapcard { height: auto; }
  .mapcard__map { flex: none; height: clamp(360px, 56vh, 520px); }
}
@media (max-width: 560px) {
  /* the arch stays beside the name; the chips take the full width under both, so they never wrap beside it */
  .plan__intro { grid-template-areas: 'title arch' 'facts facts'; gap: 0 14px; }
  .plan__who { display: contents; }
  .plan h1 { grid-area: title; }
  .plan__facts { grid-area: facts; margin-top: 16px; }
  .plan__arch { grid-area: arch; width: 92px; }
  .fact { padding: 8px 12px 8px 10px; font-size: 14px; }
}
</style>
