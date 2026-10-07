<script setup>
import { ArrowRight } from 'lucide-vue-next'

// Every landing call to action is a link, so this renders a NuxtLink (client-side navigation, route prefetch).
//   variant  blue (the one action colour) | white (on the hero photo) | ghost | tint (inside cards)
//   size     sm | md | lg
//   arrow    adds the arrow that nudges right on hover
defineProps({
  to: { type: [String, Object], required: true },
  variant: { type: String, default: 'blue', validator: (v) => ['blue', 'white', 'ghost', 'tint'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  arrow: { type: Boolean, default: false },
})
</script>

<template>
  <NuxtLink :to="to" class="btn" :class="[`btn--${variant}`, size !== 'md' && `btn--${size}`]">
    <slot />
    <ArrowRight v-if="arrow" :stroke-width="2" aria-hidden="true" />
  </NuxtLink>
</template>

<style scoped>
.btn { display: inline-flex; align-items: center; justify-content: center; gap: .6em; padding: .95em 1.6em; border: 1px solid transparent; border-radius: var(--vp-radius); font: 600 15px/1 var(--vp-font); text-decoration: none; white-space: nowrap; cursor: pointer; transition: background-color .25s var(--vp-ease), color .25s var(--vp-ease), border-color .25s var(--vp-ease), transform .25s var(--vp-ease); }
.btn svg { width: 18px; height: 18px; transition: transform .35s var(--vp-ease); }
.btn:hover svg { transform: translateX(3px); }
.btn--blue { background: var(--vp-blue); color: #fff; }
.btn--blue:hover { background: var(--vp-blue-deep); }
.btn--white { background: #fff; color: var(--vp-blue-deep); }
.btn--white:hover { background: var(--vp-wash); }
.btn--ghost { background: #fff; color: var(--vp-ink); border-color: var(--vp-line); }
.btn--ghost:hover { border-color: var(--vp-blue); color: var(--vp-blue); }
.btn--tint { background: var(--vp-wash); color: var(--vp-blue-deep); }
.btn--tint:hover { background: var(--vp-blue); color: #fff; }
.btn--lg { padding: 1.15em 1.9em; font-size: 16px; }
.btn--sm { padding: .8em 1.15em; font-size: 14px; }
</style>
