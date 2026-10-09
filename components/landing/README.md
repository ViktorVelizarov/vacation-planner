# Landing page components

The home page (`pages/index.vue`) is assembled from these components. Its look is the "Blue Arch Booking" direction documented in the root `DESIGN.md`.

```
pages/index.vue            composes the sections; hands each one its slice of the content
layouts/landing.vue        bare layout for the home page and the account pages (skip link + <html> class)
layouts/default.vue        the app's working pages (trip form, itinerary): white bar with brand + account, footer
utils/landing-content.js   every string, number and image the page shows, in one place
assets/css/landing.css     fonts, --vp-* design tokens, base type (registered in nuxt.config.js)
assets/images/landing/     the photographs (+ .webp.json: the prompt each one was generated from)
public/fonts/              Bricolage Grotesque + Spline Sans Mono (self-hosted)
```

## Connecting it to the rest of the app

- **Where "Try a demo" goes.** Every button reads `DEMO_ROUTE` in `utils/landing-content.js` (now `/vacationForm`). Change it there and all of them follow. They are `NuxtLink`s, so navigation is client-side. The trip form is behind sign-in: a visitor without an account lands on `/sign-in` first and is sent on afterwards (`middleware/auth.global.js`, pages listed in `PROTECTED_PATHS`).
- **Real data instead of the samples.** Each section takes plain props, so a slice of `landingContent` can be replaced with anything of the same shape, for example in `pages/index.vue`:
  `const { data: quotes } = await useFetch('/api/quotes')` then `<LandingQuotes v-bind="content.quotes" :items="quotes" />`.
- **Samples stay labelled.** The quotes and the request in the search card are illustrative. Keep "Sample" in their strings until they are real (PRODUCT.md, "Sample means sample").
- **The search card is read-only on purpose.** It shows a sample request and links to the real form. Don't turn its fields into inputs here; prefill the form from a link or query string instead. The real form (`pages/vacationForm`) is drawn in the card's own vocabulary: the same four fields, each a wash icon tile, a mono key and a control.
- **Reusing a piece elsewhere.** `--vp-*` tokens and fonts are global, so `LandingButton`, `LandingPill`, `LandingPhoto` and `LandingBrand` work anywhere. Sections rely on the shared type and `.mono` / `.eyebrow` / `.sec` classes, which apply inside an element with class `landing` (the landing layout provides it).

## Components

| Component | Purpose | Main props |
|---|---|---|
| `LandingHero` | Full-bleed photo, nav, two-line headline | `image`, `headline[]`, `lead`, `nav[]`, `account`, `cta` |
| `LandingNav` | White nav over the photo | `links[]`, `account`, `cta` |
| `LandingAccount` | Nav control: Sign in, or an initials disc + Sign out (icon-only on phones). Reads the session itself. `ink` draws it for a white bar | `account`, `ink` |
| `LandingFinder` | The search-style card at the hero's edge: one read-only sample request and a link to the real form | `plan`, `cta` |
| `LandingHowItWorks` | Three numbered steps beside two arch photos | `eyebrow`, `title`, `steps[]`, `arches` |
| `LandingLimits` | Stat tiles beside an arch photo and day thumbnails | `eyebrow`, `title`, `text`, `tiles[]`, `art`, `thumbs[]` |
| `LandingQuotes` | Scroll-snap quote track with prev/next buttons | `eyebrow`, `title`, `label`, `items[]` |
| `LandingQuoteCard` | One quote | `quote` |
| `LandingPricing` | The plans: Free (5 free trips per account), Monthly, Yearly. The paid plans show "Coming soon" instead of a button until payments exist | `eyebrow`, `title`, `text`, `plans[]`, `soonLabel`, `note`, `cta` |
| `LandingClosing` | Final call to action | `title`, `text`, `cta` |
| `LandingFooter` | Brand, links, sample disclaimer | `links[]`, `credit`, `note` |
| `LandingButton` | The only button: a link with `to`, a real `<button>` without it. `variant` blue / white / line (outline on the photo) / ghost / tint, `size` sm / md / lg | `to`, `type`, `variant`, `size`, `arrow`, `block` |
| `LandingPill` | Number / day capsule, `tone` blue / coral / peach | `tone` |
| `LandingPhoto` | Processed photo slot (halftone + grain), `shape` rect / arch | `src`, `alt`, `shape`, `standin` |
| `LandingBrand` | Arch mark + wordmark | `to`, `ink` |
| `LandingStage` | The body of an account or app page: headline, short lead, the page's content, and photography beside it: one arch (`art`) or whatever fills the `art` slot (hidden under 980px) | `title`, `lead`, `art` |
| `LandingCard` | The 14px hairline card (`attached` squares the corner under a tab strip) | `attached` |
| `LandingSkipLink` | "Skip to content" for keyboard users, pointing at `<main id="main">` | none |

`cta` is always `{ label, to }`. Each component's header comment lists the exact shape of its other props.

## Images

