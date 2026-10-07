<script setup>
// One sample quote. The meta line carries the "Sample" label so it can't be mistaken for a real testimonial.
//   quote  { text, name, meta, initials }
defineProps({
  quote: { type: Object, required: true },
})
</script>

<template>
  <figure class="qcard">
    <span class="qmark" aria-hidden="true">“</span>
    <blockquote>{{ quote.text }}</blockquote>
    <figcaption>
      <span class="av" aria-hidden="true">{{ quote.initials }}</span>
      <span><b>{{ quote.name }}</b><i class="mono">{{ quote.meta }}</i></span>
    </figcaption>
  </figure>
</template>

<style scoped>
.qcard { position: relative; margin: 0; padding: clamp(24px, 3vw, 36px); border-radius: 12px; background: #fff; border: 1px solid var(--vp-line); display: flex; flex-direction: column; gap: 24px; }
.qmark { position: absolute; top: 14px; left: 26px; font: 800 6rem/1 var(--vp-font); color: var(--vp-blue); }
.qcard blockquote { margin: 0; padding-top: 52px; color: var(--vp-ink); font: 600 clamp(1.15rem, 1.6vw, 1.4rem)/1.4 var(--vp-font); letter-spacing: -.01em; max-width: 34ch; }
.qcard figcaption { display: flex; align-items: center; gap: 14px; margin-top: auto; }
.qcard figcaption b { display: block; font: 700 16px/1.2 var(--vp-font); }
.qcard figcaption i { font-style: normal; color: var(--vp-ink-3); font-size: 11px; }
.av { flex: none; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; background: var(--vp-wash); color: var(--vp-blue-deep); font: 700 14px/1 var(--vp-font); }
</style>
