import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

const _useLocale = () => {
  const lang = useRouteQuery('lang')
  const { locale, locales, setLocale } = useI18n({ useScope: 'global' })
  type Locale = typeof locale.value
  const persisted = useLocalStorage<Locale>('locale', locale.value)
  const nLocale = computed(() => {
    switch (persisted.value) {
      case 'en-US':
        return { locale: enUS, dateLocale: dateEnUS }
      case 'zh-Hans':
      default:
        return { locale: zhCN, dateLocale: dateZhCN }
    }
  })
  const currentLocale = computed(() =>
    locales.value.find((locale) => locale.code === persisted.value)
  )

  watch(
    () => persisted.value,
    (value) => {
      if (locales.value.some((locale) => locale.code === value)) {
        console.log(`[Locale] Changing locale to ${value}`)
        setLocale(value)
      } else {
        console.log(`[Locale] Invalid locale: ${value}, changing to ${locale.value}`)
        nextTick(() => {
          persisted.value = locale.value
        })
      }
    },
    { immediate: true }
  )
  if (lang.value) {
    if (
      typeof lang.value === 'string' &&
      locales.value.some((locale) => locale.code === lang.value)
    ) {
      console.log(`[Locale] Persisting locale into ${lang.value}`)
      persisted.value = lang.value as Locale
    }
    lang.value = null
  }

  return { nLocale, locales, locale: persisted, currentLocale }
}

const localeKey: InjectionKey<ReturnType<typeof _useLocale>> = Symbol('locale')

export const useLocale = () => {
  const provided = inject(localeKey, null)
  if (provided) return provided
  const created = _useLocale()
  provide(localeKey, created)
  return created
}
