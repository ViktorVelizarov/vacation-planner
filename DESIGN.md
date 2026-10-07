---
name: Vacation Planner (Blue Arch Booking)
description: A friendly travel-booking page in royal blue on white, with arch-masked photos and a search card straddling the hero edge.
colors:
  royal-blue: "#3558e6"
  royal-blue-deep: "#2742b8"
  blue-wash: "#e9eeff"
  coral: "#ee7d5b"
  peach: "#fbd6c2"
  navy-ink: "#0f1a36"
  slate-ink: "#47526f"
  muted-ink: "#5e6987"
  hairline: "#e1e6f1"
  pale-grey: "#f3f5f9"
  white: "#ffffff"
  standin-navy: "#1f2d52"
  standin-blue: "#3d57c4"
  standin-mist: "#c9d4f5"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 6.6vw, 6.3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.9rem)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.5vw, 1.3rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Spline Sans Mono', ui-monospace, 'Cascadia Mono', monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.11em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "999px"
spacing:
  pad: "clamp(20px, 4vw, 56px)"
  wrap: "1160px"
  tile-gap: "12px"
  card-gap: "clamp(16px, 2.4vw, 30px)"
  section-top: "clamp(72px, 9vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.royal-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "1.15em 1.9em"
  button-primary-hover:
    backgroundColor: "{colors.royal-blue-deep}"
  button-on-photo:
    backgroundColor: "{colors.white}"
    textColor: "{colors.royal-blue-deep}"
    rounded: "{rounded.md}"
    padding: ".8em 1.15em"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.md}"
    padding: ".95em 1.6em"
  button-tint:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.royal-blue-deep}"
    rounded: "{rounded.md}"
    padding: ".8em 1.15em"
  button-tint-hover:
    backgroundColor: "{colors.royal-blue}"
    textColor: "{colors.white}"
  pill-blue:
    backgroundColor: "{colors.royal-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    height: "26px"
  pill-coral:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.full}"
    height: "26px"
  pill-peach:
    backgroundColor: "{colors.peach}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.full}"
    height: "26px"
  tab:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.lg}"
    padding: "13px 20px 12px"
  tab-selected:
    backgroundColor: "{colors.royal-blue}"
    textColor: "{colors.white}"
  search-card:
    backgroundColor: "{colors.white}"
    rounded: "14px"
  destination-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "10px 10px 16px"
  rating-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.full}"
    padding: "5px 10px 5px 8px"
  stat-tile:
    backgroundColor: "{colors.pale-grey}"
    textColor: "{colors.royal-blue}"
    rounded: "{rounded.md}"
    padding: "18px 16px 16px"
  quote-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "clamp(24px, 3vw, 36px)"
  closing-block:
    backgroundColor: "{colors.pale-grey}"
    rounded: "{rounded.xl}"
    padding: "clamp(40px, 6vw, 84px) 4vw"
---

# Design System: Vacation Planner (Blue Arch Booking)

## Overview

**Creative North Star: "The Booking Arcade"**

A travel-booking counter rebuilt as friendly SaaS: white ground, navy ink, and one royal blue that means "act here". Photographs keep their natural colour but are not shown raw. Every slot gets the same halftone dot screen and grain, so any future picture reads as part of one printed set, and arch-shaped masks with thick white borders give the page its single recognisable silhouette. A search-style card straddles the bottom edge of the hero and carries the call to action, the way a booking site's finder does.

Density is moderate and airy: wide section gaps, generous card padding, a 1160px measure. Warmth comes only from a coral and peach pair, used for numbered pills, pin and star glyphs, and one tinted arch. The mood is confident, bright and approachable rather than luxurious.

The stat tiles, the rating chip and the trip-length figure are the "data" voice: bold blue numerals on pale grey or white, with small mono labels. Everything on the page that looks like data (ratings, trip lengths, quotes, the request in the card) is a labelled sample, never a claim.

**Key Characteristics:**
- Royal blue is the only action colour; coral and peach are warm tints, never actions.
- Arch (round-topped, 8px white border) is the signature shape; every other corner is 6 to 16px.
- Every photo slot gets the halftone + grain recipe and keeps its natural colour; never tint a photo.
- Bricolage Grotesque 800 for display, Spline Sans Mono 11px for small labels.
- Depth by white-on-white borders and a few soft navy shadows; no hard offsets.
- Sample data is always labelled as sample.

