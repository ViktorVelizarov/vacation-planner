<script setup>
// Sign in. Visitors without an account are sent here from "Try a demo" (see middleware/auth.global.js).
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Sign in — Vacation Planner',
  description: 'Sign in to Vacation Planner to open the trip form.',
  robots: 'noindex',
})
</script>

<template>
  <AuthPage mode="signin" />
</template>
