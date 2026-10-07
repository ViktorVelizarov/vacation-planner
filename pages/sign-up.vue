<script setup>
// Create an account. Free; the trip form opens straight after.
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Create your account — Vacation Planner',
  description: 'Create a free Vacation Planner account to open the trip form.',
  robots: 'noindex',
})
</script>

<template>
  <AuthPage mode="signup" />
</template>
