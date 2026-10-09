import OpenAI from "openai";
import { createError, getQuery } from "h3";
import { FREE_TRIPS, PLAN_KEPT_SECONDS, hasNoLimit, tripKey } from "../auth/demos.js";
import { defineAuthHandler } from "../auth/guard.js";
import { requireUser } from "../auth/session.js";
import { getAuthStore } from "../auth/store.js";
import { MAX_TRIP_DAYS } from "~~/utils/limits.js";

// OPENAI_BASE_URL is optional: point the client at a proxy or a stand-in service (the tests do). Unset, it talks to OpenAI.
// The option is left out when unset: the SDK spreads its options over its defaults, so `baseURL: undefined` would erase the default address.
const openai = new OpenAI(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {});

const COORDINATE_RULES = ' . Also at the end of each day can you provide the coordinates [longitude FIRST, then latitude] for each destination, example: Big Ben [-0.1246, 51.5007]. Put the coordinates in [] and separate them by ,. Also each time you mention a name of a destination with coordinates please repeat that name and put it in {} brackets after the original name so it looks like this - Eiffel Tower {Eiffel Tower}. If there are 7 coordinates for the given day I need 7 names of destinations. This is an example of how a single destination from a day should look like: 1. Rijksmuseum {Rijksmuseum} [4.8852, 52.3590] Start your day by visiting the Rijksmuseum. This expansive museum is home to thousands of art pieces, including works by Rembrandt and Vermeer. Please DONT give a separate Coordinates section after each Day';

const first = (value) => (Array.isArray(value) ? value[0] : value);

// GET /api/GetItinerary?days=4&destination=Kyoto&selectedPreferences=Museums,Historical
//   -> the model's plan as text (see utils/itinerary.js for how the page reads it).
//   402  the account has used its free trips   400  the request is not a trip   502  no plan could be drafted
// Spends OpenAI credits, so it is for signed-in users only, and a free account gets FREE_TRIPS of them (server/auth/demos.js).
export default defineAuthHandler(async (event) => {
  const user = await requireUser(event);

  const query = getQuery(event);
  const destination = String(first(query.destination) ?? "").trim();
  const days = Number(first(query.days));
  const interests = String(first(query.selectedPreferences) ?? "").split(",").map((entry) => entry.trim()).filter(Boolean).slice(0, 12);
  if (!destination || destination.length > 120 || !Number.isInteger(days) || days < 1 || days > MAX_TRIP_DAYS) {
    throw createError({ statusCode: 400, statusMessage: `Choose a destination and 1 to ${MAX_TRIP_DAYS} days.` });
  }

  const store = getAuthStore();
  const key = tripKey({ destination, days, interests });

  // The plan already drafted for this very trip: show it again, free.
  const kept = await store.planGet(user.id, key);
  if (kept) return kept;

  // an account without a limit (UNLIMITED_TRIP_EMAILS) does not use the allowance at all
  const counted = !hasNoLimit(user);
  if (counted && !(await store.demoReserve(user.id, FREE_TRIPS))) {
    throw createError({ statusCode: 402, statusMessage: `You have used your ${FREE_TRIPS} free trips.`, data: { code: "free-trips-used" } });
  }

  let drafted = false;
  try {
    const promptText =
      `Make me a ${days} day long vacation itinerary in ${destination} with the names of destinations and places to eat for each day and with these preferences in mind: ` +
      (interests.length ? interests.join(", ") : "No specific preferences") +
      COORDINATE_RULES;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      temperature: 0.2,
      messages: [{ role: "user", content: promptText }],
    });

    // Remove all "#" and "*" signs from the result
    const plan = (completion.choices[0].message.content ?? "").trim().replace(/[#*]/g, "");
    // A reply that is not a plan (a refusal, an empty answer) is a failure, not a trip.
    if (!/^\s*Day\s+\d+/im.test(plan)) throw new Error("the model's reply was not a plan");

    drafted = true;
    await store.planPut(user.id, key, plan, PLAN_KEPT_SECONDS).catch((error) => console.error("Could not keep the plan:", error.message));
    return plan;
  } catch (error) {
    console.error("Error:", error.message);
    throw createError({ statusCode: 502, statusMessage: "We couldn't draft your plan. Try again." });
  } finally {
    if (counted && !drafted) await store.demoRefund(user.id).catch((error) => console.error("Could not give the trip back:", error.message));
  }
});
