<script setup>
import { Minus, Plus } from 'lucide-vue-next'

// How many are going: a stepper with the number written out between two square buttons. The buttons switch off at the
// ends (1 and 10) instead of silently doing nothing.
//   v-model  the number
//   labelledby  the id of the key that names the group
defineProps({
  labelledby: { type: String, default: undefined },
})

const words = tripContent.travelers
const min = MIN_TRAVELERS
const max = MAX_TRAVELERS

const model = defineModel({ type: Number, default: 1 })
</script>

<template>
  <div class="stepper" role="group" :aria-labelledby="labelledby">
    <button class="stepper__btn" type="button" :aria-label="words.fewer" :disabled="model <= min" @click="model--">
      <Minus aria-hidden="true" :stroke-width="2" />
    </button>
    <output class="stepper__value" aria-live="polite"><b>{{ model }}</b> {{ words.people(model) }}</output>
    <button class="stepper__btn" type="button" :aria-label="words.more" :disabled="model >= max" @click="model++">
      <Plus aria-hidden="true" :stroke-width="2" />
    </button>
  </div>
</template>

<style scoped>
.stepper { display: flex; align-items: center; gap: 14px; }
.stepper__btn { display: grid; place-items: center; flex: none; width: 48px; height: 48px; padding: 0; border: 1px solid var(--tf-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); cursor: pointer; transition: background-color .25s var(--vp-ease), border-color .25s var(--vp-ease), color .25s var(--vp-ease); }
.stepper__btn svg { width: 20px; height: 20px; }
.stepper__btn:hover:not(:disabled) { border-color: var(--vp-blue); color: var(--vp-blue); }
.stepper__btn:disabled { border-color: var(--vp-line); color: var(--vp-ink-3); opacity: .55; cursor: default; }
/* the figure, like the home page's data: heavy and tabular, with its word beside it */
.stepper__value { min-width: 8ch; text-align: center; font: 400 16px/1 var(--vp-font); }
.stepper__value b { font: 800 22px/1 var(--vp-font); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
</style>
