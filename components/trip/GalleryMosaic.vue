<script setup>
// The photos beside the trip form: a wall of six photographs in two columns, the second one stepped down, each tile
// carrying its place on a small white chip. The first tile keeps the arch top. Shown through LandingStage's `art` slot.
//   photos  [{ place, src, width, height }]  (the first six are used, see utils/trip-gallery.js)
const props = defineProps({ photos: { type: Array, required: true } })
const left = computed(() => [props.photos[0], props.photos[1], props.photos[4]])
const right = computed(() => [props.photos[5], props.photos[3], props.photos[2]])
</script>

<template>
  <div class="mosaic">
    <div class="mosaic__col">
      <LandingPhoto
        v-for="(photo, i) in left"
        :key="photo.place"
        class="tile"
        :class="i === 0 ? 'tile--arch' : 'tile--square'"
        :shape="i === 0 ? 'arch' : 'rect'"
        :src="photo.src"
        alt=""
        :width="photo.width"
        :height="photo.height"
        :eager="i === 0"
      >
        <figcaption class="mono">{{ photo.place }}</figcaption>
      </LandingPhoto>
    </div>
    <div class="mosaic__col mosaic__col--down">
      <LandingPhoto
        v-for="(photo, i) in right"
        :key="photo.place"
        class="tile"
        :class="i === 0 ? 'tile--tall' : 'tile--square'"
        :src="photo.src"
        alt=""
        :width="photo.width"
        :height="photo.height"
      >
        <figcaption class="mono">{{ photo.place }}</figcaption>
      </LandingPhoto>
    </div>
  </div>
</template>

<style scoped>
.mosaic { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%; }
.mosaic__col { display: grid; align-content: start; gap: 12px; }
.mosaic__col--down { padding-top: clamp(24px, 4vw, 48px); }
.tile { border-radius: 12px; }
.tile--arch { aspect-ratio: 3 / 4; }
.tile--tall { aspect-ratio: 3 / 4; }
.tile--square { aspect-ratio: 1; }
.tile figcaption { position: absolute; left: 10px; bottom: 10px; z-index: 2; padding: 5px 10px; border-radius: 999px; background: rgba(255, 255, 255, .94); color: var(--vp-ink); }
</style>
