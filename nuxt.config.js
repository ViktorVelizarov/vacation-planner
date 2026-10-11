// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [ 
  '@nuxtjs/google-fonts',  '@nuxtjs/tailwindcss', 'shadcn-nuxt', 
],
shadcn: {
  prefix: '',
  /**
   * Directory that the component lives in.
   * @default "./components/ui"
   */
  componentDir: './components/ui'
},


  googleFonts: {
    families: {
      Inter: [300, 500, 700],
    }
  },
  
  runtimeConfig: {
    public: {
      mapboxToken: '', // set NUXT_PUBLIC_MAPBOX_TOKEN (a public pk. token); see .env.example
    },
  },

  // The whole app is one Vercel function. Drafting a plan is the slow part (about 25 seconds for 10 days) and gives up after
  // DRAFT_TIMEOUT_MS in server/api/GetItinerary.js, so keep maxDuration comfortably longer than that. Nitro 2 only knows Node 18,
  // 20 and 22 and would pick 22 by itself: keep runtime in step with "engines" in package.json.
  nitro: {
    vercel: {
      functions: {
        runtime: 'nodejs24.x',
        maxDuration: 120,
      },
    },
  },

  devtools: { enabled: false },
  css: [
    "~/assets/main.css",
    "~/assets/css/landing.css"
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  }
})
 