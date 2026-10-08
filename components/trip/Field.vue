<script setup>
import { CircleAlert } from 'lucide-vue-next'

// One question on the trip form, drawn like a field of the home page's search card: a wash tile with a blue line icon, a
// mono key above, then the control. The control goes in the default slot and finds its colours in the custom properties
// set here, so every control on the form has the same visible edge.
//   id        base for the ids this field owns (the key, the error)
//   icon      a lucide icon component for the tile
//   label     the key ("Destination")
//   labelFor  the id of a single control the key labels; leave it out for a group of controls (the key then names the
//             group: give the group aria-labelledby="<id>-key")
//   note      a small mono note at the right of the key ("Optional")
//   error     one sentence under the control; the control should point at it with aria-describedby="<id>-error"
// A field that follows another one gets a hairline above it. The tile goes away under 560px, as on the home page.
defineProps({
  id: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  labelFor: { type: String, default: '' },
  note: { type: String, default: '' },
  error: { type: String, default: '' },
})
</script>

<template>
  <div class="tf">
    <span class="tf__tile"><component :is="icon" aria-hidden="true" :stroke-width="1.75" /></span>
    <div class="tf__body">
      <div class="tf__key">
        <label v-if="labelFor" :id="`${id}-key`" :for="labelFor" class="mono">{{ label }}</label>
        <span v-else :id="`${id}-key`" class="mono">{{ label }}</span>
        <span v-if="note" class="tf__note mono">{{ note }}</span>
      </div>
      <slot />
      <p v-if="error" :id="`${id}-error`" class="tf__error"><CircleAlert aria-hidden="true" :stroke-width="2" />{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
/* --tf-edge is muted ink thinned toward white: about 3.3:1 against white, the minimum for the edge of a control
   (the 1.2:1 hairline used on cards is decoration; here it is the only cue for where to press or type) */
.tf { --tf-edge: color-mix(in srgb, var(--vp-ink-3) 75%, #fff); --tf-alert: #b8431f; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 14px; }
.tf + .tf { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--vp-line); }
.tf__tile { display: grid; place-items: center; align-self: start; width: 40px; height: 40px; border-radius: var(--vp-radius); background: var(--vp-wash); color: var(--vp-blue); }
.tf__tile svg { width: 20px; height: 20px; }
.tf__body { min-width: 0; display: grid; gap: 8px; }
.tf__key { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.tf__key .mono { font-size: 12px; color: var(--vp-ink-3); }
.tf__note { text-align: right; }
.tf__error { display: flex; align-items: flex-start; gap: 6px; margin: 0; color: var(--tf-alert); font: 500 14px/1.4 var(--vp-font); }
.tf__error svg { flex: none; width: 16px; height: 16px; margin-top: 2px; }

@media (max-width: 559px) {
  .tf { grid-template-columns: minmax(0, 1fr); }
  .tf__tile { display: none; }
}
</style>
