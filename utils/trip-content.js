// The words on the trip form (/vacationForm), in one place, like landing-content.js and auth-content.js.
// The four field names are the ones the home page's search card shows (Destination, Dates, Interests, Travelers), so the
// trip sketched there is the trip filled in here.

import kyoto from '~/assets/images/landing/kyoto.webp'

/** The longest trip the planner takes (the form has always said "max 10 days"; now the date field holds to it). */
export const MAX_TRIP_DAYS = 10
export const MIN_TRAVELERS = 1
export const MAX_TRAVELERS = 10

export const tripContent = {
  meta: {
    title: 'Plan your trip — Vacation Planner',
    description: 'Tell Vacation Planner where you are going, when, what you like and how many are travelling.',
  },

  title: 'Plan your next adventure',
  lead: "Four quick answers, and we'll plan every day for you.",

  destination: {
    key: 'Destination',
    placeholder: 'Where are you going?',
    error: 'Enter a destination.',
  },
  dates: {
    key: 'Dates',
    note: `Up to ${MAX_TRIP_DAYS} days`,
    empty: 'Choose your dates',
    calendarLabel: 'Trip dates',
    errorMissing: 'Choose your dates.',
    errorTooLong: `Choose up to ${MAX_TRIP_DAYS} days.`,
    days: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
    previous: 'Previous month',
    next: 'Next month',
  },
  interests: {
    key: 'Interests',
    note: 'Optional',
    options: ['Kid Friendly', 'Museums', 'Shopping', 'Historical', 'Art & Cultural'],
  },
  travelers: {
    key: 'Travelers',
    note: `${MIN_TRAVELERS} to ${MAX_TRAVELERS}`,
    people: (n) => (n === 1 ? 'person' : 'people'),
    fewer: 'Fewer people',
    more: 'More people',
  },

  submit: 'Plan my trip',
  busy: 'Planning…',
  wait: 'Drafting takes around 20 seconds.',

  // The photograph beside the form and its caption, as on the account pages.
  art: { src: kyoto, width: 1200, height: 1200, place: 'Kyoto', coords: '35.01° N 135.77° E' },
}
