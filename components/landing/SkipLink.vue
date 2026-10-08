<script setup>
// "Skip to content": the first stop for keyboard users, off screen until it has focus. It points at the page's
// <main id="main">.
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>
</template>

<style scoped>
.skip { position: absolute; left: 12px; top: -60px; z-index: 100; background: var(--vp-ink); color: #fff; padding: 12px 18px; border-radius: var(--vp-radius); }
.skip:focus { top: 12px; }
</style>
