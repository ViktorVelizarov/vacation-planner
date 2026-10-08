<script setup>
// The hairline card pages put their content in, with the search card's corners. `attached` squares the top-left corner
// where a tab strip sits on top of it (the Sign in / Create account switch). On a plain ground a card takes a hairline,
// never a shadow: a shadow means "this floats over something".
defineProps({
  attached: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card" :class="{ 'card--attached': attached }"><slot /></div>
</template>

<style scoped>
.card { padding: clamp(20px, 3vw, 32px); border: 1px solid var(--vp-line); border-radius: 14px; background: #fff; }
.card--attached { border-top-left-radius: 4px; }
</style>
