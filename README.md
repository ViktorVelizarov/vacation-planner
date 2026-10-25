# Vacation Buddy

A web application that plans your vacation. Enter a destination, your dates, what you like and how many people are going, and an OpenAI model drafts a day-by-day itinerary with places to see and places to eat. Every day is also drawn on a Mapbox map with numbered stops and a walking route. Accounts are stored in Upstash Redis and need a confirmed email address.

<img width="1917" height="903" alt="image" src="https://github.com/user-attachments/assets/dc553944-b29a-490c-8d55-a3eb92b0d68c" />

## Features

- Trip form with destination, dates (up to 10 days), interests and number of travelers
- Day-by-day itinerary drafted by OpenAI (`gpt-4o`), with places to see and eat for every day
- Collapsible day cards: the first day opens, "Expand all" opens the rest
- Interactive Mapbox map with numbered stops per day, a walking route between them, and a popup with a photo and description for each stop
- Destination photo and description from the Tripadvisor Terra API
- Accounts with email confirmation (Brevo or Resend), a sealed-cookie session and scrypt-hashed passwords
- 5 free plans per account; a plan already drafted for the same trip is shown again for 24 hours without using one
- Rate limits on sign-in, sign-up and confirmation emails
- Nothing saved on your machine: accounts live in Upstash Redis, in development too
- Ready to deploy on Vercel

Not included yet: password reset and payments (the paid plans on the home page are marked "Coming soon").

## Architecture

