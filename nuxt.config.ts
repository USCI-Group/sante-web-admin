export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
    'reka-ui/nuxt',
    '@nuxtjs/google-fonts',
    '@sidebase/nuxt-auth',
    'nuxt-google-auth'
  ],
  auth: {
    isEnabled: true,
    baseURL: process.env.NUXT_PUBLIC_API_URL || 'https://production-sante-backend-peu2.encr.app',
    globalAppMiddleware: true,
    provider: {
      type: 'local',
      endpoints: {
        signIn: {
          path: '/api/auth/admin-login',
          // path: '/admin-login',
          method: 'post',
        },
        signOut: false,
        getSession: {
          path: '/api/auth/session',
          // path: '/session',
          method: 'get',
        },
      },
      token: {
        signInResponseTokenPointer: '/token',
        headerName: 'Authorization',
        type: 'Bearer',
      },
    },
  },
  googleFonts: {
    families: {
      Poppins: [300, 400, 500, 600, 700],
    },
    display: 'swap',
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://production-sante-backend-peu2.encr.app',
      appName: process.env.APP_NAME || 'Santé Admin',
      businessID: process.env.BUSINESS_ID,
      googleAuth: {
        clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
        autoLoadScript: true,
        promptOneTap: false,
        enableServerVerify: true,
      }
    }
  },
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: ['@/assets/css/tailwind.css', '@/assets/css/main.css'],
  hooks: {
    'pages:extend'(routes) {
      routes.push({
        path: '/',
        redirect: '/login'
      })
    }
  },
})