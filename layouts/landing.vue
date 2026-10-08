<script setup>
// Layout for the landing page and the account pages. Each page brings its own header, nav and footer (they are part of
// the design), so they must not sit inside layouts/default.vue; the app's working pages (the trip form, the itinerary)
// use that one.
// The class on <html> switches on smooth scrolling and the themed scrollbar from assets/css/landing.css, and is
// removed again when you navigate away.
useHead({
  htmlAttrs: { lang: 'en', class: 'vp-landing' },
})
</script>

<template>
  <div class="landing">
    <LandingSkipLink />
    <slot />
  </div>
</template>
