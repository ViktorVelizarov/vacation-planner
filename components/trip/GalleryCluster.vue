<script setup>
// Version 1 of the photos beside the trip form: three arches in a staggered cascade, each overlapping the next, the way
// the home page's "How it works" arches sit. The first photo is the large one.
//   photos  [{ place, src, width, height }]  (the first three are used)
defineProps({ photos: { type: Array, required: true } })
</script>

<template>
  <div class="cluster">
    <LandingPhoto
      v-for="(photo, i) in photos.slice(0, 3)"
      :key="photo.place"
      class="cluster__arch"
      :class="`cluster__arch--${i + 1}`"
      shape="arch"
      :src="photo.src"
      alt=""
      :width="photo.width"
      :height="photo.height"
      :eager="i === 0"
    >
      <figcaption class="mono">{{ photo.place }}</figcaption>
    </LandingPhoto>
  </div>
</template>

<style scoped>
.cluster { position: relative; width: 100%; aspect-ratio: 468 / 780; }
.cluster__arch { position: absolute; aspect-ratio: 3 / 4; }
.cluster__arch--1 { left: 0; top: 0; width: 70%; }
.cluster__arch--2 { right: 0; top: 24%; width: 52%; z-index: 2; }
.cluster__arch--3 { left: 8%; top: 62%; width: 47%; z-index: 1; }
.cluster__arch figcaption { position: absolute; left: 12px; bottom: 11px; z-index: 2; color: #fff; }
</style>
