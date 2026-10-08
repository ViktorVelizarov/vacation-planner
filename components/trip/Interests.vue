<script setup>
// The interest chips. Any number can be on, including none. They are the shadcn ToggleGroup (radix), so they keep its
// real toggle-button behaviour: aria-pressed, arrow-key roving focus, space and enter. Selected chips fill royal blue,
// the colour for "this one is chosen", as the selected tab does on the home page.
//   v-model  the array of chosen names
//   options  every name offered
//   labelledby  the id of the key that names the group
defineProps({
  options: { type: Array, required: true },
  labelledby: { type: String, default: undefined },
})

const model = defineModel({ type: Array, default: () => [] })
</script>

<template>
  <ToggleGroup v-model="model" type="multiple" class="chips" :aria-labelledby="labelledby">
    <ToggleGroupItem v-for="option in options" :key="option" :value="option" class="chip">{{ option }}</ToggleGroupItem>
  </ToggleGroup>
</template>

<style scoped>
.chips { flex-wrap: wrap; justify-content: flex-start; gap: 8px; }
/* the shadcn base classes (rounded-md, h-10, hover:bg-muted, a navy focus ring) stay on the element, so these win by
   specificity: scoped attribute + class + state */
.chip { gap: 0; height: 44px; padding: 0 16px; border: 1px solid var(--tf-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); font: 600 15px/1 var(--vp-font); white-space: nowrap; transition: background-color .25s var(--vp-ease), border-color .25s var(--vp-ease), color .25s var(--vp-ease); }
.chip:hover { border-color: var(--vp-blue); background: #fff; color: var(--vp-blue); }
.chip[data-state="on"] { border-color: var(--vp-blue); background: var(--vp-blue); color: #fff; }
.chip[data-state="on"]:hover { border-color: var(--vp-blue-deep); background: var(--vp-blue-deep); color: #fff; }
.chip:focus-visible { outline: 3px solid var(--vp-blue); outline-offset: 3px; box-shadow: none; }
</style>
