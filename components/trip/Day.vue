<script setup>
import { MapPin } from 'lucide-vue-next'

// One day of the plan, as a hairline card: the day's pill (blue, coral or peach, the colour its stops wear on the map), its
// title, how many stops it has, and its stops numbered like their markers. The whole head is a button: pressing it shows
// this day's stops on the map, pressing it again goes back to every day.
// While the plan is being drafted the card is a placeholder: the pill is real (the number of days is known from the dates),
// the rest is shaped like what is coming.
//   number    1-based day number
//   day       a day from parseItinerary(), or null while the plan is still being drafted
//   tone      'blue' | 'coral' | 'peach'
//   selected  this day's stops are the ones on the map
const props = defineProps({
  number: { type: Number, required: true },
  day: { type: Object, default: null },
  tone: { type: String, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['toggle'])

const copy = itineraryContent.day
const pending = computed(() => !props.day)
const stops = computed(() => props.day?.coordinates.length ?? 0)
</script>

<template>
  <section class="day" :class="{ 'day--on': selected }" :aria-busy="pending || undefined">
    <h2 class="day__head">
      <button v-if="!pending && stops" class="day__row day__btn" type="button" :aria-pressed="selected" @click="$emit('toggle')">
        <LandingPill :tone="tone">{{ copy.label(number) }}</LandingPill>
        <span class="day__title">{{ day.title }}</span>
        <span class="day__meta mono">{{ itineraryContent.stops(stops) }}</span>
        <span class="day__action"><MapPin aria-hidden="true" :stroke-width="1.75" />{{ selected ? copy.showing : copy.show }}</span>
      </button>
      <div v-else class="day__row">
        <LandingPill :tone="tone">{{ copy.label(number) }}</LandingPill>
        <span v-if="day" class="day__title">{{ day.title }}</span>
        <span v-else class="sk sk--title" aria-hidden="true" />
        <span v-if="day" class="day__meta mono">{{ copy.noMap }}</span>
      </div>
    </h2>

    <ol v-if="day && day.items.length" class="day__list">
      <template v-for="(item, i) in day.items" :key="i">
        <li v-if="item.kind === 'stop'" class="stop">
          <span v-if="item.number" class="stop__n">{{ item.number }}</span>
          <span v-else class="stop__n stop__n--dot" aria-hidden="true" />
          <div>
            <p class="stop__name">{{ item.name }}</p>
            <p v-if="item.text" class="stop__text">{{ item.text }}</p>
          </div>
        </li>
        <li v-else-if="item.kind === 'heading'" class="sub mono">{{ item.text }}</li>
        <li v-else class="note"><p>{{ item.text }}</p></li>
      </template>
    </ol>
    <div v-else-if="pending" class="day__list" aria-hidden="true">
      <div v-for="row in 3" :key="row" class="stop stop--sk">
        <span class="stop__n stop__n--sk" />
        <div><span class="sk sk--name" /><span class="sk sk--line" /></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.day { border: 1px solid var(--vp-line); border-radius: 12px; background: #fff; overflow: hidden; transition: border-color .25s var(--vp-ease); }
.day--on { border-color: var(--vp-blue); }
.day__head { margin: 0; font: inherit; }
.day__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 2px 14px; width: 100%; padding: 16px 18px; text-align: left; }
.day__btn { border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; transition: background-color .25s var(--vp-ease); }
.day__btn:hover { background: var(--vp-paper); }
.day--on .day__btn { background: var(--vp-wash); }
.day__btn:focus-visible { outline-offset: -3px; }
.day__title { font: 700 clamp(1.1rem, 1.5vw, 1.25rem)/1.25 var(--vp-font); letter-spacing: -.015em; color: var(--vp-ink); }
.day__meta { grid-column: 2; color: var(--vp-ink-3); font-size: 12px; }
.day__action { grid-column: 3; grid-row: 1 / span 2; display: inline-flex; align-items: center; gap: 6px; color: var(--vp-blue-deep); font: 600 14px/1 var(--vp-font); white-space: nowrap; }
.day__action svg { width: 18px; height: 18px; }

.day__list { margin: 0; padding: 0 18px 6px; list-style: none; border-top: 1px solid var(--vp-line); }
.stop { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 14px; padding: 14px 0; border-top: 1px solid var(--vp-line); }
.day__list > :first-child { border-top: 0; }
.stop__n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--vp-wash); color: var(--vp-blue-deep); font: 800 13px/1 var(--vp-font); font-variant-numeric: tabular-nums; transition: background-color .25s var(--vp-ease), color .25s var(--vp-ease); }
.day--on .stop__n { background: var(--vp-blue); color: #fff; }
.stop__n--dot { background: transparent; }
.stop__n--dot::before { content: ""; width: 8px; height: 8px; border: 1.5px solid var(--vp-ink-3); border-radius: 50%; }
.day--on .stop__n--dot { background: transparent; }
.stop__name { margin: 0; color: var(--vp-ink); font: 700 16px/1.35 var(--vp-font); }
.stop__text { margin: 4px 0 0; color: var(--vp-ink-2); font-size: 15px; line-height: 1.55; }
.sub { margin: 0; padding: 14px 0 2px 42px; border-top: 1px solid var(--vp-line); color: var(--vp-ink-3); font-size: 12px; }
.note { padding: 12px 0 12px 42px; border-top: 1px solid var(--vp-line); color: var(--vp-ink-2); font-size: 15px; line-height: 1.55; }
.note p { margin: 0; }

/* placeholders: wash bars the shape of what is coming; they breathe while the plan is drafted */
.sk { display: block; border-radius: 6px; background: var(--vp-wash); animation: breathe 1.8s ease-in-out infinite; }
.sk--title { width: min(60%, 260px); height: 20px; }
.sk--name { width: min(46%, 180px); height: 16px; }
.sk--line { width: 88%; height: 13px; margin-top: 10px; }
.stop__n--sk { background: var(--vp-wash); animation: breathe 1.8s ease-in-out infinite; }
@keyframes breathe { 50% { opacity: .5; } }

@media (max-width: 560px) {
  .day__row { grid-template-columns: auto minmax(0, 1fr); padding: 14px 14px; }
  .day__action { grid-column: 1 / -1; grid-row: auto; margin-top: 8px; }
  .day__meta { grid-column: 2; }
  .day__list { padding: 0 14px 4px; }
  .sub, .note { padding-left: 42px; }
}
</style>
