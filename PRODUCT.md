# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The app is Nuxt 3 / Vue 3 with Tailwind and shadcn-vue. The landing page is the "Blue Arch Booking" direction, picked from five static HTML/CSS explorations (since deleted) and ported into the app as Vue components: `components/landing/`, page `pages/index.vue`, layout `layouts/landing.vue`, copy and data in `utils/landing-content.js`, styles scoped per component plus `assets/css/landing.css`.

## Users

Leisure travelers planning a short trip, alone or in a group, who want a ready-made day-by-day plan instead of hours of research across tabs. Inferred from the app's form (destination, dates, interests, party size); not interviewed.

## Product Purpose

Vacation Planner generates a custom vacation itinerary with AI. The visitor enters a destination, a date range (up to 10 days), the kinds of activity they like and how many people are going. An OpenAI model (GPT-4o) writes a plan for every day, naming places to visit and places to eat. Each stop carries coordinates, and Mapbox GL draws the day on a map. Success for a landing page: the visitor tries the demo, meaning they reach the real trip form.

## Positioning

Not yet confirmed with the owner. Facts that can carry it today: free to try, no sign-up, one request in and a whole trip out, and a map for every day with a numbered walking route and a photo plus one-line description for each stop. The underlying model is not a differentiator.

## Operating Context

The visitor flow in the current app: landing page, then `/vacationForm` (one screen: destination, date range, activity toggles, traveler count), then the itinerary page (destination header with photo and description, chips for dates, travelers and interests, a list of days, and a map beside it). Clicking a day's title maps that day; the default map shows every day's stops. Generation is slow enough that the author's own on-screen notice tells visitors to wait around 20 seconds. Deployed on Vercel (inferred from commit history); the public URL is not recorded in the repo.

## Capabilities and Constraints

- Inputs: destination (free text), date range of at most 10 days, any of five interests (Kid Friendly, Museums, Shopping, Historical, Art & Cultural), 1 to 10 travelers.
- Output: per day, named places to visit and places to eat with a short description, plus coordinates. Map markers are numbered; the route between a day's stops is a walking route (Mapbox Directions). Clicking a marker shows a photo, the place name and the first sentence of its description.
- No accounts or sign-in exist in the app.
- Not present, so never claimed: flight or hotel booking, prices or budgets, ratings or reviews, newsletter, saved trips, editing or reordering of generated activities, a "find similar attractions" feature (removed 2026-10-05).
- Plans are drafted by a language model at low temperature; coordinates and names come from the model, so copy must not promise perfect or optimal routes.
- The "Try a demo" destination is `/vacationForm` on the same origin as the app (confirmed 2026-10-06).

## Brand Commitments

- Product name: Vacation Planner. Primary action on the landing page: "Try a demo", in the hero and again at the end of the page.
- User-volunteered visual guardrails for the landing page (recorded, not expanded): one monumental image anchors the page; imagery is processed, never raw; technical marginalia; type at extremes; near-monochrome ground with a single warm accent. Never: purple gradients, glossy 3D SaaS blobs, untextured stock photography, rounded-everything friendliness, icon-grid feature rows, Inter or system-font-only typography, evenly-distributed colorful palettes.
- The current app's logo image, wordmark face and watercolor background are not carried over to the landing page, whose own direction replaces the look.

## Evidence on Hand

- Real material: the README, three build write-ups in `documentation/` (Vacation Itinerary Generator, Attraction Search, Generating Maps with custom routes), and the source of the app.
- Absent and not to be presented as real: testimonials, ratings, prices, user or trip counts, press, customers, product screenshots, a demo video, a public URL.
- Imagery: the landing hero (Paris quay, `assets/images/landing/paris.webp`, currently 1280x724) and its three destination cards (Lisbon, Kyoto, Reykjavik, 1200x1200) are owner-generated on higgsfield.ai, with prompts recorded in the `.webp.json` sidecars. Every other image slot still ships with a flat stand-in; no photography is sourced.
- Policy confirmed 2026-10-06: the landing page may carry synthetic ratings, prices, counts and quotes when each is visibly labeled as sample, and the build ends with a list of everything to replace.

## Product Principles

1. The demo is the product. Every path ends at the real trip form, and the page shows the mechanism (a trip going in, a mapped day-by-day plan coming out) instead of describing benefits.
2. Claim only what the code does. A model-drafted plan with named stops, meals and a walking-route map per day; no bookings, budgets or guarantees.
3. Sample means sample. Anything synthetic is labeled wherever a visitor could mistake it for real, and tracked for replacement.
4. Trip-sized proof. Use the product's real limits (up to 10 days, 1 to 10 travelers, five interests) as its scale.
