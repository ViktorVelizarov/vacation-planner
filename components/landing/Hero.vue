<script setup>
// Full-bleed photograph behind the nav and a centred two-line promise. The photo is 16:9 with the lone figure
// right of centre, just under the type; the search card (LandingFinder) overlaps the bottom ~22%, so nothing
// important lives there. Halftone, grain and the navy scrim for the white text come from this file's styles.
//   image     { src, width, height, alt }
//   headline  array of lines, rendered with a line break between them
defineProps({
  image: { type: Object, required: true },
  headline: { type: Array, required: true },
  lead: { type: String, default: '' },
  nav: { type: Array, default: () => [] },
  cta: { type: Object, required: true },
})
</script>

<template>
  <header id="top" class="hero">
    <figure class="hero__media">
      <img
        class="hero__img"
        :src="image.src"
        :width="image.width"
        :height="image.height"
        :alt="image.alt"
        fetchpriority="high"
      >
    </figure>

    <LandingNav :links="nav" :cta="cta" />

    <div class="hero__body">
      <h1><template v-for="(line, i) in headline" :key="i"><br v-if="i">{{ line }}</template></h1>
      <p v-if="lead">{{ lead }}</p>
    </div>
  </header>
</template>

<style scoped>
.hero { --vp-focus: #fff; position: relative; isolation: isolate; overflow: hidden; color: #fff; text-align: center; min-height: clamp(600px, 82vh, 800px); padding: 0 var(--vp-pad) 190px; background: var(--vp-standin); }
.hero__media { position: absolute; inset: 0; z-index: -2; margin: 0; background: var(--vp-standin); }
.hero__img { width: 100%; height: 100%; object-fit: cover; object-position: 62% 55%; }
.hero__media::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(8, 14, 36, .6) 0 1px, transparent 1.5px) 0 0 / 4px 4px; mix-blend-mode: multiply; opacity: .55; pointer-events: none; }
.hero__media::after { content: ""; position: absolute; inset: 0; background: var(--vp-grain); mix-blend-mode: overlay; opacity: .5; pointer-events: none; }
.hero::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(180deg, rgba(8, 14, 36, .5) 0, rgba(8, 14, 36, .3) 45%, rgba(8, 14, 36, .22) 100%); }

.hero__body { max-width: 860px; margin: clamp(46px, 8vh, 96px) auto 0; }
.hero h1 { margin: 0; font-family: var(--vp-font); font-weight: 800; font-size: clamp(2.7rem, 6.6vw, 6.3rem); line-height: 1; letter-spacing: -.022em; text-wrap: balance; text-shadow: 0 2px 40px rgba(8, 14, 36, .35); }
.hero__body p { max-width: 34ch; margin: clamp(18px, 2.4vw, 28px) auto 0; font: 400 clamp(1rem, 1.3vw, 1.18rem)/1.55 var(--vp-font); color: rgba(255, 255, 255, .92); }

@media (max-width: 560px) {
  .hero { padding-bottom: 170px; }
  .hero h1 { font-size: clamp(2rem, 9.6vw, 3rem); }
}
</style>
