// Client helpers for the Tripadvisor Terra API.
// Terra replaced the legacy Content API (api.content.tripadvisor.com), which was
// sunset on 2026-08-31. Legacy keys do not work here; use a key from the Terra Dashboard.
// Docs: https://docs.terra.tripadvisor.com/docs/overview
const TERRA_BASE_URL = 'https://terra.tripadvisor.com/api';
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET {TERRA_BASE_URL}{path}?version=1&...query, authenticated with the X-API-Key header.
// Search endpoints are limited to 1 request/second (burst of 5), so 429s are retried with backoff.
export async function terraFetch(path, query = {}) {
  const apiKey = process.env.TRIPADVISOR_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'TRIPADVISOR_API_KEY is not set' });
  }

  const url = new URL(`${TERRA_BASE_URL}${path}`);
  url.searchParams.set('version', '1');
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, value);
    }
  }

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      headers: { accept: 'application/json', 'X-API-Key': apiKey }
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      await sleep(1000 * 2 ** attempt + Math.random() * 250);
      continue;
    }

    if (!response.ok) {
      // Errors are RFC 7807 problem documents; 401/403 put the reason in `detail`/`message`.
      const problem = await response.json().catch(() => ({}));
      const reason = problem.message || problem.detail || problem.title || 'Request failed';
      throw createError({
        statusCode: response.status,
        statusMessage: `Tripadvisor Terra API: ${reason}`
      });
    }

    return response.json();
  }
}

// Photos for a location with a usable URL, best lead image first.
// Management photos beat traveler photos; sort is stable so recency order is kept within each group.
export async function fetchPhotos(locationId) {
  const photos = await terraFetch(`/locations/${encodeURIComponent(locationId)}/photos`, { size: 10 });
  const isManagement = (photo) => (photo.source?.name === 'Management' ? 1 : 0);
  return photos.data
    .filter((photo) => photo.photo?.original_size_url)
    .sort((a, b) => isManagement(b) - isManagement(a));
}

// Terra returns localized text as [{ language, value, primary? }]; prefer English, else the first entry.
const pickText = (entries) => (entries?.find((entry) => entry.language === 'en') ?? entries?.[0])?.value ?? '';

export const primaryName = (location) =>
  (location.names?.find((name) => name.primary) ?? location.names?.[0])?.value ?? '';

export const descriptionOf = (location) => pickText(location.descriptions);

export const reviewCountOf = (location) => location.traveler_ratings?.overall?.count ?? 0;

// "Paris, France" -> "Paris": Terra matches names and geo names literally.
export const placeNameOf = (destination) => String(destination).split(',')[0].trim();
