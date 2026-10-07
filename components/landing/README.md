# Landing page components

The home page (`pages/index.vue`) is assembled from these components. Its look is the "Blue Arch Booking" direction documented in the root `DESIGN.md`.

```
pages/index.vue            composes the sections; hands each one its slice of the content
layouts/landing.vue        bare layout (skip link + <html> class); other pages keep layouts/default.vue
utils/landing-content.js   every string, number and image the page shows, in one place
assets/css/landing.css     fonts, --vp-* design tokens, base type (registered in nuxt.config.js)
assets/images/landing/     the photographs (+ .webp.json: the prompt each one was generated from)
public/fonts/              Bricolage Grotesque + Spline Sans Mono (self-hosted)
```

## Connecting it to the rest of the app

- **Where "Try a demo" goes.** Every button reads `DEMO_ROUTE` in `utils/landing-content.js` (now `/vacationForm`). Change it there and all of them follow. They are `NuxtLink`s, so navigation is client-side.
- **Real data instead of the samples.** Each section takes plain props, so a slice of `landingContent` can be replaced with anything of the same shape, for example in `pages/index.vue`:
  `const { data: destinations } = await useFetch('/api/destinations')` then `<LandingSamples :destinations="destinations" ... />`.
- **Samples stay labelled.** Ratings, trip lengths, quotes and the request in the search card are illustrative. Keep "Sample" in their strings until they are real (PRODUCT.md, "Sample means sample").
- **The search card is read-only on purpose.** It shows a sample request and links to the real form. Don't turn its fields into inputs here; prefill the form from a link or query string instead.
- **Reusing a piece elsewhere.** `--vp-*` tokens and fonts are global, so `LandingButton`, `LandingPill`, `LandingPhoto` and `LandingBrand` work anywhere. Sections rely on the shared type and `.mono` / `.eyebrow` / `.sec` classes, which apply inside an element with class `landing` (the landing layout provides it).

## Components

| Component | Purpose | Main props |
|---|---|---|
| `LandingHero` | Full-bleed photo, nav, two-line headline | `image`, `headline[]`, `lead`, `nav[]`, `cta` |
| `LandingNav` | White nav over the photo | `links[]`, `cta` |
| `LandingFinder` | Tabbed search-style card at the hero's edge (a real tablist) | `plan`, `sample`, `cta` |
| `LandingHowItWorks` | Three numbered steps beside two arch photos | `eyebrow`, `title`, `steps[]`, `arches` |
| `LandingSamples` | Section heading + destination cards | `eyebrow`, `title`, `destinations[]`, `cta` |
| `LandingDestinationCard` | Photo, rating chip, place, trip length, button | `destination`, `cta` |
| `LandingLimits` | Stat tiles beside an arch photo and day thumbnails | `eyebrow`, `title`, `text`, `tiles[]`, `art`, `thumbs[]` |
| `LandingQuotes` | Scroll-snap quote track with prev/next buttons | `eyebrow`, `title`, `label`, `items[]` |
| `LandingQuoteCard` | One quote | `quote` |
| `LandingClosing` | Final call to action | `title`, `text`, `cta` |
| `LandingFooter` | Brand, links, sample disclaimer | `links[]`, `credit`, `note` |
| `LandingButton` | The only button: `variant` blue / white / ghost / tint, `size` sm / md / lg, `arrow` | `to`, `variant`, `size`, `arrow` |
| `LandingPill` | Number / day capsule, `tone` blue / coral / peach | `tone` |
| `LandingPhoto` | Processed photo slot (halftone + grain), `shape` rect / arch | `src`, `alt`, `shape`, `standin` |
| `LandingBrand` | Arch mark + wordmark | `to`, `ink` |

`cta` is always `{ label, to }`. Each component's header comment lists the exact shape of its other props.

## Images

- Photos live in `assets/images/landing/` and are imported in `utils/landing-content.js`; swap a file in place to change a picture. The `.webp.json` next to each image is the prompt it came from.
- Slots still showing a flat blue stand-in: `how.arches.big` / `.small`, `limits.art` and `limits.thumbs[].image`. Set `{ src, alt, width, height }` to fill one (sizes are in the comments in `landing-content.js`).
- The hero is 1280x724. A 2400x1350 export would be sharper on wide screens; the figure should stay right of centre with the lower fifth empty, since the search card covers it.
- Never tint or restyle a photo per image; `LandingPhoto` and `LandingHero` apply the same halftone + grain recipe to all of them.
