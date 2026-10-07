<script setup>
import { ref } from 'vue'
import { Calendar, Compass, MapPin, Users } from 'lucide-vue-next'

// The search-style card that straddles the hero's bottom edge. It is deliberately NOT a form: the fields are
// read-only sample text and the only action is a link to the real trip form (cta.to).
//   plan    { tab, head: [left, right], fields: [{ icon, label, value, note? }] }
//   sample  { tab, head: [left, right], days: [{ tone, pill, title, meta }] }
//   cta     { label, to }
defineProps({
  label: { type: String, default: 'Start a trip' },
  tabsLabel: { type: String, default: 'Demo views' },
  plan: { type: Object, required: true },
  sample: { type: Object, required: true },
  cta: { type: Object, required: true },
})

const icons = { pin: MapPin, calendar: Calendar, compass: Compass, users: Users }

// A real tablist: roving tabindex, ArrowLeft/ArrowRight wrap and move focus, one panel per tab (hidden when inactive).
const active = ref('plan')
const planTab = ref(null)
const sampleTab = ref(null)
const order = ['plan', 'sample']

function select(key, focus = false) {
  active.value = key
  if (focus) (key === 'plan' ? planTab : sampleTab).value?.focus()
}

function onKeydown(event, key) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  select(order[(order.indexOf(key) + step + order.length) % order.length], true)
}
</script>

<template>
  <section class="finder" :aria-label="label">
    <div class="finder__tabs" role="tablist" :aria-label="tabsLabel">
      <button
        id="tab-plan"
        ref="planTab"
        class="ftab"
        type="button"
        role="tab"
        aria-controls="pane-plan"
        :aria-selected="active === 'plan'"
        :tabindex="active === 'plan' ? 0 : -1"
        @click="select('plan')"
        @keydown="onKeydown($event, 'plan')"
      >
        <Compass aria-hidden="true" :stroke-width="1.75" />{{ plan.tab }}
      </button>
      <button
        id="tab-sample"
        ref="sampleTab"
        class="ftab"
        type="button"
        role="tab"
        aria-controls="pane-sample"
        :aria-selected="active === 'sample'"
        :tabindex="active === 'sample' ? 0 : -1"
        @click="select('sample')"
        @keydown="onKeydown($event, 'sample')"
      >
        <Calendar aria-hidden="true" :stroke-width="1.75" />{{ sample.tab }}
      </button>
    </div>

    <div class="finder__card">
      <div id="pane-plan" class="pane" role="tabpanel" aria-labelledby="tab-plan" :hidden="active !== 'plan'">
        <p class="finder__head mono"><span>{{ plan.head[0] }}</span><span>{{ plan.head[1] }}</span></p>
        <ul class="fields">
          <li v-for="field in plan.fields" :key="field.label">
            <span class="ico"><component :is="icons[field.icon]" aria-hidden="true" :stroke-width="1.75" /></span>
            <span>
              <span class="k mono">{{ field.label }}</span>
              <b>{{ field.value }}</b>
              <i v-if="field.note">{{ field.note }}</i>
            </span>
          </li>
        </ul>
        <LandingButton :to="cta.to" size="lg" arrow>{{ cta.label }}</LandingButton>
      </div>

      <div id="pane-sample" class="pane" role="tabpanel" aria-labelledby="tab-sample" :hidden="active !== 'sample'">
        <p class="finder__head mono"><span>{{ sample.head[0] }}</span><span>{{ sample.head[1] }}</span></p>
        <ul class="days">
          <li v-for="day in sample.days" :key="day.pill">
            <LandingPill :tone="day.tone">{{ day.pill }}</LandingPill>
            <b>{{ day.title }}</b>
            <i>{{ day.meta }}</i>
          </li>
        </ul>
        <LandingButton :to="cta.to" size="lg" arrow>{{ cta.label }}</LandingButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.finder { position: relative; z-index: 3; max-width: var(--vp-wrap); margin: -118px auto 0; padding: 0 var(--vp-pad); }
.finder__tabs { display: flex; gap: 6px; padding-left: 8px; }
.ftab { display: inline-flex; align-items: center; gap: 9px; padding: 13px 20px 12px; border: 0; border-radius: 12px 12px 0 0; background: rgba(233, 238, 255, .96); color: var(--vp-ink-2); font: 600 15px/1 var(--vp-font); cursor: pointer; transition: background-color .25s, color .25s; }
.ftab svg { width: 18px; height: 18px; }
.ftab[aria-selected="true"] { background: var(--vp-blue); color: #fff; }
.ftab:not([aria-selected="true"]):hover { background: #fff; color: var(--vp-blue); }
.finder__card { background: #fff; border-radius: 4px 14px 14px 14px; padding: 6px clamp(14px, 2vw, 24px) clamp(14px, 2vw, 24px); box-shadow: 0 34px 70px -28px rgba(15, 26, 54, .45), 0 10px 22px -12px rgba(15, 26, 54, .22); }
.finder__head { grid-column: 1 / -1; display: flex; justify-content: space-between; gap: 12px; padding: 12px 6px 12px; color: var(--vp-ink-3); border-bottom: 1px solid var(--vp-line); }
.finder__head span:first-child { color: #b8431f; }
.pane { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 14px clamp(14px, 2vw, 28px); }
.pane[hidden] { display: none; }

.fields { display: grid; grid-template-columns: 1.15fr 1fr 1.2fr .85fr; margin: 0; padding: 0; list-style: none; }
.fields li { display: flex; align-items: flex-start; gap: 12px; padding: 4px clamp(10px, 1.4vw, 20px); border-left: 1px solid var(--vp-line); min-width: 0; }
.fields li:first-child { border-left: 0; padding-left: 4px; }
.ico { flex: none; display: grid; place-items: center; width: 40px; height: 40px; margin-top: 2px; border-radius: 8px; background: var(--vp-wash); color: var(--vp-blue); }
.ico svg { width: 20px; height: 20px; }
.fields .k { display: block; color: var(--vp-ink-3); }
.fields b { display: block; font: 600 15.5px/1.3 var(--vp-font); }
.fields i { display: block; margin: 0; font-style: normal; font-size: 13px; color: var(--vp-ink-3); }

.days { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; padding: 0; list-style: none; }
.days li { display: grid; gap: 4px; justify-items: start; padding: 4px clamp(10px, 1.6vw, 24px); border-left: 1px solid var(--vp-line); }
.days li:first-child { border-left: 0; padding-left: 4px; }
.days b { font: 600 16px/1.3 var(--vp-font); }
.days i { font-style: normal; font-size: 13.5px; color: var(--vp-ink-3); }

@media (min-width: 1181px) {
  .fields li:nth-child(1) b, .fields li:nth-child(2) b, .fields li:nth-child(4) b { white-space: nowrap; }
}
@media (max-width: 1180px) {
  .fields { grid-template-columns: 1fr 1fr; row-gap: 14px; }
  .fields li:nth-child(odd) { border-left: 0; padding-left: 4px; }
  .pane { grid-template-columns: minmax(0, 1fr); }
  .pane .btn { justify-self: stretch; }
}
@media (max-width: 980px) {
  .days { grid-template-columns: minmax(0, 1fr); row-gap: 14px; }
  .days li, .days li:first-child { border-left: 0; padding-left: 4px; }
}
@media (max-width: 560px) {
  .fields .ico { display: none; }
  .fields li, .fields li:first-child { border-left: 0; padding-left: 4px; }
  .ftab { padding-inline: 14px; font-size: 14px; }
}
</style>
