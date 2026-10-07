<script setup>
// A heading with a ghost button, then three sample-trip cards. Ratings and trip lengths are labelled samples.
//   destinations  see LandingDestinationCard
//   cta           { label, to }
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  destinations: { type: Array, required: true },
  cta: { type: Object, required: true },
})
</script>

<template>
  <section id="samples" class="sec samples" aria-labelledby="samples-h">
    <header class="sec__head">
      <div>
        <p v-if="eyebrow" class="eyebrow mono">{{ eyebrow }}</p>
        <h2 id="samples-h">{{ title }}</h2>
      </div>
      <LandingButton :to="cta.to" variant="ghost">{{ cta.label }}</LandingButton>
    </header>
    <div class="dest">
      <LandingDestinationCard v-for="destination in destinations" :key="destination.name" :destination="destination" :cta="cta" />
    </div>
  </section>
</template>

<style scoped>
.dest { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16px, 2.4vw, 30px); }

@media (max-width: 980px) {
  .dest { grid-template-columns: minmax(0, 1fr); max-width: 460px; margin-inline: auto; }
}
</style>
