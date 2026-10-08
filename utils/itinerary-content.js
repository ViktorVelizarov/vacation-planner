// The words on the itinerary page (/itinerary), in one place, like trip-content.js and auth-content.js.

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

export const itineraryContent = {
  meta: (destination) => ({
    title: destination ? `${destination} trip — Vacation Planner` : 'Your trip — Vacation Planner',
    description: 'A day-by-day plan with places to see, places to eat and a map for each day.',
  }),

  back: 'Plan another trip',
  days: (n) => plural(n, 'day', 'days'),
  people: (n) => plural(n, 'person', 'people'),
  stops: (n) => plural(n, 'stop', 'stops'),
  facts: 'Trip details',

  // The day cards
  day: {
    label: (n) => `Day ${n}`,
    show: 'Show on map',
    showing: 'Showing on map',
    noMap: 'No map locations',
  },

  // While the plan is being drafted (around 20 seconds)
  loading: {
    title: 'Drafting your days',
    text: 'This takes around 20 seconds. The map appears when the days are ready.',
    map: 'Your map appears here when the days are ready.',
  },

  // The reply was not a plan, or the request failed
  failed: {
    text: (destination) => `We couldn't draft your plan${destination ? ` for ${destination}` : ''}. Try again, or change the trip.`,
    retry: 'Try again',
    change: 'Change the trip',
  },

  // A visit to /itinerary without a usable trip in the address
  missing: {
    title: 'No trip to show yet',
    text: 'Choose a destination and your dates and the plan appears here.',
    tooLong: (max) => `A trip can be at most ${max} days. Choose shorter dates and plan again.`,
    cta: 'Plan a trip',
  },

  // The map and its day buttons
  map: {
    label: 'Map of your trip',
    group: 'Show on the map',
    all: 'All days',
    none: 'No map locations for this day.',
    unavailable: 'The map could not load. Every stop is still listed in the days.',
    findingPhoto: 'Finding a photo…',
  },
}
