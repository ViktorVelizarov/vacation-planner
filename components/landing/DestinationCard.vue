<script setup>
import { MapPin, Star } from 'lucide-vue-next'

// One sample trip: a processed photo with a rating chip, the place, and a trip-length figure beside a button.
// The figure slot shows trip length, not a price, because the product does not sell anything.
//   destination  { name, country, coords, rating, ratingTag?, days, party, standin?, image: { src, alt, width, height } }
//   cta          { label, to }
defineProps({
  destination: { type: Object, required: true },
  cta: { type: Object, required: true },
})
</script>

<template>
  <article class="dcard">
    <LandingPhoto
      class="dcard__photo"
      :src="destination.image.src"
      :alt="destination.image.alt"
      :width="destination.image.width"
      :height="destination.image.height"
      :standin="destination.standin"
    >
      <span class="chip">
        <Star :stroke-width="1" fill="currentColor" aria-hidden="true" />{{ destination.rating }}<i v-if="destination.ratingTag" class="mono">{{ destination.ratingTag }}</i>
      </span>
    </LandingPhoto>
    <div class="dcard__body">
      <h3>{{ destination.name }}</h3>
      <p class="where">
        <MapPin :stroke-width="1.75" aria-hidden="true" />{{ destination.country }}
        <span class="mono">{{ destination.coords }}</span>
      </p>
      <div class="dcard__foot">
        <p class="len"><b>{{ destination.days }}</b><span>{{ destination.party }}</span></p>
        <LandingButton :to="cta.to" variant="tint" size="sm">{{ cta.label }}</LandingButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.dcard { background: #fff; border: 1px solid var(--vp-line); border-radius: 12px; padding: 10px 10px 16px; transition: border-color .25s, transform .4s var(--vp-ease); }
.dcard:hover { border-color: #c9d4f5; transform: translateY(-4px); }
.dcard__photo { aspect-ratio: 9 / 10; border-radius: 6px; }
.chip { position: absolute; top: 10px; right: 10px; z-index: 2; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px 5px 8px; border-radius: 999px; background: #fff; color: var(--vp-ink); font: 700 13px/1 var(--vp-font); }
.chip svg { width: 14px; height: 14px; color: var(--vp-coral); }
.chip i { font-style: normal; margin-left: 4px; color: var(--vp-ink-3); font-size: 11px; }
.dcard__body { padding: 16px 8px 0; }
.where { display: flex; align-items: center; gap: 6px; margin-top: 6px; font: 400 14px/1.2 var(--vp-font); color: var(--vp-ink-2); }
.where svg { width: 15px; height: 15px; color: var(--vp-coral); }
.where .mono { margin-left: auto; color: var(--vp-ink-3); font-size: 11px; }
.dcard__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--vp-line); }
.len b { font: 800 clamp(1.3rem, 1.8vw, 1.55rem)/1 var(--vp-font); letter-spacing: -.02em; color: var(--vp-blue-deep); }
.len span { margin-left: 6px; font-size: 13px; color: var(--vp-ink-3); }

@media (max-width: 980px) {
  .dcard__photo { aspect-ratio: 4 / 3; --photo-pos: 50% 32%; }
}
</style>
