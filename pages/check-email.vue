<script setup>
import { authContent } from '~/utils/auth-content'

// "Check your inbox": where creating an account (or signing in to one that was never confirmed) leads. Only reachable
// by a browser that has an account waiting for its email link; see middleware/auth.global.js.
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Check your inbox — Vacation Planner',
  description: 'Confirm your email address to finish creating your Vacation Planner account.',
  robots: 'noindex',
})
// it names the visitor's address: never keep a copy in a shared cache
if (import.meta.server) useRequestEvent()?.node.res.setHeader('Cache-Control', 'no-store')

const { pending } = useAuth()
</script>

<template>
  <AuthShell :title="authContent.check.title">
    <template #lead>{{ authContent.check.lead }} <strong class="address">{{ pending?.email }}</strong></template>
    <AuthCard>
      <AuthCheckEmail />
    </AuthCard>
  </AuthShell>
</template>

<style scoped>
/* a long address wraps instead of pushing the page sideways */
.address { display: inline-block; max-width: 100%; color: var(--vp-ink); font-weight: 700; overflow-wrap: anywhere; vertical-align: bottom; }
</style>
