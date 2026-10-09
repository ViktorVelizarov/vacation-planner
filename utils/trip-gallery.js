// The photographs beside the trip form (/vacationForm), with their places. Decorative: the captions carry the information.
// Kyoto, Lisbon and Reykjavik are generated pictures; the others are Unsplash photographs (their sources are in the .webp.json files).

import kyoto from '~/assets/images/landing/kyoto.webp'
import lisbon from '~/assets/images/landing/lisbon.webp'
import reykjavik from '~/assets/images/landing/reykjavik.webp'
import santorini from '~/assets/images/landing/santorini.webp'
import venice from '~/assets/images/landing/venice.webp'
import amsterdam from '~/assets/images/landing/amsterdam.webp'

export const tripGallery = [
  { place: 'Kyoto', coords: '35.01° N 135.77° E', src: kyoto, width: 1200, height: 1200 },
  { place: 'Lisbon', coords: '38.72° N 9.14° W', src: lisbon, width: 1200, height: 1200 },
  { place: 'Reykjavík', coords: '64.15° N 21.94° W', src: reykjavik, width: 1200, height: 1200 },
  { place: 'Santorini', coords: '36.46° N 25.38° E', src: santorini, width: 900, height: 1200 },
  { place: 'Venice', coords: '45.44° N 12.33° E', src: venice, width: 640, height: 900 },
  { place: 'Amsterdam', coords: '52.37° N 4.90° E', src: amsterdam, width: 900, height: 1200 },
]
