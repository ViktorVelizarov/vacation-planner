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

- **Where "Try a demo" goes.** Every button reads `DEMO_ROUTE` in `utils/landing-content.js` (now `/vacationForm`). Change it there and all of them follow. They are `NuxtLink`s, so navigation is client-side. The trip form is behind sign-in: a visitor without an account lands on `/sign-in` first and is sent on afterwards (`middleware/auth.global.js`, pages listed in `PROTECTED_PATHS`).
- **Real data instead of the samples.** Each section takes plain props, so a slice of `landingContent` can be replaced with anything of the same shape, for example in `pages/index.vue`:
  `const { data: destinations } = await useFetch('/api/destinations')` then `<LandingSamples :destinations="destinations" ... />`.
- **Samples stay labelled.** Ratings, trip lengths, quotes and the request in the search card are illustrative. Keep "Sample" in their strings until they are real (PRODUCT.md, "Sample means sample").
- **The search card is read-only on purpose.** It shows a sample request and links to the real form. Don't turn its fields into inputs here; prefill the form from a link or query string instead.
- **Reusing a piece elsewhere.** `--vp-*` tokens and fonts are global, so `LandingButton`, `LandingPill`, `LandingPhoto` and `LandingBrand` work anywhere. Sections rely on the shared type and `.mono` / `.eyebrow` / `.sec` classes, which apply inside an element with class `landing` (the landing layout provides it).

## Components

| Component | Purpose | Main props |
|---|---|---|
| `LandingHero` | Full-bleed photo, nav, two-line headline | `image`, `headline[]`, `lead`, `nav[]`, `account`, `cta` |
| `LandingNav` | White nav over the photo | `links[]`, `account`, `cta` |
| `LandingAccount` | Nav control: Sign in, or an initials disc + Sign out (icon-only on phones). Reads the session itself | `account` |
| `LandingFinder` | Tabbed search-style card at the hero's edge (a real tablist) | `plan`, `sample`, `cta` |
| `LandingHowItWorks` | Three numbered steps beside two arch photos | `eyebrow`, `title`, `steps[]`, `arches` |
| `LandingSamples` | Section heading + destination cards | `eyebrow`, `title`, `destinations[]`, `cta` |
| `LandingDestinationCard` | Photo, rating chip, place, trip length, button | `destination`, `cta` |
| `LandingLimits` | Stat tiles beside an arch photo and day thumbnails | `eyebrow`, `title`, `text`, `tiles[]`, `art`, `thumbs[]` |
| `LandingQuotes` | Scroll-snap quote track with prev/next buttons | `eyebrow`, `title`, `label`, `items[]` |
| `LandingQuoteCard` | One quote | `quote` |
| `LandingClosing` | Final call to action | `title`, `text`, `cta` |
| `LandingFooter` | Brand, links, sample disclaimer | `links[]`, `credit`, `note` |
| `LandingButton` | The only button: a link with `to`, a real `<button>` without it. `variant` blue / white / line (outline on the photo) / ghost / tint, `size` sm / md / lg | `to`, `type`, `variant`, `size`, `arrow`, `block` |
| `LandingPill` | Number / day capsule, `tone` blue / coral / peach | `tone` |
| `LandingPhoto` | Processed photo slot (halftone + grain), `shape` rect / arch | `src`, `alt`, `shape`, `standin` |
| `LandingBrand` | Arch mark + wordmark | `to`, `ink` |

`cta` is always `{ label, to }`. Each component's header comment lists the exact shape of its other props.

## Images

- Photos live in `assets/images/landing/` and are imported in `utils/landing-content.js`; swap a file in place to change a picture. The `.webp.json` next to each image is the prompt it came from.
- Slots still showing a flat blue stand-in: `how.arches.big` / `.small`, `limits.art` and `limits.thumbs[].image`. Set `{ src, alt, width, height }` to fill one (sizes are in the comments in `landing-content.js`).
- The hero is 1280x724. A 2400x1350 export would be sharper on wide screens; the figure should stay right of centre with the lower fifth empty, since the search card covers it.
- Never tint or restyle a photo per image; `LandingPhoto` and `LandingHero` apply the same halftone + grain recipe to all of them.

## Account pages
Four pages share one frame (`AuthShell`: brand and way back, headline, the page's card, the Lisbon arch) in this same design world: `pages/sign-in.vue` and `pages/sign-up.vue` (`AuthPage` puts the Sign in / Create account tab strip on top of an `AuthCard` holding `AuthForm` and `AuthField`), `pages/check-email.vue` ("Check your inbox": `AuthCheckEmail`, with the Resend button and its countdown) and `pages/verify-email.vue` (where the emailed link lands: `AuthConfirm`, one button). `AuthAlert` is the error box they all use. Their copy is in `utils/auth-content.js`; the checks that run in the form are the server's own (`server/auth/rules.js`). Creating an account does not sign anyone in: it sends them to "Check your inbox", and pressing the button on the emailed link confirms the address, signs in and opens the trip form. The email itself is `server/auth/mail-template.js`. The server side lives in `server/auth/` and `server/api/auth/`; see the root README ("Accounts") for the environment variables and deployment.
