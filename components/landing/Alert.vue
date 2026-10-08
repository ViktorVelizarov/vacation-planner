<script setup>
import { CircleAlert } from 'lucide-vue-next'

// An error that names the problem; the `action` slot holds the way out ("Sign in instead"). It can take focus
// (tabindex -1) so a form can move the keyboard here after a failed try. `hint` is a developer-only detail the server
// sends from a machine that is missing a setting; it is empty everywhere else.
defineProps({
  id: { type: String, default: undefined },
  hint: { type: String, default: '' },
})
</script>

<template>
  <div :id="id" class="alert" role="alert" tabindex="-1">
    <CircleAlert aria-hidden="true" :stroke-width="2" />
    <div class="alert__body">
      <p class="alert__text"><slot /></p>
      <p v-if="hint" class="alert__hint">{{ hint }}</p>
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid var(--vp-peach); border-radius: var(--vp-radius); background: rgba(251, 214, 194, .4); color: #b8431f; font: 500 14px/1.45 var(--vp-font); }
.alert svg { flex: none; width: 18px; height: 18px; margin-top: 1px; }
.alert__body { min-width: 0; display: grid; gap: 6px; }
.alert__text, .alert__hint { margin: 0; }
.alert__hint { color: var(--vp-ink-2); font: 500 12px/1.5 var(--vp-mono); overflow-wrap: anywhere; }
.alert :slotted(a) { justify-self: start; color: var(--vp-blue-deep); font-weight: 600; text-underline-offset: 3px; }
.alert :slotted(a:hover) { color: var(--vp-blue); }
</style>
