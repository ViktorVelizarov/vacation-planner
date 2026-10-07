<script setup>
// Layout for the landing page. The page brings its own header, nav and footer (they are part of the design),
// so it must not sit inside layouts/default.vue; every other page keeps using the default layout untouched.
// The class on <html> switches on smooth scrolling and the themed scrollbar from assets/css/landing.css, and is
// removed again when you navigate away.
useHead({
  htmlAttrs: { lang: 'en', class: 'vp-landing' },
})
</script>

<template>
  <div class="landing">
    <a class="skip" href="#main">Skip to content</a>
    <slot />
  </div>
</template>

<style scoped>
.skip { position: absolute; left: 12px; top: -60px; z-index: 100; background: var(--vp-ink); color: #fff; padding: 12px 18px; border-radius: var(--vp-radius); }
.skip:focus { top: 12px; }
</style>
