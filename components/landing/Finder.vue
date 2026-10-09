<script setup>
import { Calendar, Compass, MapPin, Users } from 'lucide-vue-next' // Compass is a field icon (Interests)

// The search-style card that straddles the hero's bottom edge. It is deliberately NOT a form: the fields are
// read-only sample text and the only action is a link to the real trip form (cta.to).
//   plan  { fields: [{ icon, label, value, note? }] }
//   cta   { label, to }
defineProps({
  label: { type: String, default: 'Start a trip' },
  plan: { type: Object, required: true },
  cta: { type: Object, required: true },
})

const icons = { pin: MapPin, calendar: Calendar, compass: Compass, users: Users }
</script>

<template>
  <section class="finder" :aria-label="label">
    <div class="finder__card">
      <div class="pane">
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
    </div>
  </section>
</template>

<style scoped>
.finder { position: relative; z-index: 3; max-width: var(--vp-wrap); margin: -78px auto 0; padding: 0 var(--vp-pad); }
.finder__card { background: #fff; border-radius: 14px; padding: clamp(18px, 2.4vw, 28px) clamp(14px, 2vw, 24px); box-shadow: 0 34px 70px -28px rgba(15, 26, 54, .45), 0 10px 22px -12px rgba(15, 26, 54, .22); }
.pane { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 14px clamp(14px, 2vw, 28px); }

.fields { display: grid; grid-template-columns: 1.15fr 1fr 1.2fr .85fr; margin: 0; padding: 0; list-style: none; }
.fields li { display: flex; align-items: flex-start; gap: 12px; padding: 4px clamp(10px, 1.4vw, 20px); border-left: 1px solid var(--vp-line); min-width: 0; }
.fields li:first-child { border-left: 0; padding-left: 4px; }
.ico { flex: none; display: grid; place-items: center; width: 40px; height: 40px; margin-top: 2px; border-radius: 8px; background: var(--vp-wash); color: var(--vp-blue); }
.ico svg { width: 20px; height: 20px; }
.fields .k { display: block; color: var(--vp-ink-3); }
.fields b { display: block; font: 600 15.5px/1.3 var(--vp-font); }
.fields i { display: block; margin: 0; font-style: normal; font-size: 13px; color: var(--vp-ink-3); }

@media (min-width: 1181px) {
  .fields li:nth-child(1) b, .fields li:nth-child(2) b, .fields li:nth-child(4) b { white-space: nowrap; }
}
@media (max-width: 1180px) {
  .fields { grid-template-columns: 1fr 1fr; row-gap: 14px; }
  .fields li:nth-child(odd) { border-left: 0; padding-left: 4px; }
  .pane { grid-template-columns: minmax(0, 1fr); }
  .pane .btn { justify-self: stretch; }
}
@media (max-width: 560px) {
  .fields .ico { display: none; }
  .fields li, .fields li:first-child { border-left: 0; padding-left: 4px; }
}
</style>
