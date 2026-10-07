<script setup>
import { CircleAlert, Eye, EyeOff } from 'lucide-vue-next'

// A labelled text field: the label sits above, an optional hint below, and an error line that is tied to the input
// for screen readers (aria-invalid + aria-describedby). type="password" gets a show/hide button.
// Use it with v-model. The `action` slot sits under the error, for the way out of it ("Sign in instead").
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: 'off' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  showLabel: { type: String, default: 'Show password' },
  hideLabel: { type: String, default: 'Hide password' },
})

const model = defineModel({ type: String, default: '' })

const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
const describedBy = computed(() => [props.error && `${props.id}-error`, props.hint && `${props.id}-hint`].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="field" :class="{ 'field--error': error, 'field--password': isPassword }">
    <label :for="id">{{ label }}</label>
    <div class="field__control">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder || undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        autocapitalize="none"
        spellcheck="false"
      >
      <button
        v-if="isPassword"
        class="field__toggle"
        type="button"
        :aria-label="revealed ? hideLabel : showLabel"
        :aria-pressed="revealed"
        @click="revealed = !revealed"
      >
        <EyeOff v-if="revealed" aria-hidden="true" :stroke-width="1.75" />
        <Eye v-else aria-hidden="true" :stroke-width="1.75" />
      </button>
    </div>
    <p v-if="hint && !error" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="field__error"><CircleAlert aria-hidden="true" :stroke-width="2" />{{ error }}</p>
    <slot v-if="error" name="action" />
  </div>
</template>

<style scoped>
/* --field-edge is muted ink thinned toward white: about 3.3:1 against white, the minimum for the edge of a control
   (the 1.2:1 hairline used on cards is decoration; here it is the only cue for where to type) */
.field { --field-alert: #b8431f; --field-edge: color-mix(in srgb, var(--vp-ink-3) 75%, #fff); display: grid; gap: 8px; }
.field label { font: 600 14px/1.2 var(--vp-font); color: var(--vp-ink); }
.field__control { position: relative; }
.field input { width: 100%; height: 48px; padding: 0 14px; border: 1px solid var(--field-edge); border-radius: var(--vp-radius); background: #fff; color: var(--vp-ink); font: 400 16px/1.2 var(--vp-font); transition: border-color .25s var(--vp-ease); }
.field input:hover { border-color: var(--vp-ink-3); }
.field input:focus { border-color: var(--vp-blue); }
.field input::placeholder { color: var(--vp-ink-3); opacity: 1; }
/* browsers paint autofilled fields in their own colours; keep them in the page's */
.field input:-webkit-autofill { box-shadow: 0 0 0 1000px #fff inset; -webkit-text-fill-color: var(--vp-ink); caret-color: var(--vp-ink); }
.field--password input { padding-right: 52px; }
.field--error input, .field--error input:hover { border-color: var(--field-alert); }
.field__toggle { position: absolute; top: 50%; right: 6px; display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--vp-ink-3); cursor: pointer; transform: translateY(-50%); transition: background-color .25s, color .25s; }
.field__toggle:hover { background: var(--vp-wash); color: var(--vp-ink); }
.field__toggle svg { width: 20px; height: 20px; }
.field__hint { margin: 0; font: 400 13px/1.5 var(--vp-font); color: var(--vp-ink-3); } /* same line height as the error that replaces it, so the form below does not shift */
.field__error { display: flex; align-items: flex-start; gap: 6px; margin: 0; font: 500 14px/1.4 var(--vp-font); color: var(--field-alert); }
.field__error svg { flex: none; width: 16px; height: 16px; margin-top: 2px; }
</style>
