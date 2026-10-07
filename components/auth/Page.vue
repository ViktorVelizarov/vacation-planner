<script setup>
import { authContent } from '~/utils/auth-content'

// The sign-in and create-account pages: the shared frame (AuthShell) with the Sign in / Create account switch on the
// top edge of the hairline card that holds the form. Both pages are built to the same height above the card
// (one-line headline, one-line lead), so switching between them never moves the tab strip out from under the pointer.
//   mode  'signin' | 'signup'
const props = defineProps({
  mode: { type: String, required: true, validator: (v) => ['signin', 'signup'].includes(v) },
})

const route = useRoute()
const copy = computed(() => authContent[props.mode])

// the switch keeps ?redirect=, so choosing the other tab does not forget where the visitor was going
const withRedirect = (path) => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return { path, query: redirect ? { redirect } : {} }
}
</script>

<template>
  <AuthShell :title="copy.title" :lead="copy.lead">
    <nav class="auth__tabs" :aria-label="authContent.tabsLabel">
      <NuxtLink class="auth__tab" :to="withRedirect('/sign-in')">{{ authContent.tabs.signin }}</NuxtLink>
      <NuxtLink class="auth__tab" :to="withRedirect('/sign-up')">{{ authContent.tabs.signup }}</NuxtLink>
    </nav>
    <AuthCard attached>
      <AuthForm :mode="mode" />
    </AuthCard>
  </AuthShell>
</template>

<style scoped>
/* the search card's tab strip, reused as the Sign in / Create account switch */
.auth__tabs { display: flex; gap: 6px; padding-left: 8px; }
.auth__tab { display: inline-flex; align-items: center; padding: 13px 20px 12px; border-radius: 12px 12px 0 0; background: var(--vp-wash); color: var(--vp-ink-2); font: 600 15px/1 var(--vp-font); text-decoration: none; transition: background-color .25s, color .25s; }
.auth__tab:hover { color: var(--vp-blue); }
.auth__tab[aria-current="page"] { background: var(--vp-blue); color: #fff; }
</style>
