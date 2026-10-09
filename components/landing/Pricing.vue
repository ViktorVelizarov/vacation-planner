<script setup>
import { Check } from 'lucide-vue-next'

// The plans: five free trips with every account, then a monthly or a yearly subscription. The paid plans are not on sale
// yet, so they say "Coming soon" instead of offering a button that buys nothing.
//   plans  [{ id, name, price, per, tag?, best?, soon?, features[] }]
//          price and per read as "$6" / "per month"; the free plan's price is the number of trips ("5" / "free trips per account")
//   cta    { label, to }: the free plan's button
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  plans: { type: Array, required: true },
  soonLabel: { type: String, default: 'Coming soon' },
  note: { type: String, default: '' },
  cta: { type: Object, required: true },
})
</script>

<template>
  <section id="pricing" class="sec pricing" aria-labelledby="pricing-h">
    <div class="pricing__head">
      <p v-if="eyebrow" class="eyebrow mono">{{ eyebrow }}</p>
      <h2 id="pricing-h">{{ title }}</h2>
      <p v-if="text" class="pricing__lead">{{ text }}</p>
    </div>

    <ul class="plans">
      <li v-for="plan in plans" :key="plan.id" class="plan" :class="{ 'plan--free': !plan.soon, 'plan--best': plan.best }">
        <div class="plan__top">
          <h3>{{ plan.name }}</h3>
          <LandingPill v-if="plan.tag" tone="coral">{{ plan.tag }}</LandingPill>
        </div>
        <p class="plan__price">
          <span class="plan__amount">{{ plan.price }}</span>
          <span class="plan__per mono">{{ plan.per }}</span>
        </p>
        <ul class="plan__features">
          <li v-for="feature in plan.features" :key="feature"><Check aria-hidden="true" :stroke-width="2.25" />{{ feature }}</li>
        </ul>
        <LandingButton v-if="!plan.soon" class="plan__action" :to="cta.to" size="lg" arrow block>{{ cta.label }}</LandingButton>
        <p v-else class="plan__action plan__soon">{{ soonLabel }}</p>
      </li>
    </ul>

    <p v-if="note" class="pricing__note">{{ note }}</p>
  </section>
</template>

<style scoped>
.pricing { padding-bottom: 0; }
.pricing__head { max-width: 640px; margin-bottom: clamp(28px, 4vw, 48px); }
.pricing__lead { max-width: 52ch; margin-top: 18px; color: var(--vp-ink-2); text-wrap: pretty; }

.plans { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 0; padding: 0; list-style: none; }
.plan { display: flex; flex-direction: column; padding: clamp(24px, 2.6vw, 32px); border: 1px solid var(--vp-line); border-radius: 12px; background: #fff; }
.plan--free { background: var(--vp-paper); }
.plan--best { border: 2px solid var(--vp-blue); padding: calc(clamp(24px, 2.6vw, 32px) - 1px); }
.plan__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 28px; }
.plan__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; margin: 22px 0 0; }
.plan__amount { font: 800 clamp(2.6rem, 4vw, 3.4rem)/1 var(--vp-font); letter-spacing: -.04em; color: var(--vp-ink); font-feature-settings: "tnum" 1; }
.plan--free .plan__amount { color: var(--vp-blue); }
.plan__per { color: var(--vp-ink-3); font-size: 12px; }
.plan__features { display: grid; gap: 12px; margin: 26px 0 30px; padding: 22px 0 0; border-top: 1px solid var(--vp-line); list-style: none; color: var(--vp-ink-2); font-size: 15.5px; line-height: 1.45; }
.plan__features li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px; align-items: start; }
.plan__features svg { width: 18px; height: 18px; margin-top: 2px; color: var(--vp-blue); }
.plan__action { margin-top: auto; }
.plan__soon { display: grid; place-items: center; min-height: 52px; border-radius: var(--vp-radius); background: var(--vp-wash); color: var(--vp-blue-deep); font: 600 15px/1 var(--vp-font); }
.pricing__note { max-width: 70ch; margin-top: 20px; color: var(--vp-ink-3); font-size: 14.5px; line-height: 1.5; text-wrap: pretty; }

@media (max-width: 900px) {
  .plans { grid-template-columns: minmax(0, 1fr); max-width: 520px; }
}
</style>
