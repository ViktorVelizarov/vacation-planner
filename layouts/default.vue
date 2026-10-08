<script setup>
// The frame for the app's working pages (the trip form and the itinerary): the home page's header and footer language
// on a white bar, with the visitor's name and Sign out on the right. The bar and the footer carry the `landing` class
// so they get the landing fonts and tokens; the page in between brings its own ground.
// The class on <html> switches on the themed scrollbar and smooth scrolling from assets/css/landing.css.
useHead({
  htmlAttrs: { lang: 'en', class: 'vp-landing' },
})

const year = new Date().getFullYear() // read at render time so it never goes stale
</script>

<template>
  <div class="app flex flex-col min-h-screen">
    <LandingSkipLink />

    <header class="landing bar">
      <div class="bar__row">
        <LandingBrand ink to="/" />
        <LandingAccount ink :account="landingContent.account" />
      </div>
    </header>

    <main id="main" class="flex flex-col flex-grow">
      <slot />
    </main>

    <footer class="landing foot">
      <div class="foot__row">
        <p class="mono">© {{ year }} Vacation Planner. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app { --app-bar: 66px; } /* the bar's height with its edge, for pages that stick something just below it */
.bar { position: sticky; top: 0; z-index: 30; box-sizing: border-box; height: var(--app-bar); border-bottom: 1px solid var(--vp-line); }
.bar__row { display: flex; align-items: center; justify-content: space-between; gap: 24px; height: 100%; max-width: var(--vp-wrap); margin: 0 auto; padding: 0 var(--vp-pad); }
.foot { border-top: 1px solid var(--vp-line); }
.foot__row { max-width: var(--vp-wrap); margin: 0 auto; padding: 22px var(--vp-pad); }
.foot p { color: var(--vp-ink-3); text-transform: none; letter-spacing: .04em; }

/* phones: the same shrink as the landing nav, so the bar never wraps */
@media (max-width: 560px) {
  .bar .brand { font-size: 18px; gap: 8px; }
}
@media (max-width: 380px) {
  .bar .brand { font-size: 16px; }
}
</style>
