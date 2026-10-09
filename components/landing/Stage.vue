<script setup>
// The body of a page in the Blue Arch world, shared by the account pages and the trip form: one headline with a short
// line under it, the page's own content in the default slot (usually a LandingCard), and photography beside it on wide
// screens.
//   title  the page's one heading
//   lead   the line under it; a page that has to name something in it (an email address) fills the `lead` slot instead
//   art    { src, width, height, place, coords } for one arch and its mono caption; a page that wants more than one
//          photograph (the trip form's TripGalleryMosaic) fills the `art` slot instead. Hidden under 980px either way
defineProps({
  title: { type: String, required: true },
  lead: { type: String, default: '' },
  art: { type: Object, default: null },
})
</script>

<template>
  <div class="stage">
    <div class="stage__col">
      <h1>{{ title }}</h1>
      <p class="stage__lead"><slot name="lead">{{ lead }}</slot></p>
      <slot />
    </div>

    <div v-if="$slots.art" class="stage__art stage__art--gallery"><slot name="art" /></div>
    <figure v-else-if="art" class="stage__art">
      <LandingPhoto class="stage__arch" shape="arch" :src="art.src" alt="" :width="art.width" :height="art.height" eager />
      <figcaption class="mono">{{ art.place }} · {{ art.coords }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
/* the arch sits on the top line so it stays put whichever page is open; the content column sets the height */
.stage { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 96px); align-items: start; max-width: var(--vp-wrap); margin: 0 auto; padding: clamp(16px, 3vw, 40px) var(--vp-pad) clamp(56px, 8vw, 112px); }
.stage__col { min-width: 0; max-width: 520px; }
.stage h1 { margin: 0; font: 800 clamp(2.1rem, 4.4vw, 3rem)/1.03 var(--vp-font); letter-spacing: -.025em; text-wrap: balance; }
.stage__lead { max-width: 40ch; margin: 16px 0 clamp(24px, 3vw, 34px); color: var(--vp-ink-2); text-wrap: pretty; }

.stage__art { display: grid; justify-items: center; gap: 18px; margin: 0; }
.stage__arch { width: min(100%, 340px); aspect-ratio: 3 / 4; }
.stage__art--gallery { display: block; }
.stage__art figcaption { color: var(--vp-ink-3); text-align: center; }

@media (max-width: 980px) {
  .stage { grid-template-columns: minmax(0, 1fr); }
  .stage__col { width: 100%; }
  .stage__art { display: none; }
}
/* the narrowest phones: "Create your account" still has to fit on one line */
@media (max-width: 340px) {
  .stage h1 { font-size: 1.7rem; }
}
</style>
