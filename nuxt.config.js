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
 