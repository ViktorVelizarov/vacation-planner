<script setup>
// Brand, a few links, and the sample disclaimer. The year is read at render time so it never goes stale.
//   links  [{ label, to }]
defineProps({
  links: { type: Array, default: () => [] },
  credit: { type: String, default: '' },
  note: { type: String, default: '' },
})

const year = new Date().getFullYear()
</script>

<template>
  <footer class="foot">
    <div class="foot__row">
      <LandingBrand ink to="#top" />
      <nav aria-label="Footer">
        <NuxtLink v-for="link in links" :key="link.label" :to="link.to">{{ link.label }}</NuxtLink>
      </nav>
    </div>
    <p class="foot__rule" />
    <p class="mono">© {{ year }} {{ credit }}</p>
    <p v-if="note" class="mono">{{ note }}</p>
  </footer>
</template>

<style scoped>
.foot { max-width: var(--vp-wrap); margin: 0 auto; padding: 0 var(--vp-pad) 40px; color: var(--vp-ink-3); }
.foot__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; }
.foot nav { display: flex; flex-wrap: wrap; gap: 8px 28px; }
.foot nav a { font: 500 15px/1 var(--vp-font); color: var(--vp-ink-2); text-decoration: none; padding-block: 6px; }
.foot nav a:hover { color: var(--vp-blue); }
.foot__rule { height: 1px; margin: 26px 0 22px; background: var(--vp-line); }
.foot .mono { margin-top: 4px; text-transform: none; letter-spacing: .04em; }
</style>
