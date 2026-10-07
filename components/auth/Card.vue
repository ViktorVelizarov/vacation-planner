<script setup>
// The hairline card the account pages put their content in, with the search card's corners. `attached` squares the
// top-left corner where the Sign in / Create account tab strip sits on top of it.
defineProps({
  attached: { type: Boolean, default: false },
})
</script>

<template>
  <div class="auth__card" :class="{ 'auth__card--attached': attached }"><slot /></div>
</template>

<style scoped>
.auth__card { padding: clamp(20px, 3vw, 32px); border: 1px solid var(--vp-line); border-radius: 14px; background: #fff; }
.auth__card--attached { border-top-left-radius: 4px; }
</style>
