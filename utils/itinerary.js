// What the itinerary page does with the trip form's query and with the model's reply, as plain functions (no Vue, no
// Nuxt) so they can be tested on their own. The page's words are in itinerary-content.js.

/** The day pills run in this fixed order; the map's all-days view paints each day's stops the same colour. */
export const DAY_TONES = ['blue', 'coral', 'peach']
export const toneOfDay = (index) => DAY_TONES[index % DAY_TONES.length]

/** Whole days from the first to the last day of the trip, both counted. Rounded, not ceiled: a clock change in between makes a day 23 or 25 hours long. */
export const daysBetween = (start, end) => Math.round((end - start) / 86400000) + 1

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * A trip date from the route query, as a local midnight on the calendar day it names, or null. The trip form sends
 * Date.toString() ("Sat Oct 10 2026 00:00:00 GMT+0300 (…)"): its first words are the visitor's own calendar day. Reading
 * those, not the instant, keeps the page on the same day when the server renders it in another time zone.
 */
export function calendarDay(value) {
  const text = String([value].flat()[0] ?? '').trim()
  const printed = /^[A-Za-z]{3},? ([A-Za-z]{3}) (\d{1,2}) (\d{4})\b/.exec(text)
  if (printed && MONTHS.includes(printed[1])) return validDate(Number(printed[3]), MONTHS.indexOf(printed[1]), Number(printed[2]))
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(text)
  if (iso) return validDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const parsed = new Date(text)
  return text && !Number.isNaN(parsed.getTime()) ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null
}

/** The date, unless the day is not on that month's calendar (31 Feb rolls over to March). */
function validDate(year, month, day) {
  const date = new Date(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null
}

/**
 * The interests in the route query as a list. The trip form sends them as repeated keys (an array), one value (a string), or
 * nothing; older links may carry a JSON array or a comma-separated string. Anything else is ignored.
 */
export function interestsFrom(value) {
  return [value]
    .flat()
    .filter((entry) => typeof entry === 'string')
    .flatMap((entry) => {
      const text = entry.trim()
      if (text.startsWith('[')) {
        try {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) return parsed.map(String)
        } catch {
          // not JSON after all: fall through and treat it as plain text
        }
      }
      return text.split(',')
    })
    .map((entry) => entry.trim())
    .filter(Boolean)
}

// ───────────────────────── the model's reply ─────────────────────────
//
// The prompt (server/api/GetItinerary.js) asks for days like this, every stop with its name repeated in {} and its
// coordinates, longitude first, in []:
//
//   Day 1: Eastern Kyoto
//   1. Kiyomizu-dera {Kiyomizu-dera} [135.7850, 34.9949] Begin at the temple's wooden stage ...
//   2. ...
//
// A model does not always keep to that, so everything here is tolerant: text before the first "Day N:" is dropped, a line
// with no coordinates is still shown (just not on the map), and a coordinate that cannot be a place on Earth is skipped,
// because the map throws on it.

const DAY_MARK = /^[ \t]*Day[ \t]+\d+[ \t]*[:\-–—][ \t]*(.*)$/gim
const COORDINATE = /\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/
const COORDINATES = new RegExp(COORDINATE.source, 'g')
const NAME = /\{([^}]*)\}/

/** [longitude, latitude] when the pair is a real place (swapping them if they only make sense the other way round), else null. */
export function lngLat(first, second) {
  const a = Number(first)
  const b = Number(second)
  if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return [a, b]
  if (Math.abs(b) <= 180 && Math.abs(a) <= 90) return [b, a]
  return null
}

const tidy = (text) => text.replace(/\s+/g, ' ').trim()
const stripMarker = (text) => text.replace(/^(?:[-•*–]\s+|\d+[.)]\s*)/, '')

function readLine(raw) {
  const coordinate = raw.match(COORDINATE)
  const place = coordinate ? lngLat(coordinate[1], coordinate[2]) : null
  const braced = raw.match(NAME)?.[1]
  const text = tidy(stripMarker(tidy(raw.replace(/\{[^}]*\}/g, ' ').replace(/\[[^\]]*\]/g, ' '))))
  return { place, name: braced ? tidy(braced) : '', text }
}

function readDay(title, body, index) {
  const items = []
  const coordinates = []
  const names = []

  for (const raw of body.split('\n')) {
    if (!raw.trim()) continue
    if ((raw.match(COORDINATES) ?? []).length > 1) continue // coordinates for several stops on one line: not a stop itself, see below
    const { place, name, text } = readLine(raw)
    if (!text && !name) continue

    if (!place && !name && text.endsWith(':') && text.length <= 48) {
      items.push({ kind: 'heading', text: text.slice(0, -1) })
    } else if (!place && !name) {
      items.push({ kind: 'note', text })
    } else {
      const label = name || text.split(/[.:]/)[0].slice(0, 80)
      const rest = text.startsWith(label) ? tidy(text.slice(label.length)) : text
      let number = null
      if (place) {
        coordinates.push(place)
        names.push(label)
        number = coordinates.length
      }
      items.push({ kind: 'stop', number, name: label, text: rest })
    }
  }

  // The reply put its coordinates somewhere other than on the stops' own lines: the map can still use them, in order.
  if (!coordinates.length) {
    const found = [...body.matchAll(COORDINATES)].map((m) => lngLat(m[1], m[2])).filter(Boolean)
    const bracedNames = [...body.matchAll(/\{([^}]*)\}/g)].map((m) => tidy(m[1]))
    found.forEach((place, i) => {
      coordinates.push(place)
      names.push(bracedNames[i] || `Stop ${i + 1}`)
    })
  }

  return { number: index + 1, title: tidy(title), items, coordinates, names }
}

/**
 * The days of a reply: [{ number, title, items, coordinates, names }]. `items` are what the card lists
 * ({ kind: 'stop', number|null, name, text } | { kind: 'note', text } | { kind: 'heading', text }); `coordinates` and `names`
 * are the stops that go on the map, in order, and `number` on a stop is its marker's number. An empty list means the reply
 * was not a plan (an error message, a refusal, an apology).
 */
export function parseItinerary(reply) {
  const text = String(reply ?? '')
  const marks = [...text.matchAll(DAY_MARK)]
  return marks.map((mark, i) => readDay(mark[1], text.slice(mark.index + mark[0].length, marks[i + 1]?.index ?? text.length), i))
}
