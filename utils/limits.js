// The numbers the pages and the server must agree on, kept in a file with no imports so server code can load it too
// (utils/trip-content.js imports a photograph, which the server bundle cannot).

/** The longest trip the planner takes (the form has always said "max 10 days"; the date field holds to it, and so does the server). */
export const MAX_TRIP_DAYS = 10

/** Trips (generated plans) a free account can make. Enforced on the server (server/auth/demos.js); the pricing section and the trip form say the same number. */
export const FREE_TRIPS = 5
