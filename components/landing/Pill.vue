<script setup>
// Number / day capsule. Tones run in a fixed order for a sequence of three: blue, coral, peach.
defineProps({
  tone: { type: String, default: 'blue', validator: (v) => ['blue', 'coral', 'peach'].includes(v) },
})
</script>

<template>
  <span class="pill" :class="`pill--${tone}`"><slot /></span>
</template>

<style scoped>
.pill { display: inline-grid; place-items: center; min-width: 38px; height: 26px; padding: 0 12px; border-radius: 999px; font: 600 12px/1 var(--vp-mono); letter-spacing: .04em; }
.pill--blue { background: var(--vp-blue); color: #fff; }
.pill--coral { background: var(--vp-coral); color: var(--vp-ink); }
.pill--peach { background: var(--vp-peach); color: var(--vp-ink); }
</style>
