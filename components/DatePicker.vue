<script setup lang="ts">
import { type Ref, computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DateFormatter, getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import { ChevronDown } from 'lucide-vue-next'
import type { DateRange } from 'radix-vue'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// The trip form's date field: a trigger drawn like the other controls on the form (it reads back the range the way the
// home page's search card does, "12 Oct – 14 Oct 2026" and "3 days") and a popover with the shadcn range calendar,
// themed to the Blue Arch world. It starts empty, and it tells the form the range once it is complete (the calendar
// itself only reports whole ranges), so the form never holds a range the trigger is not showing.
// The calendar will not let a range run longer than MAX_TRIP_DAYS (once a start is picked, dates too far from it are
// switched off) or start before today. It shows one month on phones and two beside each other elsewhere, and closes
// when the range is complete.
//   id, invalid, describedby, labelledby   for the trigger button (focus, error state, the field's key and error)
const props = defineProps<{
  id: string
  invalid?: boolean
  describedby?: string
  labelledby?: string
}>()

const emit = defineEmits<{ 'update:selectedDateRange': [start: Date | null, end: Date | null] }>()

const copy = tripContent.dates
const timeZone = getLocalTimeZone()
const dayMonth = new DateFormatter('en-GB', { day: 'numeric', month: 'short' })
const show = (date: DateValue) => dayMonth.format(date.toDate(timeZone))

const value = ref({ start: undefined, end: undefined }) as Ref<DateRange>
const open = ref(false)
const earliest = ref(today(timeZone)) // re-read each time the popover opens, so a page left open overnight stays right

const days = computed(() => (value.value.start && value.value.end ? value.value.end.compare(value.value.start) + 1 : 0))
const text = computed(() => {
  const { start, end } = value.value
  if (!start || !end) return copy.empty
  return start.year === end.year ? `${show(start)} – ${show(end)} ${end.year}` : `${show(start)} ${start.year} – ${show(end)} ${end.year}`
})

// The day the visitor has just picked as the start of a new range, until the range is complete or the popover closes.
const picking = ref<DateValue | undefined>()

// After a start is picked, a day more than MAX_TRIP_DAYS - 1 days away (either side) cannot be the end of the trip.
function tooFar(date: DateValue) {
  return Boolean(picking.value && Math.abs(date.compare(picking.value)) > MAX_TRIP_DAYS - 1)
}

watch(value, ({ start, end }) => {
  emit('update:selectedDateRange', start ? start.toDate(timeZone) : null, end ? end.toDate(timeZone) : null)
  picking.value = undefined
  if (start && end) open.value = false
})
watch(open, (isOpen) => {
  if (isOpen) earliest.value = today(timeZone)
  else picking.value = undefined
})

// two months side by side need about 560px; under 640px of screen the calendar shows one
const months = ref(2)
let narrow: MediaQueryList | undefined
const sync = () => { months.value = narrow?.matches ? 1 : 2 }
onMounted(() => {
  narrow = window.matchMedia('(max-width: 639px)')
  sync()
  narrow.addEventListener('change', sync)
})
onBeforeUnmount(() => narrow?.removeEventListener('change', sync))
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        :id="props.id"
        class="dp"
        :class="{ 'dp--empty': !value.start }"
        type="button"
        :aria-invalid="props.invalid ? 'true' : undefined"
        :aria-describedby="props.describedby"
        :aria-labelledby="props.labelledby ? `${props.labelledby} ${props.id}` : undefined"
      >
        <span class="dp__text">{{ text }}</span>
        <span v-if="days" class="dp__note mono">{{ copy.days(days) }}</span>
        <ChevronDown class="dp__chev" aria-hidden="true" :stroke-width="1.75" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="landing trip-popover" align="start" :side-offset="8">
      <RangeCalendar
        v-model="value"
        initial-focus
        weekday-format="short"
        :calendar-label="copy.calendarLabel"
        :min-value="earliest"
        :number-of-months="months"
        :is-date-unavailable="tooFar"
        @update:start-value="picking = $event"
      />
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.dp { display: flex; align-items: center; gap: 12px; width: 100%; height: 48px; padding: 0 14px; border: 1px solid var(--tf-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); font: 400 16px/1.2 var(--vp-font); text-align: left; cursor: pointer; transition: border-color .25s var(--vp-ease); }
.dp:hover { border-color: var(--vp-ink-3); }
.dp[data-state="open"] { border-color: var(--vp-blue); }
.dp--empty .dp__text { color: var(--vp-ink-3); }
.dp[aria-invalid="true"], .dp[aria-invalid="true"]:hover { border-color: var(--tf-alert); }
.dp__text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dp__note { flex: none; color: var(--vp-blue-deep); }
.dp__chev { flex: none; width: 18px; height: 18px; color: var(--vp-ink-3); }
</style>

<!-- The popover is teleported to <body>, outside this component and outside the page's scope, so its theme is global but
     namespaced to .trip-popover. The shadcn calendar paints itself from the shadcn colour tokens (primary, accent,
     muted-foreground...); setting them here, for this popover only, turns its navy into the world's royal blue. -->
<style>
.trip-popover.trip-popover {
  --primary: 228 78% 55.5%;
  --primary-foreground: 0 0% 100%;
  --accent: 226 100% 95.7%;
  --accent-foreground: 229 65% 43.7%;
  --muted: 226 100% 95.7%;
  --muted-foreground: 222 17% 46%;
  --destructive-foreground: 222 17% 46%;
  --input: 222 17% 62%;
  --ring: 228 78% 55.5%;
  --tf-edge: color-mix(in srgb, var(--vp-ink-3) 75%, #fff);
  width: auto;
  padding: 8px;
  border: 1px solid var(--vp-line);
  border-radius: 14px;
  background: #fff;
  color: var(--vp-ink);
  box-shadow: 0 34px 70px -28px rgba(15, 26, 54, .45), 0 10px 22px -12px rgba(15, 26, 54, .22);
}
/* header: the months in the title weight, and square 36px page buttons with a visible edge */
.trip-popover [role="heading"] { font: 700 15px/1.2 var(--vp-font); letter-spacing: -.01em; }
.trip-popover button[aria-label$="page"] { width: 36px; height: 36px; border: 1px solid var(--tf-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); opacity: 1; transition: border-color .25s var(--vp-ease), color .25s var(--vp-ease); }
.trip-popover button[aria-label$="page"]:hover:not(:disabled) { border-color: var(--vp-blue); background: #fff; color: var(--vp-blue); }
.trip-popover button[aria-label$="page"]:disabled { border-color: var(--vp-line); color: var(--vp-ink-3); opacity: .55; }
/* weekday keys are data-like: the mono label voice */
.trip-popover th { width: 40px; font: 500 11px/1.5 var(--vp-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--vp-ink-3); }
/* day cells: 40px for a thumb, tabular figures, the chosen ends in royal blue and the days between in the wash */
.trip-popover td { width: 40px; height: 40px; }
.trip-popover td [role="button"] { width: 40px; height: 40px; border-radius: var(--vp-radius); font: 500 14px/1 var(--vp-font); font-variant-numeric: tabular-nums; }
.trip-popover td [data-selected]:not([data-selection-start]):not([data-selection-end]) { color: var(--vp-blue-deep); }
.trip-popover td [data-today]:not([data-selected]) { background: transparent; color: var(--vp-blue-deep); box-shadow: inset 0 0 0 1px var(--vp-blue); }
/* days too far from the start to end a trip of at most MAX_TRIP_DAYS: switched off, not struck through */
.trip-popover td [data-unavailable] { color: var(--vp-ink-3); text-decoration: none; opacity: .35; pointer-events: none; }
@media (prefers-reduced-motion: reduce) {
  .trip-popover.trip-popover { animation: none !important; }
}
</style>
