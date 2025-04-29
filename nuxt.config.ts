// https://nuxt.com/docs/api/configuration/nuxt-config

const { host: SERVER_HOST, protocol: SERVER_PROTOCOL } = new URL(
  process.env.SERVER_BASE || 'http://localhost:4010'
)

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  modules: [
    //
    '@nuxt/eslint',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@uaaa/nuxt',
    'nuxtjs-naive-ui',
    '@nuxtjs/i18n'
  ],
  devtools: { enabled: true },
  runtimeConfig: {},
  uaaa: {
    issuer: process.env.UAAA_URL ?? 'https://unifiedauth.pku.edu.cn',
    issuerAppId: process.env.UAAA_ISSUER_ID ?? 'uaaa',
    clientAppId: process.env.UAAA_CLIENT_ID ?? 'cn.edu.pku.aibase',
    serverAppId: process.env.UAAA_SERVER_ID ?? 'cn.edu.pku.aibase'
  },
  nitro: {
    devProxy: {
      '/api': {
        target: `${SERVER_PROTOCOL}//${SERVER_HOST}/api`,
        changeOrigin: true
      }
    }
  },
  vite: {
    build: {
      target: 'ES2022'
    }
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh-Hans',
    locales: [
      //
      { code: 'en-US', name: 'English', file: 'en-US.yml' },
      { code: 'zh-Hans', name: '简体中文', file: 'zh-Hans.yml' }
    ],
    bundle: { optimizeTranslationDirective: false }
  },
  hooks: {
    'prerender:routes': ({ routes }) => {
      routes.clear()
    }
  }
})
