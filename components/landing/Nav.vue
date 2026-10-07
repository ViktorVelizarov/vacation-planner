<script setup>
// Primary navigation, white over the hero photo (no bar). Links hide below 980px; the button stays.
//   links  [{ label, to }]   in-page anchors ('#how') or routes
//   cta    { label, to }     the white call-to-action button
defineProps({
  links: { type: Array, default: () => [] },
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
    <LandingButton :to="cta.to" variant="white" size="sm">{{ cta.label }}</LandingButton>
  </nav>
</template>

<style scoped>
.nav { display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: calc(var(--vp-wrap) - var(--vp-pad) * 2); margin: 0 auto; padding: 26px 0; }
.nav ul { display: flex; gap: clamp(20px, 3vw, 44px); margin: 0; padding: 0; list-style: none; }
.nav ul a { font: 500 15px/1 var(--vp-font); text-decoration: none; padding-block: 8px; opacity: .92; transition: opacity .2s; }
.nav ul a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 6px; }

@media (max-width: 980px) {
  .nav ul { display: none; }
}
</style>
