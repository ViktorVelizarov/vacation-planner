<script setup>
// The product's real limits as stat tiles, beside an arch photo with a tray of three day thumbnails.
//   tiles   [{ value, label }]
//   art     null (flat stand-in) or { src, alt, width, height }, 900x1200 (3:4)
//   thumbs  [{ caption, image: null | { src, alt, width, height }, standin?, darkCaption? }], 240x240 squares
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  tiles: { type: Array, required: true },
  art: { type: Object, default: null },
  thumbs: { type: Array, default: () => [] },
  thumbsLabel: { type: String, default: '' },
})
</script>

<template>
  <section id="limits" class="sec limits" aria-labelledby="limits-h">
    <div class="limits__art">
      <LandingPhoto class="limits__arch" shape="arch" v-bind="art" />
      <div class="thumbs" role="group" :aria-label="thumbsLabel">
        <LandingPhoto
          v-for="thumb in thumbs"
          :key="thumb.caption"
          class="thumbs__slot"
          :standin="thumb.standin"
          v-bind="thumb.image"
        >
          <figcaption class="mono" :class="{ 'thumbs__cap--dark': thumb.darkCaption }">{{ thumb.caption }}</figcaption>
        </LandingPhoto>
      </div>
    </div>
    <div class="limits__copy">
      <p v-if="eyebrow" class="eyebrow mono">{{ eyebrow }}</p>
      <h2 id="limits-h">{{ title }}</h2>
      <p v-if="text">{{ text }}</p>
      <dl class="tiles">
        <div v-for="tile in tiles" :key="tile.label">
          <dt>{{ tile.value }}</dt>
          <dd class="mono">{{ tile.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.limits { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(32px, 6vw, 96px); align-items: center; }
.limits__art { position: relative; padding-bottom: 40px; }
.limits__arch { width: min(96%, 360px); aspect-ratio: 3 / 4; margin-left: 4%; }
.thumbs { position: absolute; left: clamp(0px, 3vw, 28px); bottom: 0; display: flex; gap: 8px; padding: 8px; background: #fff; border-radius: 12px; box-shadow: 0 24px 40px -20px rgba(15, 26, 54, .4), 0 6px 14px -8px rgba(15, 26, 54, .2); }
.thumbs__slot { width: clamp(64px, 8vw, 86px); aspect-ratio: 1; border-radius: 6px; }
.thumbs figcaption { position: absolute; left: 6px; bottom: 5px; z-index: 2; color: #fff; font-size: 11px; }
.thumbs figcaption.thumbs__cap--dark { color: var(--vp-ink); }
.limits__copy > p:not(.eyebrow) { max-width: 46ch; margin-top: 18px; color: var(--vp-ink-2); }
.tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: clamp(26px, 3.4vw, 40px) 0 0; }
.tiles > div { padding: 18px 16px 16px; border: 1px solid var(--vp-line); border-radius: 8px; background: var(--vp-paper); }
.tiles dt { font: 800 clamp(2rem, 3vw, 2.7rem)/1 var(--vp-font); letter-spacing: -.04em; color: var(--vp-blue); font-feature-settings: "tnum" 1; }
.tiles dd { margin: 10px 0 0; color: var(--vp-ink-3); font-size: 11px; }

@media (max-width: 980px) {
  .limits { grid-template-columns: minmax(0, 1fr); gap: 56px; }
  .limits__art { max-width: 420px; margin-inline: auto; width: 100%; }
}
@media (max-width: 560px) {
  .tiles { grid-template-columns: minmax(0, 1fr); }
  .tiles > div { display: flex; align-items: baseline; gap: 14px; padding: 14px 16px; }
  .tiles dd { margin: 0; }
}
</style>
