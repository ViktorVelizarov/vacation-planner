// Everything the landing page says and shows, in one place.
// pages/index.vue hands each slice to a components/landing/* section as props, so swapping this file
// (or replacing a slice with data from useFetch) changes the page without touching any component.
//
// Anything marked "Sample" is illustrative, not real: PRODUCT.md requires it to stay labelled as such
// wherever a visitor could mistake it for a claim, so keep the word when you edit the strings.

import paris from '~/assets/images/landing/paris.webp'
import lisbon from '~/assets/images/landing/lisbon.webp'
import kyoto from '~/assets/images/landing/kyoto.webp'
import reykjavik from '~/assets/images/landing/reykjavik.webp'

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
    { label: 'Samples', to: '#samples' },
    { label: 'Limits', to: '#limits' },
    { label: 'Quotes', to: '#quotes' },
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
    lead: 'Tell us where, when and what you like. Our AI drafts every day, with places to see, places to eat and a map for each.',
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
    tabsLabel: 'Demo views',
    plan: {
      tab: 'Plan a trip',
      head: ['Sample request', 'Trip VP-48201'],
      fields: [
        { icon: 'pin', label: 'Destination', value: 'Lisbon, Portugal' },
        { icon: 'calendar', label: 'Dates', value: '12 – 14 Oct', note: '3 days' },
        { icon: 'compass', label: 'Interests', value: 'Historical, Art & cultural' },
        { icon: 'users', label: 'Travelers', value: '2 people' },
      ],
    },
    sample: {
      tab: 'See a sample',
      head: ['Sample itinerary', 'Trip VP-48201 · 3 days'],
      days: [
        { tone: 'blue', pill: 'Day 1', title: 'Alfama & the river', meta: '5 stops · 2 meals' },
        { tone: 'coral', pill: 'Day 2', title: 'Belém & the waterfront', meta: '5 stops · 2 meals' },
        { tone: 'peach', pill: 'Day 3', title: 'Chiado & Bairro Alto', meta: '4 stops · 2 meals' },
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
    // Photo slots still waiting for images. Pass { src, alt } to fill one: big is 900x1200 (3:4), small 640x900 (32:45).
    arches: { big: null, small: null },
  },

  samples: {
    eyebrow: 'Sample itineraries',
    title: 'Start from a sample trip',
    // Ratings are samples, not reviews. Square 1200x1200 photos; the card crops them to 9:10 (4:3 on small screens).
    destinations: [
      {
        name: 'Lisbon',
        country: 'Portugal',
        coords: '38.72° N 9.14° W',
        rating: '4.9',
        ratingTag: 'Sample',
        days: '3 days',
        party: 'for 2 travelers',
        image: {
          src: lisbon,
          width: 1200,
          height: 1200,
          alt: "A vintage tram climbing a steep cobbled street in Lisbon's Alfama district at blue hour, the Tagus and the 25 de Abril Bridge at the top",
        },
      },
      {
        name: 'Kyoto',
        country: 'Japan',
        coords: '35.01° N 135.77° E',
        rating: '4.8',
        ratingTag: 'Sample',
        days: '4 days',
        party: 'for 2 travelers',
        standin: '#243b8c',
        image: {
          src: kyoto,
          width: 1200,
          height: 1200,
          alt: "The Yasaka Pagoda silhouetted at the end of a lantern-lit lane in Kyoto's Higashiyama district at dusk",
        },
      },
      {
        name: 'Reykjavík',
        country: 'Iceland',
        coords: '64.15° N 21.94° W',
        rating: '4.7',
        ratingTag: 'Sample',
        days: '3 days',
        party: 'for 4 travelers',
        standin: '#5d77d6',
        image: {
          src: reykjavik,
          width: 1200,
          height: 1200,
          alt: 'The Hallgrímskirkja church tower floodlit above snow-dusted rooftops in Reykjavík at blue hour',
        },
      },
    ],
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
    // Photo slots still waiting for images: art is 900x1200 (3:4), thumbnails 240x240. Pass { src, alt } to fill one.
    art: null,
    thumbsLabel: 'Three sample days',
    thumbs: [
      { caption: 'Day 1', image: null },
      { caption: 'Day 2', image: null, standin: '#243b8c' },
      { caption: 'Day 3', image: null, standin: 'var(--vp-peach)', darkCaption: true },
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

  closing: {
    title: 'Ready to plan yours?',
    text: 'Four answers in, a whole trip out. A free account opens the live trip form: no card.',
  },

  footer: {
    links: [
      { label: 'How it works', to: '#how' },
      { label: 'Samples', to: '#samples' },
      { label: 'Limits', to: '#limits' },
      demo,
    ],
    // The footer prints "© <current year> " in front of the credit line.
    credit: 'Vacation Planner · Itineraries drafted by an OpenAI model · Maps by Mapbox',
    note: 'Ratings, trip lengths and quotes on this page are samples',
  },
}
