<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import lisbon from '~/assets/images/landing/lisbon.webp'
import { authContent } from '~/utils/auth-content'

// The frame every account page shares (sign in, create account, check your inbox, confirm your email): the brand and
// a way back above a LandingStage (headline, lead, the page's card, the Lisbon arch).
//   title  the page's one heading
//   lead   the line under it; a page that has to name an email address fills the `lead` slot instead
defineProps({
  title: { type: String, required: true },
  lead: { type: String, default: '' },
})

const art = { src: lisbon, width: 1200, height: 1200, place: authContent.art.place, coords: authContent.art.coords }
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
      <LandingStage :title="title" :lead="lead" :art="art">
        <template #lead><slot name="lead">{{ lead }}</slot></template>
        <slot />
      </LandingStage>
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
.auth__main { scroll-margin-top: 20px; }

/* phones: the same shrink as the landing nav, so the bar never wraps */
@media (max-width: 560px) {
  .auth__bar .brand { font-size: 18px; gap: 8px; }
}
@media (max-width: 380px) {
  .auth__bar .brand { font-size: 16px; }
  .auth__back-full { display: none; }
  .auth__back-short { display: inline; }
}
</style>
