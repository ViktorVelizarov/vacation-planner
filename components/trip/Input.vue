<script setup>
// The trip form's text input, with the edge and focus of every control on the form (colours come from TripField).
// Use it with v-model; `invalid` turns the edge burnt orange and marks the input for screen readers.
defineProps({
  id: { type: String, required: true },
  placeholder: { type: String, default: '' },
  invalid: { type: Boolean, default: false },
  describedby: { type: String, default: undefined },
})

const model = defineModel({ type: String, default: '' })
</script>

<template>
  <input
    :id="id"
    v-model="model"
    class="input"
    type="text"
    autocomplete="off"
    :placeholder="placeholder || undefined"
    :aria-invalid="invalid ? 'true' : undefined"
    :aria-describedby="describedby"
  >
</template>

<style scoped>
.input { width: 100%; height: 48px; padding: 0 14px; border: 1px solid var(--tf-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); font: 400 16px/1.2 var(--vp-font); transition: border-color .25s var(--vp-ease); }
.input:hover { border-color: var(--vp-ink-3); }
.input:focus { border-color: var(--vp-blue); }
.input::placeholder { color: var(--vp-ink-3); opacity: 1; }
.input[aria-invalid="true"], .input[aria-invalid="true"]:hover { border-color: var(--tf-alert); }
</style>