## Colors

A cool, near-monochrome blue-and-white palette with a single warm pair, so blue always reads as the way forward.

### Primary
- **Royal Blue** (#3558e6): the one action colour. Primary buttons, selected tab, pager "next", pill 01, stat numerals, blockquote glyphs, focus rings, text selection, caret and scrollbar thumb.
- **Deep Royal Blue** (#2742b8): hover for blue buttons, text on white and wash buttons, trip-length figures.
- **Blue Wash** (#e9eeff): tinted button fill, unselected tab, icon tiles, avatar discs.

### Secondary
- **Coral** (#ee7d5b): pill 02, pin and star glyphs. Only on small shapes; with navy text when used as a fill.
- **Peach** (#fbd6c2): pill 03, the small arch's fill, third thumbnail stand-in.

### Neutral
- **Navy Ink** (#0f1a36): headings, strong text, skip link.
- **Slate Ink** (#47526f): paragraph copy on white and grey.
- **Muted Ink** (#5e6987): captions, field labels, footer.
- **Hairline** (#e1e6f1): card borders, dividers, field separators.
- **Pale Grey** (#f3f5f9): stat tiles and the closing block.
- **Paper White** (#ffffff): page ground, cards, chips, arch borders.
- **Stand-in Navy / Blue / Mist** (#1f2d52, #3d57c4, #c9d4f5): flat fills behind photo slots before images load.

### Named Rules
**The One Action Rule.** Royal blue is the only colour that acts. Coral and peach decorate (pills, glyphs, one arch); they never fill a button.

**The Cool Ground Rule.** Large surfaces are white or pale grey. Blue and warm colours stay on small, purposeful shapes, except the hero photo, which is itself blue by processing.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif), self-hosted from `public/fonts` (declared in `assets/css/landing.css`); optical sizing is on (`font-optical-sizing: auto`).
**Body Font:** Bricolage Grotesque, same family at 400 to 600.
**Label/Mono Font:** Spline Sans Mono (with ui-monospace, Cascadia Mono).

**Character:** A chunky, slightly quirky grotesque at 800 with tight tracking gives headlines a friendly shout; the mono labels add a booking-ticket precision.

### Hierarchy
- **Display** (800, clamp(2.7rem, 6.6vw, 6.3rem), 1.0, -0.022em): the hero h1 only, centred, balanced wrap, white over the photo.
- **Headline** (800, clamp(2.1rem, 4.4vw, 3.9rem), 1.03, -0.025em): section h2s.
- **Title** (700, clamp(1.15rem, 1.5vw, 1.3rem), 1.25): step and destination names.
- **Body** (400, 16px, 1.65): copy in slate ink, held to 34 to 46ch.
- **Numeric** (800, clamp(2rem, 3vw, 2.7rem), tabular figures, -0.04em): stat tiles; trip length uses 800 at 1.3 to 1.55rem.
- **Label** (Spline Sans Mono 500, 11px, 0.11em tracking, uppercase): field keys, sample tags, tile captions, sample-request header, figure captions. Pills use mono 600 at 12px.
- **Quote** (600, clamp(1.15rem, 1.6vw, 1.4rem), 1.4): quote card text.

### Named Rules
**The Mono Is Data Rule.** Spline Sans Mono is for small data-like text (field keys, coordinates, sample tags, pill numerals), always at 11 to 12px. Never set sentences in it.

**The Heavy-or-Plain Rule.** Display and numerals are 800; running text is 400 to 600. No middle weights for headlines.

## Layout

A 1160px centred wrap with a fluid side pad (20px to 56px). Sections open with a large top gap (72px to 128px) and end without bottom padding; the closing block adds its own. Two-column splits (how it works, limits) use a 1.05:1 grid with a 32px to 96px gap and centre-align copy against arches. Destinations are a 3-up grid with a 16px to 30px gap. Section heads put the h2 left and one action (ghost button or pager) right, aligned to the baseline.

The search card straddles the hero edge: it sits 118px up into the photo (negative top margin), the hero keeps 190px of bottom padding so nothing important sits beneath it, and the tabs sit on the card's top edge.

Responsive:
- Under 1180px the four search fields reflow to a 2x2 grid and the button stretches full width beneath.
- Under 980px: nav links hide, two-column splits stack, destinations become one 460px column with 4:3 images, the days list stacks, quote cards go one per view.
- Under 560px: field icons are hidden, stat tiles become horizontal rows, section heads stack, hero h1 drops to clamp(2rem, 9.6vw, 3rem).

### Named Rules
**The Safe-Zone Rule.** Hero photography is 16:9 (2400x1350); the lone figure's box lives at x 56 to 68%, y 60 to 78% (head no higher than 58%). The bottom ~22% is covered by the card and tabs, so nothing important sits below 78%.

## Elevation & Depth

Mostly flat with white borders and hairlines. Soft, wide, navy-tinted shadows appear only on objects that float over something else: the search card, arches, and the thumbnail strip. Cards at rest rely on a 1px hairline instead.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 34px 70px -28px rgba(15,26,54,.45), 0 10px 22px -12px rgba(15,26,54,.22)`): the search card.
- **Arch** (`box-shadow: 0 30px 50px -26px rgba(15,26,54,.5), 0 8px 16px -8px rgba(15,26,54,.25)`): arch photos.
- **Tray** (`box-shadow: 0 24px 40px -20px rgba(15,26,54,.4), 0 6px 14px -8px rgba(15,26,54,.2)`): thumbnail strip.
- **Lift** (translateY(-4px) with border to #c9d4f5): destination card hover.

### Named Rules
**The Float-Only Rule.** A shadow means "this sits over something". Cards on a plain ground take a hairline, not a shadow.

## Shapes

Radius discipline: 8px for buttons, inputs, pager buttons, icon tiles and stat tiles; 12px for cards and tab tops; 14px (4px on the tab-side top-left corner) for the search card; 16px for the closing block; 6px for photo slots nested inside cards. Fully round shapes are limited to pills, the rating chip and avatars (999px or 50%) and the arch (999px 999px 0 0 with an 8px white border). The brand mark is a small arch too.

Photo slots carry a processing recipe (see Components). Hero 16:9, destination slots 9:10 (4:3 under 980px), big arches 3:4, small arch 32:45, wide arch 3:4, thumbnails 1:1.

### Named Rules
**The Arch Is Special Rule.** The arch is the only large fully-rounded shape. Do not round any other photo or card beyond 16px.

## Components

### Buttons
- **Shape:** gently curved (8px), 15px 600 text, optional 18px arrow that nudges 3px on hover.
- **Primary (blue):** royal blue fill, white text, large size (1.15em x 1.9em) in the search card and closing block.
- **On photo (white):** white fill, deep blue text, small size, used in the nav over the hero.
- **Ghost:** white, hairline border, navy text; border and text turn blue on hover.
- **Tint:** wash fill, deep blue text; fills royal blue with white text on hover. Used inside destination cards.
- **Focus:** 3px royal blue outline with 3px offset; white inside the hero.

### Nav
White text over the darkened hero, no bar. Arch-mark brand at left, four 15px links centred-right with an underline on hover, white "Try a demo" button. Links hide under 980px; the button stays. Footer repeats the brand in ink with a blue mark.

### Search card and tabs
A real tablist ("Plan a trip", "See a sample") with roving tabindex, ArrowLeft/ArrowRight wrapping and focus follow, and one tabpanel per tab (hidden attribute on the inactive one). Tabs have 12px top corners; the selected tab is royal blue, others wash. Each pane opens with a mono header reading "Sample request" or "Sample itinerary" plus a trip number, then either four labelled fields (destination, dates, interests, travelers, each with a wash icon tile) or three day pills with a stop count. It is deliberately not a form: the fields are static read-only text, because the real input lives on the app's trip form, and the only action is a link to that form. Do not turn the fields into inputs on this page.

### Number and day pills
26px-tall capsule, mono 600 12px, three tones in a fixed order: blue (01 / Day 1), coral (02 / Day 2), peach (03 / Day 3). Coral and peach carry navy text.

### Rating chip
White capsule pinned 10px from the top-right of a destination photo: coral star, bold 13px score, then a mono "Sample" tag in muted ink.

### Destination card
White, hairline border, 12px radius, 10px inner padding around a 9:10 processed photo (6px radius). Body: title, pin glyph plus country with mono coordinates at the right, then a hairline-topped footer. The price slot shows trip length (bold blue "3 days" with "for 2 travelers" in grey), not money, beside a tint button. Hover lifts 4px.

### Stat tiles
Pale grey, hairline border, 8px radius, three across: a heavy blue tabular numeral over an 11px mono caption. Stack as rows under 560px.

### Quote cards and pager
White 12px cards with a hairline in a horizontal scroll-snap track (two visible, one under 980px, scrollbar hidden, focusable with tabindex 0). A 6rem blue open-quote glyph sits top-left behind 600-weight quote text; the footer shows a wash avatar disc with initials, name, and a mono "City · Sample" tag. The pager is two 46px 8px-radius buttons (previous white, next blue) that scroll the track by one card plus gap.

### Photo slot (processing recipe)
Every photo keeps its natural colour (no duotone, no tint) and passes through: (1) a 4px radial-dot halftone overlay at 45 to 55% opacity, multiply blend; (2) fractal-noise grain at 50% opacity, overlay blend. A flat stand-in colour from the blue family sits behind each slot until an image loads. The hero adds a navy top-to-bottom scrim for white text. Swap images in; never restyle the recipe per image.

### Image-slot contract
- Hero: 2400x1350, 16:9, figure box at x 56 to 68%, y 60 to 78%. Shipped: `assets/images/landing/paris.webp` (Seine quay at blue hour, 1280x724 today; replace with a 2K+ file). The figure sits at x ~65%, head ~58%, legs behind the quay wall, so the search card covers wall, not subject.
- Arches: 900x1200 (3:4) and 640x900 (32:45).
- Destinations: 900x1000 (9:10) on desktop, 4:3 under 980px, `object-fit: cover`. Shipped: `assets/images/landing/lisbon.webp`, `kyoto.webp`, `reykjavik.webp` (1:1, 1200x1200, subject kept in the central 70% of the height so both crops hold; top-right stays calm for the rating chip).
- Thumbnails: 240x240 squares with a mono day caption.

### Closing block
Pale grey 16px-radius panel, centred, h2 held to 16ch, one large blue button.

### Motion
One easing, `cubic-bezier(.16, 1, .3, 1)`, at 0.25 to 0.4s on colour, border, transform and arrow nudges. Smooth scrolling for anchors and the quote track. Under `prefers-reduced-motion: reduce`, smooth scroll is off and all animation and transitions are disabled.

### Named Rules
**The Sample Label Rule.** Any figure that is illustrative (ratings, trip lengths, quotes, the request in the card, the trip number) carries the word "Sample" in the component or in a nearby label, and the footer repeats it. New data-like content gets the same label.

**The Real Tablist Rule.** Tabs are buttons with role, aria-selected, aria-controls, roving tabindex and arrow-key support; panels are toggled with the hidden attribute.

## Do's and Don'ts

### Do:
- **Do** keep royal blue (#3558e6) for the one action per region and its hover (#2742b8).
- **Do** use 8px on buttons and inputs, 12px on cards, and let arches and pills be the only fully round shapes.
- **Do** run every new photograph through the halftone and grain recipe, never a colour tint, and respect the hero safe zone.
- **Do** order pills blue, coral, peach for sequences of three.
- **Do** put trip length, not a price, in the destination card's figure slot.
- **Do** label sample data as "Sample" wherever it appears.
- **Do** honour reduced motion by disabling transitions and smooth scrolling.

### Don't:
- **Don't** make coral or peach an action colour or fill a button with it.
- **Don't** add hard offset shadows; shadows are soft, wide and navy-tinted, and only on floating objects.
- **Don't** round cards beyond 16px or crop photos into other fully round shapes.
- **Don't** convert the search card's fields into live inputs; it is a read-only sample, and the form lives in the app.
- **Don't** show unprocessed full-colour photos.
- **Don't** set sentences in Spline Sans Mono, or go below 11px for any text.

### Not canonized
Carried by the build but not promoted to rules: the tracked-caps blue mono eyebrow above each h2 (0.26em), which this direction asks for by name and which must stay short and carry information (it is not a license for empty labels); a hard-coded burnt-orange (#b8431f) on the sample-request header that is not a token; duplicated rules in the 1180px and 980px media blocks; and the arch and day-thumbnail slots, which still show flat stand-ins, so the recipe has only been seen on the hero and destination photos.
