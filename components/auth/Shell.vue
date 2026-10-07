<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import lisbon from '~/assets/images/landing/lisbon.webp'
import { authContent } from '~/utils/auth-content'

// The frame every account page shares (sign in, create account, check your inbox, confirm your email): the brand and
// a way back, one headline with a short line under it, the page's own content in the default slot (usually a card),
// and one processed arch photograph.
//   title  the page's one heading
//   lead   the line under it; a page that has to name an email address fills the `lead` slot instead
defineProps({
  title: { type: String, required: true },
  lead: { type: String, default: '' },
})
</script>

<template>
  <div class="auth">
    <header class="auth__bar">
      <LandingBrand ink to="/" />
      <NuxtLink class="auth__back" to="/">
        <ArrowLeft aria-hidden="true" :stroke-width="2" /><span class="auth__back-full">{{ authContent.back }}</span><span class="auth__back-short">{{ authContent.backShort }}</span>
      </NuxtLink>
    </header>

    <main id="main" class="auth__main">
      <div class="auth__col">
        <h1>{{ title }}</h1>
        <p class="auth__lead"><slot name="lead">{{ lead }}</slot></p>
        <slot />
      </div>

      <figure class="auth__art">
        <LandingPhoto class="auth__arch" shape="arch" :src="lisbon" alt="" :width="1200" :height="1200" eager />
        <figcaption class="mono">{{ authContent.art.place }} · {{ authContent.art.coords }}</figcaption>
      </figure>
    </main>
  </div>
</template>

<style scoped>
.auth { min-height: 100vh; }
.auth__bar { display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: var(--vp-wrap); margin: 0 auto; padding: 26px var(--vp-pad); }
.auth__back { display: inline-flex; flex: none; align-items: center; gap: 8px; padding-block: 8px; color: var(--vp-ink-2); font: 500 15px/1 var(--vp-font); text-decoration: none; white-space: nowrap; transition: color .2s; }
.auth__back:hover { color: var(--vp-blue); }
.auth__back svg { width: 18px; height: 18px; }
.auth__back-short { display: none; }

/* arch on the top line so it stays put whichever page is open; the form column sets the height */
.auth__main { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 96px); align-items: start; max-width: var(--vp-wrap); margin: 0 auto; padding: clamp(16px, 3vw, 40px) var(--vp-pad) clamp(56px, 8vw, 112px); scroll-margin-top: 20px; }
.auth__col { min-width: 0; max-width: 520px; }
.auth h1 { margin: 0; font: 800 clamp(2.1rem, 4.4vw, 3rem)/1.03 var(--vp-font); letter-spacing: -.025em; text-wrap: balance; }
.auth__lead { max-width: 40ch; margin: 16px 0 clamp(24px, 3vw, 34px); color: var(--vp-ink-2); text-wrap: pretty; }

.auth__art { display: grid; justify-items: center; gap: 18px; margin: 0; }
.auth__arch { width: min(100%, 340px); aspect-ratio: 3 / 4; }
.auth__art figcaption { color: var(--vp-ink-3); text-align: center; }

@media (max-width: 980px) {
  .auth__main { grid-template-columns: minmax(0, 1fr); }
  .auth__col { width: 100%; }
  .auth__art { display: none; }
}
/* phones: the same shrink as the landing nav, so the bar never wraps */
@media (max-width: 560px) {
  .auth__bar .brand { font-size: 18px; gap: 8px; }
}
@media (max-width: 380px) {
  .auth__bar .brand { font-size: 16px; }
  .auth__back-full { display: none; }
  .auth__back-short { display: inline; }
}
/* the narrowest phones: "Create your account" still has to fit on one line */
@media (max-width: 340px) {
  .auth h1 { font-size: 1.7rem; }
}
</style>