A single [Nuxt 3](https://nuxt.com) project (Vue 3 + Nitro) holds both the website and its API.

- `pages/`, `components/`, `layouts/`, `composables/`, `middleware/` — the Vue front end, with file-based routing. Styled with Tailwind CSS and shadcn-vue (radix-vue) components.
- `server/` — the API (Nitro server routes): plans, destination lookup, accounts, and the code behind them (sessions, passwords, the Upstash store, email sending).
- `utils/` — shared page copy, limits, and the parser that turns the model's reply into days and map stops.
- External services: OpenAI (itineraries), Tripadvisor Terra (photos and descriptions), Mapbox (map and walking routes), Upstash Redis (accounts), Brevo or Resend (confirmation emails).

**How a plan is made.** The trip form sends its answers to `/itinerary`. That page calls `GET /api/GetItinerary` (the model drafts the plan) and `GET /api/GetLocationByName` (Tripadvisor photo and description), reads the reply with `utils/itinerary.js`, and shows one card per day and the map.

**Accounts.** The trip form, the itinerary page and every `/api` route except `/api/auth/*` are closed to visitors who are not signed in. Both "Try a demo" and the nav's **Sign in** button lead to `/sign-in`, which also has the **Create account** tab.

An account only works once its email address is confirmed. Creating one emails a link; opening it shows a **Confirm email** button, and pressing that confirms the address, signs the visitor in and opens the trip form. (The button is deliberate: mail programs and security scanners open links to check them, so opening a link never confirms anything by itself.) A link works once and expires after 24 hours. The *Check your inbox* page can send another (one a minute, five an hour per address), and signing in to an account that was never confirmed sends a fresh one. Signing up again with an address that was never confirmed replaces the first sign-up, and sign-ups nobody confirms are deleted after 7 days.

**Free plans.** Every account can have **5 plans** drafted for free (`FREE_TRIPS` in `utils/limits.js`). The count lives in Upstash with the account and is enforced by `/api/GetItinerary`. A failed draft gives its trip back, and a plan already drafted for the same trip in the last 24 hours is shown again without using one. When the 5 are used up, the itinerary page says so and points to the plans on the home page.

## Prerequisites

- Node.js 24 and npm
- An [OpenAI](https://platform.openai.com) API key
- A Tripadvisor Terra API key from the Terra Dashboard (keys for the older Content API do not work)
- A [Mapbox](https://www.mapbox.com) account, for a public `pk.` token
- An [Upstash](https://upstash.com) Redis database (the free plan is enough)
- A [Brevo](https://www.brevo.com) or [Resend](https://resend.com) account for the confirmation emails (Brevo has a free plan; Resend does too)
- To deploy: a [Vercel](https://vercel.com) account

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ViktorVelizarov/vacation-planner.git
   cd vacation-planner
   ```

2. Install dependencies (this also runs `nuxt prepare`):

   ```bash
   npm install
   ```

3. Create your environment file and fill it in. It is git-ignored; [`.env.example`](.env.example) lists every setting, and the [Environment Variables](#environment-variables) table explains them:

   ```bash
   cp .env.example .env
   ```

   (On Windows PowerShell: `Copy-Item .env.example .env`.)

4. Set up the services:
   - **Upstash Redis.** Create a database at upstash.com and copy its REST URL and token into `KV_REST_API_URL` and `KV_REST_API_TOKEN`. One database can serve your machine, Vercel previews and production: each keeps its own accounts (the keys start with `vp:development`, `vp:preview` or `vp:production`).
   - **An email service**, one of:
     - **Brevo.** Under *Senders, Domains & Dedicated IPs* add the address you will send from and verify it (a domain you own delivers better than a free mailbox such as gmail.com, which can land in spam), then create an API key under *SMTP & API*. Set `BREVO_API_KEY`, and `AUTH_EMAIL_FROM` to that verified sender.
     - **Resend.** It only sends to other people from a domain you have added and verified (its test sender reaches only your own address). Create an API key, then set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` (an address on that domain).
   - **Mapbox.** Create a public token (it starts with `pk.`) and set `NUXT_PUBLIC_MAPBOX_TOKEN`. It is sent to the browser, so restrict it to your site's addresses in the Mapbox dashboard. Without it the map card says it could not load, and the days still work.
   - **Session secret.** Set `NUXT_SESSION_PASSWORD` to a long random string: `openssl rand -base64 32`.

Nothing about accounts is ever saved on your machine, so the account settings are required locally as well as on Vercel. When one is missing, sign-up answers "Accounts are not available right now" and the server log names the setting.

## Development

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000. Restart the server after editing `.env`.

- `OPENAI_API_KEY` has to be set even to start the dev server, because the plan route creates its OpenAI client when the server starts.
- Every plan you draft while developing calls OpenAI with your key and counts against your account's 5 free plans. To lift the limit for yourself, list your address in `UNLIMITED_TRIP_EMAILS`.
- On your machine the confirmation link points at the `localhost` address you opened the page on.

## Deployment

The app deploys to Vercel with no extra configuration: Vercel detects Nuxt and builds it with `nuxt build`. The Vercel settings live in `nuxt.config.js`: the whole app is one function that runs on Node 24 for at most 120 seconds. Drafting a plan takes about 25 seconds for 10 days, and it gives up after 100 seconds and gives the trip back.

1. **Import the project.** In Vercel choose *Add New → Project* and import this repository. Leave the build, install and output settings at their defaults.
2. **Create the database.** In the project open *Storage*, create an **Upstash → Redis** database and connect it to the project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`; check the names under *Settings → Environment Variables*. Pick a region near your function region (*Settings → Functions*), because each sign-in makes several Redis round trips.
3. **Add the other variables** from the table below under *Settings → Environment Variables*. Use a different `NUXT_SESSION_PASSWORD` for Production and Preview. Variables only apply to new deployments, so redeploy after adding them. If you deploy first, the site loads but sign-up says "Accounts are not available right now", and the Vercel logs name what is missing.
4. **Verify your email sender** (the `AUTH_EMAIL_FROM` address in Brevo, or the domain in Resend), and add your `https://<project>.vercel.app` address (and your own domain, if you add one) to the Mapbox token's URL restrictions.
5. **Test on the production URL:** sign up, open the emailed link, confirm, and plan a trip. Preview deployments are behind Vercel's login by default, so a confirmation link sent from a preview only opens for you while you are signed in to Vercel.

**Where the emailed link points.** It is never taken from the request's `Host` header, because anyone can post a sign-up with a made-up one. On Vercel it is the project's production domain (production) or the deployment's own address (previews), which needs Vercel's system environment variables to be exposed (the default). On your machine it is the address you opened the page on, and only `localhost` or `127.0.0.1` count. Anywhere else, or to force a custom domain, set `AUTH_BASE_URL`; without it the sign-up fails and the server log names the setting.

**Other hosts.** Build with `npm run build` and run `node .output/server/index.mjs` on Node 24 with the same environment variables. Put it behind HTTPS with a proxy that sends `X-Forwarded-Proto`, and set `AUTH_BASE_URL` to the public address.

Vercel's Hobby plan is for non-commercial use, so once you start charging for plans you would move to Pro.

## Environment Variables

Set them in `.env` locally and under *Settings → Environment Variables* on Vercel. [`.env.example`](.env.example) is the template.

| Variable | Needed | What it is |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | OpenAI key that drafts the itineraries. |
| `TRIPADVISOR_API_KEY` | recommended | Tripadvisor Terra key, for the destination photo and the stop popups. Without it the plan still works. |
| `NUXT_PUBLIC_MAPBOX_TOKEN` | recommended | Public Mapbox token (`pk.`) for the map. Without it the map says it could not load. |
| `NUXT_SESSION_PASSWORD` | yes | 32 or more random characters that seal the sign-in cookie (`openssl rand -base64 32`). Changing it signs everyone out. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | yes | The Upstash Redis database (REST address and token). `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` work too. |
| `BREVO_API_KEY` or `RESEND_API_KEY` | one of them | The email service's API key. If both are set, Brevo is used. |
| `AUTH_EMAIL_FROM` | yes | Who the confirmation emails come from, a sender the email service has verified: `Vacation Buddy <hello@your-domain.com>` or just the address. |
| `AUTH_BASE_URL` | no | The site's public address for the link in the email (`https://planner.example.com`). Only needed when it cannot be worked out, see [Deployment](#deployment). |
| `UNLIMITED_TRIP_EMAILS` | no | Comma-separated addresses of accounts with no free-trip limit, for your own testing. It is read on the server and nobody else can switch it on. |
| `OPENAI_BASE_URL` | no | Send the plan requests through a proxy or a stand-in service instead of OpenAI. Leave empty normally. |

## Project Structure

```
vacation-planner/
├── pages/               # routes: home, sign-in, sign-up, check-email, verify-email, vacationForm, Itinerary
├── components/          # landing/, auth/ and trip/ components, and the shadcn-vue ui/ set
├── layouts/             # landing and default layouts
├── composables/         # useAuth: who is signed in
├── middleware/          # route guard: sends visitors without an account to /sign-in
├── server/
│   ├── api/             # GetItinerary, GetLocationByName, demos, and auth/*
│   ├── auth/            # sessions, passwords, the Upstash store, email sending, limits
│   ├── middleware/      # sign-in check for every /api route except /api/auth/*
│   └── utils/           # Tripadvisor Terra client
├── utils/               # page copy, limits (FREE_TRIPS, MAX_TRIP_DAYS) and the reply parser
├── lib/                 # shadcn-vue class helper
├── assets/              # global CSS and landing images
├── public/              # fonts and favicon
├── documentation/       # PDFs on how the app was built, start to finish
├── nuxt.config.js       # modules, runtime config and the Vercel function settings
├── .env.example         # every setting the app reads
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project does not have a license yet. Add a `LICENSE` file (for example MIT) and update this section.
