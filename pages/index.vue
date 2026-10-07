<script setup>
import { landingContent as content } from '~/utils/landing-content'

// The home page. All copy and data come from utils/landing-content.js and flow into the components/landing/*
// sections as props; every "Try a demo" button points at content.demo.to (the trip form).
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: content.meta.title,
  description: content.meta.description,
  themeColor: content.meta.themeColor,
})

// The hero headline is set in the display face; fetch it before the first paint to avoid a visible font swap.
useHead({
  link: [
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/bricolage-grotesque-normal-300-800.woff2',
      crossorigin: 'anonymous',
    },
  ],
})
</script>

<template>
  <div>
    <LandingHero :nav="content.nav" :cta="content.demo" v-bind="content.hero" />
    <LandingFinder :cta="content.demo" v-bind="content.finder" />

    <main id="main">
      <LandingHowItWorks v-bind="content.how" />
      <LandingSamples :cta="content.demo" v-bind="content.samples" />
      <LandingLimits v-bind="content.limits" />
      <LandingQuotes v-bind="content.quotes" />
      <LandingClosing :cta="content.demo" v-bind="content.closing" />
    </main>

    <LandingFooter v-bind="content.footer" />
  </div>
</template>
