<script setup>
// The arch mark plus the wordmark. `ink` is the on-white version used in the footer.
defineProps({
  to: { type: String, default: '#top' },
  ink: { type: Boolean, default: false },
})
</script>

<template>
  <NuxtLink :to="to" class="brand" :class="{ 'brand--ink': ink }">
    <i aria-hidden="true" /><span class="brand__name">Vacation Planner</span>
  </NuxtLink>
</template>

<style scoped>
.brand { display: inline-flex; flex: none; align-items: center; gap: 10px; font: 700 21px/1 var(--vp-font); letter-spacing: -.02em; text-decoration: none; white-space: nowrap; }
.brand i { width: 17px; height: 22px; background: #fff; border-radius: 999px 999px 0 0; }
.brand--ink { color: var(--vp-ink); }
.brand--ink i { background: var(--vp-blue); }
</style>
