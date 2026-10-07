<script setup>
import { LogOut, UserRound } from 'lucide-vue-next'

// The account control in the nav, on the hero photo: a "Sign in" button for visitors, and for someone who is signed in
// an outlined initials disc (the full name is its tooltip and is read out to screen readers) beside "Sign out".
// It reads the session itself (useAuth), so any nav can drop it in. On phones the buttons shrink to icons (the words
// stay for screen readers) so the nav still fits beside the wordmark.
//   account  { signIn: { label, to }, signOut: 'Sign out' }
const props = defineProps({
  account: { type: Object, required: true },
})

const { user, loggedIn, signOut } = useAuth()

// "Alexandra Whitfield-Jones" -> "AW"; one word -> its first letter
const initials = computed(() => {
  const words = (user.value?.name ?? '').trim().split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? '')).toUpperCase()
})

async function leave() {
  await signOut()
  await navigateTo('/')
}
</script>

<template>
  <div class="account">
    <template v-if="loggedIn">
      <span class="account__avatar" :title="user.name" aria-hidden="true">{{ initials }}</span>
      <span class="account__label">Signed in as {{ user.name }}</span>
      <LandingButton variant="line" size="sm" @click="leave">
        <LogOut class="account__icon" aria-hidden="true" :stroke-width="1.75" />
        <span class="account__label">{{ props.account.signOut }}</span>
      </LandingButton>
    </template>
    <LandingButton v-else :to="props.account.signIn.to" variant="line" size="sm">
      <UserRound class="account__icon" aria-hidden="true" :stroke-width="1.75" />
      <span class="account__label">{{ props.account.signIn.label }}</span>
    </LandingButton>
  </div>
</template>

<style scoped>
.account { display: flex; align-items: center; gap: 10px; }
.account__avatar { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid rgba(255, 255, 255, .55); border-radius: 50%; color: #fff; font: 700 13px/1 var(--vp-font); letter-spacing: .02em; }
.account__icon { display: none; width: 18px; height: 18px; }
/* words kept for screen readers, never drawn on screen (the "Sign out" label below 561px is hidden the same way) */
.account__label { position: absolute; width: 1px; height: 1px; overflow: hidden; white-space: nowrap; clip-path: inset(50%); }
.account .btn .account__label { position: static; width: auto; height: auto; overflow: visible; clip-path: none; }

@media (max-width: 560px) {
  .account__avatar { display: none; }
  .account .btn { width: 38px; height: 38px; padding: 0; }
  .account__icon { display: block; }
  .account .btn .account__label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
}
</style>
