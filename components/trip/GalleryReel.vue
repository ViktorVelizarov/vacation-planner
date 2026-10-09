<script setup>
import { Pause, Play } from 'lucide-vue-next'

// Version 3 of the photos beside the trip form: one tall arch that turns through the photographs, with a caption in the
// mono voice and a tray of thumbnails under it to pick one. It turns by itself every few seconds (not at all when the
// visitor asks for reduced motion), stops while the pointer or the keyboard is on it, and has a pause button.
//   photos  [{ place, coords, src, width, height }]
const props = defineProps({ photos: { type: Array, required: true }, seconds: { type: Number, default: 5 } })

const current = ref(0)
const paused = ref(false) // the visitor pressed pause (or asked for reduced motion)
const holding = ref(false) // the pointer or the focus is on the reel
let timer = null

const label = computed(() => `${String(current.value + 1).padStart(2, '0')} / ${String(props.photos.length).padStart(2, '0')}`)

function stop() {
  clearInterval(timer)
  timer = null
}
function start() {
  stop()
  if (!paused.value && !holding.value) timer = setInterval(() => { current.value = (current.value + 1) % props.photos.length }, props.seconds * 1000)
}
function show(index) {
  current.value = index
  start() // the clock starts over from the picked photograph
}

onMounted(() => {
  paused.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  start()
})
onBeforeUnmount(stop)
watch([paused, holding], start)
</script>

<template>
  <div class="reel" @pointerenter="holding = true" @pointerleave="holding = false" @focusin="holding = true" @focusout="holding = false">
    <LandingPhoto class="reel__arch" shape="arch">
      <img
        v-for="(photo, i) in photos"
        :key="photo.place"
        class="reel__img"
        :class="{ 'reel__img--on': i === current }"
        :src="photo.src"
        :width="photo.width"
        :height="photo.height"
        alt=""
        :loading="i === 0 ? 'eager' : 'lazy'"
      >
    </LandingPhoto>

    <p class="reel__cap mono">
      <span class="reel__count">{{ label }}</span>
      <span>{{ photos[current].place }} · {{ photos[current].coords }}</span>
    </p>

    <div class="reel__tray" role="group" aria-label="Pick a photograph">
      <button
        v-for="(photo, i) in photos"
        :key="photo.place"
        class="reel__thumb"
        type="button"
        :aria-label="photo.place"
        :aria-pressed="i === current"
        @click="show(i)"
      >
        <LandingPhoto class="reel__thumb-photo" :src="photo.src" alt="" :width="120" :height="120" />
      </button>
      <button class="reel__pause" type="button" :aria-label="paused ? 'Play the photographs' : 'Pause the photographs'" :aria-pressed="paused" @click="paused = !paused">
        <component :is="paused ? Play : Pause" aria-hidden="true" :stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.reel { display: grid; gap: 16px; width: 100%; }
.reel__arch { width: 100%; aspect-ratio: 3 / 4; }
.reel__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .9s var(--vp-ease); }
.reel__img--on { opacity: 1; }
.reel__cap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 16px; margin: 0; padding: 0 4px; color: var(--vp-ink-3); }
.reel__count { color: var(--vp-blue); }
.reel__tray { display: flex; align-items: center; gap: 8px; }
.reel__thumb { flex: 1 1 0; min-width: 0; padding: 0; border: 2px solid transparent; border-radius: 10px; background: none; cursor: pointer; transition: border-color .25s var(--vp-ease); }
.reel__thumb-photo { width: 100%; aspect-ratio: 1; border-radius: 7px; opacity: .72; transition: opacity .25s var(--vp-ease); }
.reel__thumb:hover .reel__thumb-photo { opacity: 1; }
.reel__thumb[aria-pressed="true"] { border-color: var(--vp-blue); }
.reel__thumb[aria-pressed="true"] .reel__thumb-photo { opacity: 1; }
.reel__pause { flex: none; display: grid; place-items: center; width: 44px; height: 44px; margin-left: 4px; border: 1px solid color-mix(in srgb, var(--vp-ink-3) 75%, #fff); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); cursor: pointer; }
.reel__pause:hover { border-color: var(--vp-blue); color: var(--vp-blue); }
.reel__pause svg { width: 18px; height: 18px; }
</style>
