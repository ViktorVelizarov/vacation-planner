<script setup>
import { ArrowRight } from 'lucide-vue-next'

// The only button. With `to` it is a NuxtLink (client-side navigation, route prefetch); without `to` it is a real
// <button> for actions such as submitting a form or signing out.
//   variant  blue (the one action colour) | white (primary on the hero photo) | line (secondary on the hero photo)
//            | ghost | tint (inside cards)
//   size     sm | md | lg
//   arrow    adds the arrow that nudges right on hover
//   block    full width
defineProps({
  to: { type: [String, Object], default: undefined },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'blue', validator: (v) => ['blue', 'white', 'line', 'ghost', 'tint'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  arrow: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    v-bind="to ? { to } : { type }"
    class="btn"
    :class="[`btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block']"
  >
    <slot />
    <ArrowRight v-if="arrow" class="btn__arrow" :stroke-width="2" aria-hidden="true" />
  </component>
</template>

<style scoped>
.btn { display: inline-flex; align-items: center; justify-content: center; gap: .6em; padding: .95em 1.6em; border: 1px solid transparent; border-radius: var(--vp-radius); font: 600 15px/1 var(--vp-font); text-decoration: none; white-space: nowrap; cursor: pointer; transition: background-color .25s var(--vp-ease), color .25s var(--vp-ease), border-color .25s var(--vp-ease), transform .25s var(--vp-ease); }
/* only the arrow nudges on hover; icons a caller puts in the slot stay where they are */
.btn__arrow { flex: none; width: 18px; height: 18px; transition: transform .35s var(--vp-ease); }
.btn:hover .btn__arrow { transform: translateX(3px); }
.btn:disabled { cursor: progress; opacity: .65; }
.btn:disabled:hover .btn__arrow { transform: none; }
.btn--blue { background: var(--vp-blue); color: #fff; }
.btn--blue:hover { background: var(--vp-blue-deep); }
.btn--white { background: #fff; color: var(--vp-blue-deep); }
.btn--white:hover { background: var(--vp-wash); }
.btn--line { background: transparent; color: #fff; border-color: rgba(255, 255, 255, .55); }
.btn--line:hover { background: rgba(255, 255, 255, .14); border-color: #fff; }
.btn--ghost { background: #fff; color: var(--vp-ink); border-color: var(--vp-line); }
.btn--ghost:hover { border-color: var(--vp-blue); color: var(--vp-blue); }
.btn--tint { background: var(--vp-wash); color: var(--vp-blue-deep); }
.btn--tint:hover { background: var(--vp-blue); color: #fff; }
.btn--lg { padding: 1.15em 1.9em; font-size: 16px; }
.btn--sm { padding: .8em 1.15em; font-size: 14px; }
.btn--block { width: 100%; }
</style>
