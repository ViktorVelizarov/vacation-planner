// Resolves a name to { name, description, imageUrl }.
//   ?destination=Paris                    -> the destination itself (itinerary header)
//   ?destination=Louvre Museum&lat=..&long=.. -> a place near that point (map popup)
import { requireUser } from '../auth/session.js';

const NO_DESCRIPTION = 'No description available';
const NO_IMAGE = 'No image available';

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const hasName = (location, name) => location.names?.some((entry) => normalize(entry.value) === normalize(name));

// Squared planar distance in degrees; only used to rank candidates that are all near each other.
const distanceTo = (location, lat, long) => {
  const point = location.coordinates;
  if (!point) return Infinity;
  const dx = (point.longitude - long) * Math.cos((lat * Math.PI) / 180);
  const dy = point.latitude - lat;
  return dx * dx + dy * dy;
};

const searchLocations = async (params) => {
  const results = await terraFetch('/locations/search', params);
  return results.data.map(({ location }) => location);
};

// Terra orders search results by rating, so the first hit is often not the place we asked for
// ("Eiffel Tower" returns a closed 2019 tour first). Prefer an exact name match, then the closest one.
const closestMatch = (locations, name, lat, long) => {
  const exact = locations.filter((location) => hasName(location, name));
  const candidates = exact.length ? exact : locations;
  return candidates.reduce((best, location) =>
    distanceTo(location, lat, long) < distanceTo(best, lat, long) ? location : best
  );
};

const mostReviewed = (locations) =>
  locations.reduce((best, location) => (reviewCountOf(location) > reviewCountOf(best) ? location : best));

// A missing photo should not fail the whole lookup.
const leadPhotoUrl = async (locationId) => {
  const [photo] = await fetchPhotos(locationId).catch(() => []);
  return photo?.photo.original_size_url ?? NO_IMAGE;
};

async function findPlace(name, lat, long) {
  const locations = await searchLocations({ query: name, size: 10 });
  if (!locations.length) return { error: 'No destinations found' };

  const place = closestMatch(locations, name, lat, long);
  return {
    name: primaryName(place),
    description: descriptionOf(place) || NO_DESCRIPTION,
    imageUrl: await leadPhotoUrl(place.id)
  };
}

async function findDestination(destination) {
  const place = placeNameOf(destination);
  const locations = await searchLocations({ query: place, geo_name: place, category: 'ATTRACTION', size: 5 });
  if (!locations.length) return { error: 'No destinations found' };

  // Terra has no photos for destinations (geos), so the header image comes from the most-reviewed attraction there.
  const landmark = mostReviewed(locations);
  const [geo, imageUrl] = await Promise.all([
    terraFetch(`/geos/${landmark.geo_id}`).catch(() => null),
    leadPhotoUrl(landmark.id)
  ]);

  return {
    name: geo ? primaryName(geo) : landmark.geo,
    description: (geo && descriptionOf(geo)) || NO_DESCRIPTION,
    imageUrl
  };
}

export default defineEventHandler(async (event) => {
  await requireUser(event); // spends TripAdvisor quota: signed-in users only
  const { destination, lat, long } = getQuery(event);

  if (!destination) {
    return { error: 'Missing required query parameter: destination' };
  }

  try {
    const point = lat && long ? [Number(lat), Number(long)] : null;
    return point?.every(Number.isFinite)
      ? await findPlace(destination, ...point)
      : await findDestination(destination);
  } catch (err) {
    console.error('Error fetching data:', err.statusMessage ?? err);
    return { error: 'Error fetching data' };
  }
});
