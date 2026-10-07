<script setup>
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

// A scroll-snap track of sample quotes with previous/next buttons that move it one card at a time.
//   items  [{ text, name, meta, initials }]   keep "Sample" in `meta` until these are real testimonials
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  label: { type: String, default: '' },
  items: { type: Array, required: true },
})

const track = ref(null)

function scrollByCard(direction) {
  const el = track.value
  const card = el?.firstElementChild
  if (!el || !card) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 24
  el.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' })
}
</script>

<template>
  <section id="quotes" class="sec quotes" aria-labelledby="quotes-h">
    <header class="sec__head">
      <div>
        <p v-if="eyebrow" class="eyebrow mono">{{ eyebrow }}</p>
        <h2 id="quotes-h">{{ title }}</h2>
      </div>
      <div class="pager">
        <button class="pg" type="button" aria-label="Previous quote" @click="scrollByCard(-1)">
          <ChevronLeft :stroke-width="2" aria-hidden="true" />
        </button>
        <button class="pg pg--on" type="button" aria-label="Next quote" @click="scrollByCard(1)">
          <ChevronRight :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </header>
    <div ref="track" class="track" role="region" tabindex="0" :aria-label="label">
      <LandingQuoteCard v-for="item in items" :key="item.name" class="track__item" :quote="item" />
    </div>
  </section>
</template>

<style scoped>
.pager { display: flex; gap: 10px; }
.pg { width: 46px; height: 46px; display: grid; place-items: center; padding: 0; border: 1px solid var(--vp-line); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); cursor: pointer; transition: background-color .25s, color .25s, border-color .25s; }
.pg svg { width: 20px; height: 20px; }
.pg--on { background: var(--vp-blue); border-color: var(--vp-blue); color: #fff; }
.pg:hover { border-color: var(--vp-blue); }
.pg--on:hover { background: var(--vp-blue-deep); }

.track { display: flex; gap: clamp(16px, 2.4vw, 30px); overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scroll-padding-inline: 4px; padding: 6px 4px 28px; margin: 0 -4px; scrollbar-width: none; }
.track::-webkit-scrollbar { display: none; }
.track__item { flex: 0 0 calc((100% - clamp(16px, 2.4vw, 30px)) / 2); scroll-snap-align: start; }

@media (max-width: 980px) {
  .track__item { flex-basis: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .track { scroll-behavior: auto; }
}
</style>
