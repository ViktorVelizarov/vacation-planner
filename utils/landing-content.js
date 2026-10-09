// Everything the landing page says and shows, in one place.
// pages/index.vue hands each slice to a components/landing/* section as props, so swapping this file
// (or replacing a slice with data from useFetch) changes the page without touching any component.
//
// Anything marked "Sample" is illustrative, not real: PRODUCT.md requires it to stay labelled as such
// wherever a visitor could mistake it for a claim, so keep the word when you edit the strings.

import paris from '~/assets/images/landing/paris.webp'
import santorini from '~/assets/images/landing/santorini.webp'
import venice from '~/assets/images/landing/venice.webp'
import amsterdam from '~/assets/images/landing/amsterdam.webp'
import dayMorning from '~/assets/images/landing/day-morning.webp'
import dayMuseum from '~/assets/images/landing/day-museum.webp'
import dayEvening from '~/assets/images/landing/day-evening.webp'
import { FREE_TRIPS } from '~/utils/limits'

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

/** Where every "Try a demo" button goes: the real trip form. Change it here and every button follows. */
export const DEMO_ROUTE = '/vacationForm'

const demo = { label: 'Try a demo', to: DEMO_ROUTE }

export const landingContent = {
  meta: {
    title: 'Vacation Planner — Your next trip, planned day by day',
    description:
      "Tell Vacation Planner where you're going, when, and what you like. It plans every day, with places to see, places to eat and a map for each. Try a demo.",
    themeColor: '#1f2d52',
  },

  demo,

  nav: [
    { label: 'How it works', to: '#how' },
    { label: 'Limits', to: '#limits' },
    { label: 'Quotes', to: '#quotes' },
    { label: 'Pricing', to: '#pricing' },
  ],

  // The nav's account control: a "Sign in" button, or the visitor's name and "Sign out" once signed in.
  // The demo itself needs an account: /vacationForm and the demo API send visitors here first.
  account: {
    signIn: { label: 'Sign in', to: '/sign-in' },
    signOut: 'Sign out',
  },

  // Hero photograph: 16:9, the lone figure right of centre (x ~65%, head ~58%) so the headline sits above it
  // and the search card covers wall, not subject. Source file is 1280x724; a 2400x1350 export is better.
  hero: {
    headline: ['Your Next Trip,', 'Planned Day by Day'],
    lead: 'Tell us where, when and what you like. We draft every day, with places to see, places to eat and a map for each.',
    image: {
      src: paris,
      width: 1280,
      height: 724,
      alt: 'A lone traveler at a stone quay looking across the Seine at the Paris skyline and the Eiffel Tower at dusk',
    },
  },

  // The search-style card at the hero's edge. Deliberately read-only: the real inputs live on the trip form.
  finder: {
    label: 'Start a trip',
    plan: {
      fields: [
        { icon: 'pin', label: 'Destination', value: 'Lisbon, Portugal' },
        { icon: 'calendar', label: 'Dates', value: '12 – 14 Oct', note: '3 days' },
        { icon: 'compass', label: 'Interests', value: 'Historical, Art & cultural' },
        { icon: 'users', label: 'Travelers', value: '2 people' },
      ],
    },
  },

  how: {
    eyebrow: 'How it works',
    title: 'Three steps from idea to itinerary',
    steps: [
      { pill: '01', tone: 'blue', title: 'Tell us the trip', text: 'Destination, dates of up to ten days, what you like, and how many are going.' },
      { pill: '02', tone: 'coral', title: 'Read your days', text: 'A plan for every day, with places to see, places to eat and a line about each.' },
      { pill: '03', tone: 'peach', title: 'Follow the map', text: 'Numbered stops joined by a walking route. Tap a stop for a photo.' },
    ],
    // Photo slots: big is 900x1200 (3:4), small 640x900 (32:45).
    arches: {
      big: { src: santorini, width: 900, height: 1200, alt: 'White chapels with blue domes above the sea on Santorini, Greece' },
      small: { src: venice, width: 640, height: 900, alt: 'A gondola on a narrow canal between warm-coloured houses in Venice' },
    },
  },

  limits: {
    eyebrow: 'Built for real trips',
    title: 'A plan that fits an actual trip',
    text: 'Up to ten days, one to ten travelers, five ways to steer it. Every day gets its own map, with numbered stops and a walking route between them.',
    tiles: [
      { value: '10', label: 'Days per plan, at most' },
      { value: '5', label: 'Interests to steer it' },
      { value: '1', label: 'Map for every day' },
    ],
    // Photo slots: art is 900x1200 (3:4), thumbnails are squares shown at about 86px (480x480 for sharp screens).
    art: { src: amsterdam, width: 900, height: 1200, alt: 'Tall canal houses with mirrored windows rising from the water in Amsterdam' },
    thumbsLabel: 'Three sample days',
    thumbs: [
      { caption: 'Day 1', image: { src: dayMorning, width: 480, height: 480, alt: 'A cappuccino and a croissant on a wooden café table' } },
      { caption: 'Day 2', image: { src: dayMuseum, width: 480, height: 480, alt: 'A visitor walking through a quiet museum gallery' } },
      { caption: 'Day 3', image: { src: dayEvening, width: 480, height: 480, alt: 'A cobbled street with café tables under string lights at night' } },
    ],
  },

  quotes: {
    eyebrow: 'Sample quotes · for illustration',
    title: 'What our travelers say',
    label: 'Sample traveler quotes',
    items: [
      {
        text: 'I typed Lisbon, three days, history and art. The plan came back with a map for every day, and we followed it almost stop for stop.',
        name: 'Maya R.',
        meta: 'Rotterdam · Sample',
        initials: 'MR',
      },
      {
        text: 'The meal stops were the surprise. Every day had a lunch and a dinner I would not have found on my own.',
        name: 'Daniel O.',
        meta: 'Leeds · Sample',
        initials: 'DO',
      },
      {
        text: 'We were four adults and a seven-year-old. Ticking “kid friendly” changed what the whole itinerary looked like.',
        name: 'Priya N.',
        meta: 'Toronto · Sample',
        initials: 'PN',
      },
      {
        text: 'Signing up took a minute. Then I filled in the form and had a trip.',
        name: 'Tomás V.',
        meta: 'Porto · Sample',
        initials: 'TV',
      },
    ],
  },

  // The plans. The paid ones are not on sale yet (soon: true), so they show "Coming soon" instead of a button; the free
  // allowance is real and enforced on the server (FREE_TRIPS, server/auth/demos.js). Keep this honest when payments arrive.
  pricing: {
    eyebrow: 'Pricing',
    title: `${WORDS[FREE_TRIPS] ?? FREE_TRIPS} trips free, then pick a plan`,
    text: `Every account can plan ${FREE_TRIPS} trips for free, no card. When they are used up, plan as many as you like with a monthly or a yearly plan.`,
    soonLabel: 'Coming soon',
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: String(FREE_TRIPS),
        per: 'free trips per account',
        features: ['A full plan for every day', 'Places to see and places to eat', 'A map with a walking route for each day', 'Up to 10 days a trip'],
      },
      {
        id: 'monthly',
        name: 'Monthly',
        price: '$6',
        per: 'per month',
        soon: true,
        features: ['Unlimited trips', 'Everything in Free', 'Cancel any time'],
      },
      {
        id: 'yearly',
        name: 'Yearly',
        price: '$48',
        per: 'per year',
        tag: 'Best value',
        best: true,
        soon: true,
        features: ['Unlimited trips', 'Everything in Free', 'Works out at $4 a month: two months free'],
      },
    ],
    note: 'Prices are in US dollars. The paid plans open soon; your free trips work today with a free account.',
  },

  closing: {
    title: 'Ready to plan yours?',
    text: `Four answers in, a whole trip out. Your first ${FREE_TRIPS} trips are free: no card.`,
  },

  footer: {
    links: [
      { label: 'How it works', to: '#how' },
      { label: 'Limits', to: '#limits' },
      { label: 'Pricing', to: '#pricing' },
      demo,
    ],
    // The footer prints "© <current year> " in front of the credit line.
    credit: 'Vacation Planner · Itineraries drafted by an OpenAI model · Maps by Mapbox',
    note: 'The request in the card and the quotes on this page are samples',
  },
}
