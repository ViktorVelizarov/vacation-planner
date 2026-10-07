<script setup>
// A processed photo slot. Photos keep their natural colour but are never shown raw: a 4px halftone dot screen
// and film grain sit over every one, so any picture dropped in reads as part of the same printed set.
// Swap images in; never restyle the recipe per image.
//
//   src      image URL; leave empty to show only the flat stand-in (a decorative placeholder)
//   shape    rect | arch (round top, thick white border: the signature shape)
//   standin  any CSS colour shown behind the image until it loads, or in place of it
// Size it from the parent with a class (aspect-ratio / width); the default slot overlays content (chips, captions).
// A parent can also set --photo-pos on the slot to move the crop (object-position).
defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  width: { type: Number, default: undefined },
  height: { type: Number, default: undefined },
  shape: { type: String, default: 'rect', validator: (v) => ['rect', 'arch'].includes(v) },
  standin: { type: String, default: '' },
  eager: { type: Boolean, default: false },
})
</script>

<template>
  <figure
    class="photo"
    :class="{ 'photo--arch': shape === 'arch' }"
    :style="standin ? { '--photo-standin': standin } : undefined"
    :aria-hidden="src ? undefined : 'true'"
  >
    <img
      v-if="src"
      class="photo__img"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
    >
    <slot />
  </figure>
</template>

<style scoped>
.photo { position: relative; isolation: isolate; margin: 0; overflow: hidden; background: var(--photo-standin, var(--vp-standin-2)); }
.photo__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: var(--photo-pos, 50% 50%); }
.photo::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(8, 14, 36, .55) 0 1px, transparent 1.5px) 0 0 / 4px 4px; mix-blend-mode: multiply; opacity: .45; }
.photo::after { content: ""; position: absolute; inset: 0; z-index: 1; background: var(--vp-grain); mix-blend-mode: overlay; opacity: .5; pointer-events: none; }

/* arch: the signature shape */
.photo--arch { border: 8px solid #fff; border-radius: 999px 999px 0 0; box-shadow: 0 30px 50px -26px rgba(15, 26, 54, .5), 0 8px 16px -8px rgba(15, 26, 54, .25); }
</style>
