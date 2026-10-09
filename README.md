# Vacation Planner

![image](https://github.com/user-attachments/assets/4d2b2886-4137-4c9c-b7a7-322688c30e8f)


## Introduction
This is a web app I developed myself that allows users to generate custom vacation itineraries/plans by choosing their destination, dates, preferences, and number of people. The app uses an OpenAI model to generate a detailed plan for each day of the requested vacation. I have also added a visible map of the generated vacation routes for each day with the help of the MapBoxGL Library.


* Used Technologies
    * VueJS -> frontend framework
    * NodeJS -> backend framework
    * OpenAI API -> AI text generation
    * MapBoxGL -> generation of custom maps
    * TailwindCSS + ShadCN -> styling
    * Upstash Redis -> accounts, email confirmation links and sign-in limits (locally too: nothing is saved on your machine)
    * Brevo or Resend -> the confirmation emails


## Documentation
I explained my entire process of creating this web app from start to finish in a couple of PDF documents which you can find in the /documentation folder of this repo.


## Accounts
The demo needs an account: the trip form, the itinerary page and every `/api` route except `/api/auth/*` are closed to visitors who are not signed in. "Try a demo" and the nav's **Sign in** button both lead to `/sign-in`, which also has the **Create account** tab.

An account only works once its email address is confirmed. Creating one emails a link; opening it shows a **Confirm email** button, and pressing that confirms the address, signs the visitor in and opens the trip form. (The button is deliberate: mail programs and security scanners open links to check them, so opening a link never confirms anything by itself.) A link works once and expires after 24 hours. The *Check your inbox* page can send another (one a minute, five an hour per address), and signing in to an account that was never confirmed sends a fresh one. Signing up again with an address that was never confirmed replaces the first sign-up, and sign-ups nobody confirms are deleted after 7 days.

**Free trips.** Every account can have **5 plans** drafted for free (`FREE_TRIPS` in `utils/limits.js`). The count lives in Upstash with the account and is enforced by `/api/GetItinerary` (a failed draft gives its trip back, and a plan already drafted for the same trip in the last 24 hours is shown again without using one). When they are used up the itinerary page says so and points to the plans on the home page; the monthly and yearly plans there are marked "Coming soon", because there is no payment yet. To plan without limit while you test, list your own address in `UNLIMITED_TRIP_EMAILS` (`.env` and Vercel); it is read on the server and nobody else can switch it on.

**Nothing is saved on your machine, not even while developing.** Accounts, confirmation links and sign-in limits live in an **Upstash Redis** database, and the confirmation emails go out through **Brevo** or **Resend**. All of it is set through environment variables: the same names locally (in `.env`, copied from [`.env.example`](.env.example)) and on Vercel (**Settings > Environment Variables**). There is no fallback: when a required one is missing, sign-up and sign-in answer "Accounts are not available right now". The server log names the setting, and on your own machine the page shows it under the message too.

| Variable | Required | What it is |
| --- | --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | yes | The Upstash Redis database (REST address and token). `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` work too. |
| `NUXT_SESSION_PASSWORD` | yes | 32 or more random characters that seal the sign-in cookie (`openssl rand -base64 32`). Changing it signs everyone out. |
| `BREVO_API_KEY` or `RESEND_API_KEY` | one of them | The email service's API key. If both are set, Brevo is used. |
| `AUTH_EMAIL_FROM` | yes | Who the confirmation emails come from, a sender the email service has verified: `Vacation Planner <hello@your-domain.com>` or just the address. |
| `AUTH_BASE_URL` | no | The site's public address for the link in the email (`https://planner.example.com`). Only needed when it cannot be worked out, see below. |

### Setting it up
1. **Upstash Redis.** In the Vercel project open **Storage**, create an **Upstash Redis** database and connect it to the project; Vercel adds the two `KV_` variables. For local work copy the same two values into `.env` (or create a free database at upstash.com and copy its REST URL and token). One database can serve your machine, previews and production: each keeps its own accounts (the keys start with `vp:development`, `vp:preview` or `vp:production`).
2. **An email service**, one of:
   * **Brevo** has a free plan. Under *Senders, Domains & Dedicated IPs* add the address you will send from and verify it (a domain you own delivers better than a free mailbox such as gmail.com, which can land in spam), then create an API key under *SMTP & API*. Set `BREVO_API_KEY`, and `AUTH_EMAIL_FROM` to that verified sender.
   * **Resend** has a free plan too, but it only sends to other people from a domain you have added and verified (its test sender reaches only your own address). Create an API key, then set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` (an address on that domain).
3. **`NUXT_SESSION_PASSWORD`:** any long random string.
4. Redeploy on Vercel, or restart `npm run dev` after editing `.env`.

**The map.** The itinerary map needs `NUXT_PUBLIC_MAPBOX_TOKEN` (a public `pk.` token from your Mapbox account), in `.env` and on Vercel. It is a browser token, so restrict it to your site's addresses in the Mapbox dashboard. Without it the map card says it could not load and the days still work.

**Where the emailed link points.** It is never taken from the request's `Host` header, because anyone can post a sign-up with a made-up one. On Vercel it is the project's production domain (production) or the deployment's own address (previews), which needs Vercel's system environment variables to be exposed (the default). On your machine it is the address you opened the page on, and only `localhost` or `127.0.0.1` count. Anywhere else, or to force a custom domain, set `AUTH_BASE_URL`; without it the sign-up fails and the server log names the setting.

Not included yet: password reset and payments.
