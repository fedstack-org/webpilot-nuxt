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
  runtimeConfig: {
    public: {
      uaaa: {
        issuer: 'https://unifiedauth.pku.edu.cn',
        clientAppId: 'cn.edu.pku.aibase',
        serverAppId: 'cn.edu.pku.aibase',
        issuerAppId: 'uaaa'
      }
    }
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
    },
    optimizeDeps: {
      include: ['debug']
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
