<script setup>
import { Calendar, Compass, MapPin, Users } from 'lucide-vue-next'

// The trip form: where, when, what you like and how many are going, then "Plan my trip". It is the real version of the
// search card on the home page (same four fields, same look), and it hands the answers to the itinerary page exactly as
// it always has: the whole of `formData` as the query of /itinerary. Copy lives in utils/trip-content.js.
// Destination and dates are asked for before it will plan (a trip without dates silently became a 1-day plan), and the
// dates cannot run past the 10 days the page has always said it takes.
useSeoMeta({ title: tripContent.meta.title, description: tripContent.meta.description, robots: 'noindex' })

const copy = tripContent
const router = useRouter()
const route = useRoute()

// Three versions of the photos beside the form to choose from: /vacationForm?design=cluster | mosaic | reel (anything else keeps the single arch).
const design = computed(() => ['cluster', 'mosaic', 'reel'].find((name) => name === route.query.design) ?? null)

const formData = reactive({
  destination: '',
  selectedStartDate: null,
  selectedEndDate: null,
  selectedPreferences: [],
  people: 1,
})
const errors = reactive({ destination: '', dates: '' })
const busy = ref(false)
const trips = ref(null) // { limit, used, left } once the account's free trips are known
const out = computed(() => trips.value?.left === 0)
onMounted(async () => {
  try {
    trips.value = await $fetch('/api/demos')
  } catch {
    // the form works without the count; the server still holds the limit
  }
})

const daysBetween = (start, end) => Math.round((end - start) / 86400000) + 1

function updateSelectedDateRange(start, end) {
  formData.selectedStartDate = start
  formData.selectedEndDate = end
  if (start && end) errors.dates = ''
}
watch(() => formData.destination, (value) => {
  if (value.trim()) errors.destination = ''
})

function check() {
  const { destination, selectedStartDate: start, selectedEndDate: end } = formData
  errors.destination = destination.trim() ? '' : copy.destination.error
  errors.dates = !start || !end ? copy.dates.errorMissing : daysBetween(start, end) > MAX_TRIP_DAYS ? copy.dates.errorTooLong : ''
  return !errors.destination && !errors.dates
}

async function handleSubmit() {
  if (busy.value) return
  if (!check()) {
    await nextTick()
    document.getElementById(errors.destination ? 'trip-destination' : 'trip-dates')?.focus()
    return
  }
  formData.destination = formData.destination.trim()
  busy.value = true
  try {
    await router.push({ path: '/itinerary', query: formData })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="landing flex-grow">
    <LandingStage :title="copy.title" :lead="copy.lead" :art="copy.art">
      <LandingCard>
        <form class="form" novalidate :aria-busy="busy" @submit.prevent="handleSubmit">
          <TripField id="trip-dest" :icon="MapPin" :label="copy.destination.key" label-for="trip-destination" :error="errors.destination">
            <TripInput
              id="trip-destination"
              v-model="formData.destination"
              :placeholder="copy.destination.placeholder"
              :invalid="Boolean(errors.destination)"
              :describedby="errors.destination ? 'trip-dest-error' : undefined"
            />
          </TripField>

          <TripField id="trip-when" :icon="Calendar" :label="copy.dates.key" label-for="trip-dates" :note="copy.dates.note" :error="errors.dates">
            <DatePicker
              id="trip-dates"
              :invalid="Boolean(errors.dates)"
              :describedby="errors.dates ? 'trip-when-error' : undefined"
              labelledby="trip-when-key"
              @update:selectedDateRange="updateSelectedDateRange"
            />
          </TripField>

          <TripField id="trip-likes" :icon="Compass" :label="copy.interests.key" :note="copy.interests.note">
            <TripInterests v-model="formData.selectedPreferences" :options="copy.interests.options" labelledby="trip-likes-key" />
          </TripField>

          <TripField id="trip-who" :icon="Users" :label="copy.travelers.key" :note="copy.travelers.note">
            <TripTravelers v-model="formData.people" labelledby="trip-who-key" />
          </TripField>

          <LandingButton type="submit" size="lg" arrow block :disabled="busy || out">{{ busy ? copy.busy : copy.submit }}</LandingButton>
          <p v-if="out" class="wait" role="status">{{ copy.trips.out(trips.limit) }} <NuxtLink class="wait__link" to="/#pricing">{{ copy.trips.plans }}</NuxtLink></p>
          <p v-else class="wait">{{ copy.wait }}<span v-if="trips && !trips.unlimited" class="wait__trips">{{ copy.trips.left(trips.left, trips.limit) }}</span></p>
        </form>
      </LandingCard>
      <template v-if="design" #art>
        <TripGalleryCluster v-if="design === 'cluster'" :photos="tripGallery" />
        <TripGalleryMosaic v-else-if="design === 'mosaic'" :photos="tripGallery" />
        <TripGalleryReel v-else :photos="tripGallery" />
      </template>
    </LandingStage>
  </div>
</template>

<style scoped>
.form .btn { margin-top: 26px; }
.wait__trips { margin-left: .4em; color: var(--vp-ink); font-weight: 600; }
.wait__link { color: var(--vp-blue-deep); font-weight: 600; text-underline-offset: 3px; }
.wait { margin-top: 14px; text-align: center; color: var(--vp-ink-2); font: 400 14.5px/1.4 var(--vp-font); }
</style>
