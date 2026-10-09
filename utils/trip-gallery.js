// The photographs beside the trip form (/vacationForm), with their places. Decorative: the place names on the tiles carry the information.
// Kyoto, Lisbon and Reykjavik are generated pictures; the others are Unsplash photographs (their sources are in the .webp.json files).
// TripGalleryMosaic lays out the first six in this order, so a new picture goes at the end.

import kyoto from '~/assets/images/landing/kyoto.webp'
import lisbon from '~/assets/images/landing/lisbon.webp'
import reykjavik from '~/assets/images/landing/reykjavik.webp'
import santorini from '~/assets/images/landing/santorini.webp'
import venice from '~/assets/images/landing/venice.webp'
import amsterdam from '~/assets/images/landing/amsterdam.webp'

export const tripGallery = [
  { place: 'Kyoto', src: kyoto, width: 1200, height: 1200 },
  { place: 'Lisbon', src: lisbon, width: 1200, height: 1200 },
  { place: 'Reykjavík', src: reykjavik, width: 1200, height: 1200 },
  { place: 'Santorini', src: santorini, width: 900, height: 1200 },
  { place: 'Venice', src: venice, width: 640, height: 900 },
  { place: 'Amsterdam', src: amsterdam, width: 900, height: 1200 },
]
