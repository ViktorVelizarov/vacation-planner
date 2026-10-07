<script setup>
// The closing block: one more "Try a demo" at the end of the page.
//   cta  { label, to }
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  cta: { type: Object, required: true },
})
</script>

<template>
  <section class="sec closing" aria-labelledby="closing-h">
    <div class="closing__box">
      <h2 id="closing-h">{{ title }}</h2>
      <p v-if="text">{{ text }}</p>
      <p><LandingButton :to="cta.to" size="lg" arrow>{{ cta.label }}</LandingButton></p>
    </div>
  </section>
</template>

<style scoped>
.closing { padding-bottom: clamp(72px, 9vw, 128px); }
.closing__box { padding: clamp(40px, 6vw, 84px) var(--vp-pad); border-radius: 16px; background: var(--vp-paper); text-align: center; }
.closing__box h2 { max-width: 16ch; margin: 0 auto; }
.closing__box > p:not(.eyebrow) { max-width: 44ch; margin: 18px auto 0; color: var(--vp-ink-2); }
.closing__box > p:last-child { margin-top: clamp(26px, 3.4vw, 40px); }
</style>
