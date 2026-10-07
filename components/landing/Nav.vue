<script setup>
// Primary navigation, white over the hero photo (no bar). The links hide below 980px; the buttons stay.
//   links    [{ label, to }]   in-page anchors ('#how') or routes
//   account  { signIn: { label, to }, signOut }   the Sign in / Sign out control (see LandingAccount); omit to hide it
//   cta      { label, to }     the white call-to-action button
defineProps({
  links: { type: Array, default: () => [] },
  account: { type: Object, default: null },
  cta: { type: Object, required: true },
})
</script>

<template>
  <nav class="nav" aria-label="Primary">
    <LandingBrand to="#top" />
    <ul>
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
      </li>
    </ul>
    <div class="nav__actions">
      <LandingAccount v-if="account" :account="account" />
      <LandingButton :to="cta.to" variant="white" size="sm">{{ cta.label }}</LandingButton>
    </div>
  </nav>
</template>

<style scoped>
/* three columns (side columns equal, links in the middle): the links stay centred whatever width the account block takes, signed in or out */
.nav { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 24px; max-width: calc(var(--vp-wrap) - var(--vp-pad) * 2); margin: 0 auto; padding: 26px 0; }
.nav .brand { justify-self: start; } /* as wide as the wordmark, not stretched across its grid column */
.nav ul { display: flex; gap: clamp(20px, 3vw, 44px); justify-self: center; margin: 0; padding: 0; list-style: none; }
.nav ul a { font: 500 15px/1 var(--vp-font); text-decoration: none; padding-block: 8px; opacity: .92; transition: opacity .2s; }
.nav ul a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 6px; }
.nav__actions { display: flex; align-items: center; justify-self: end; gap: 10px; }

@media (max-width: 980px) {
  .nav { grid-template-columns: auto 1fr; }
  .nav ul { display: none; }
}
/* phones: one row, wordmark on one line, buttons compact (the account control turns into an icon, see LandingAccount) */
@media (max-width: 560px) {
  .nav { gap: 12px; }
  .nav .brand { font-size: 18px; gap: 8px; }
  .nav .btn { padding: .75em .95em; font-size: 13.5px; }
}
@media (max-width: 380px) {
  .nav .brand { font-size: 16px; }
}
/* the narrowest phones: the arch mark alone (the name stays for screen readers) */
@media (max-width: 340px) {
  .nav, .nav__actions { gap: 8px; }
  .nav .brand :deep(.brand__name) { position: absolute; width: 1px; height: 1px; overflow: hidden; white-space: nowrap; clip-path: inset(50%); }
}
</style>