- Photos live in `assets/images/landing/` and are imported in `utils/landing-content.js`; swap a file in place to change a picture. The `.webp.json` next to each image is the prompt it came from.
- Every slot has a photograph. The hero is generated (the Lisbon, Kyoto and Reykjavík pictures, once the sample trips, are still in the folder but no longer used on the home page); the six others (`how.arches.big` / `.small`, `limits.art`, `limits.thumbs[].image`) are free-to-use Unsplash photographs (Santorini, Venice, Amsterdam, a café table, a museum, a night street). Each has a `.webp.json` next to it with its source page, photographer and licence instead of a prompt. To swap one, replace the file or set `{ src, alt, width, height }` (sizes are in the comments in `landing-content.js`).
- The hero is 1280x724. A 2400x1350 export would be sharper on wide screens; the figure should stay right of centre with the lower fifth empty, since the search card covers it.
- Never tint or restyle a photo per image; `LandingPhoto` and `LandingHero` apply the same halftone + grain recipe to all of them.

## Account pages
Four pages share one frame (`AuthShell`: brand and way back above a `LandingStage` with the headline, the page's `LandingCard` and the Lisbon arch) in this same design world: `pages/sign-in.vue` and `pages/sign-up.vue` (`AuthPage` puts the Sign in / Create account tab strip on top of a card holding `AuthForm` and `AuthField`), `pages/check-email.vue` ("Check your inbox": `AuthCheckEmail`, with the Resend button and its countdown) and `pages/verify-email.vue` (where the emailed link lands: `AuthConfirm`, one button). `LandingAlert` is the error box they all use. Their copy is in `utils/auth-content.js`; the checks that run in the form are the server's own (`server/auth/rules.js`). Creating an account does not sign anyone in: it sends them to "Check your inbox", and pressing the button on the emailed link confirms the address, signs in and opens the trip form. The email itself is `server/auth/mail-template.js`. The server side lives in `server/auth/` and `server/api/auth/`; see the root README ("Accounts") for the environment variables and deployment.

## Trip form
`pages/vacationForm/index.vue` is the real version of the search card, on the same `LandingStage` and `LandingCard`, with a wall of six photographs beside it (`TripGalleryMosaic` in `components/trip/`, fed by `utils/trip-gallery.js`: Kyoto, Lisbon, Reykjavík, Santorini, Venice, Amsterdam; two columns, the right one stepped down, the first tile an arch, each with its place on a white chip). The wall sits in `LandingStage`'s `art` slot. Each question is a `TripField` (`components/trip/`): a wash icon tile, a mono key, a control that shares one visible edge colour. The controls are `TripInput`, `DatePicker` (the shadcn range calendar in a popover, themed in `components/DatePicker.vue`; it starts empty, shows one month on phones, and switches off days that would make a trip longer than `MAX_TRIP_DAYS`), `TripInterests` (the shadcn toggle group as chips) and `TripTravelers` (a stepper that stops at 1 and 10). The words are in `utils/trip-content.js`. Destination and dates are required before it plans; what it hands to `/itinerary` (the whole of `formData` as the query) is unchanged. The page sits in `layouts/default.vue`, whose bar and footer it shares with the itinerary page.

## Itinerary page
`pages/Itinerary/index.vue` is where the trip form leads (`/itinerary?destination=…&selectedStartDate=…`, the query the form sends). The header is the trip as it was asked for, read from the address, so it needs no waiting: the destination, chips for dates, travellers and interests, and the destination's arch photograph and description (a faster lookup that fills in on its own). The plan itself takes around 20 seconds, so the page shows one placeholder card per day and a note that says so. When the plan cannot be drafted, or the address is not a trip (no destination or dates, or more than `MAX_TRIP_DAYS`), the page says that and offers the way on (Try again, Change the trip, Plan a trip) instead of a browser pop-up.

Reading the model's reply is `utils/itinerary.js`: plain functions with no Vue in them (`parseItinerary`, `calendarDay`, `daysBetween`, `interestsFrom`, `toneOfDay`), so they can be tested alone. The words are in `utils/itinerary-content.js`. The cards are `TripDay` (`components/trip/Day.vue`): a Day pill in the fixed blue, coral, peach order, the title and its stop count, and a head that is one button folding the card (`aria-expanded`, a chevron). Folded, a day is one row, so a ten-day trip stays a short page; open, it shows its stops, numbered like their markers, under a "Show on map" button. The plan opens with only Day 1 showing; a row above the days counts them ("4 days · 14 stops") with Expand all / Collapse all. Pressing a day's Show on map, or its button on the map, opens that day alone and closes the others (in the wide layout the page scrolls to the card if it is out of view, never so far that the pinned map starts to slide up); All days leaves what is open as it is. The map is `TripMap` (`components/trip/Map.vue`): one Mapbox map in the light style tinted toward the page, showing every day's stops at once (each in its day's pill colour) or one day's stops numbered 1, 2, 3 and joined by a walking route. A marker opens a card with the place's photo and first sentence; it is built from DOM nodes, never from an HTML string, because the names come from a language model.

Under 980px the map sits above the days, the day buttons wrap into a grid under its edge, and choosing a day scrolls the map into view. In the wide layout the map is pinned just under the header: `layouts/default.vue` sets `--app-bar` (the header's height) for that. The page needs no setting of its own; the Mapbox token in `TripMap` is a public `pk.` token and should be restricted to this site's addresses in the Mapbox dashboard.
