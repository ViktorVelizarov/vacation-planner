<script setup>
// Three numbered steps beside two overlapping arch photos.
//   steps   [{ pill, tone, title, text }]
//   arches  { big, small }  each null (flat stand-in) or { src, alt, width, height };
//           big is 900x1200 (3:4), small 640x900 (32:45)
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  steps: { type: Array, required: true },
  arches: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section id="how" class="sec how" aria-labelledby="how-h">
    <div class="how__copy">
      <p v-if="eyebrow" class="eyebrow mono">{{ eyebrow }}</p>
      <h2 id="how-h">{{ title }}</h2>
      <ol class="steps">
        <li v-for="step in steps" :key="step.pill">
          <LandingPill :tone="step.tone">{{ step.pill }}</LandingPill>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </li>
      </ol>
    </div>
    <div class="how__arches">
      <LandingPhoto class="how__arch how__arch--big" shape="arch" v-bind="arches.big" />
      <LandingPhoto class="how__arch how__arch--small" shape="arch" standin="var(--vp-peach)" v-bind="arches.small" />
    </div>
  </section>
</template>

<style scoped>
.how { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 96px); align-items: center; }
.steps { display: grid; gap: clamp(22px, 3vw, 34px); margin: clamp(26px, 3.6vw, 44px) 0 0; padding: 0; list-style: none; }
.steps li { display: grid; grid-template-columns: auto 1fr; column-gap: 18px; row-gap: 6px; align-items: start; }
.steps .pill { grid-row: 1 / 3; margin-top: 3px; }
.steps p { color: var(--vp-ink-2); max-width: 44ch; }
.how__arches { position: relative; min-height: clamp(420px, 44vw, 560px); }
.how__arch--big { position: absolute; right: 0; top: 0; width: min(62%, 310px); aspect-ratio: 3 / 4; }
.how__arch--small { position: absolute; left: 4%; bottom: 0; width: min(46%, 230px); aspect-ratio: 32 / 45; }

@media (max-width: 980px) {
  .how { grid-template-columns: minmax(0, 1fr); }
  .how__arches { min-height: 460px; max-width: 520px; width: 100%; margin-inline: auto; }
  .how__arch--big { right: 6%; }
}
</style>
