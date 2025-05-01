<template>
  <NConfigProvider
    :theme-overrides="themeOverrides"
    :locale="nLocale.locale"
    :date-locale="nLocale.dateLocale"
  >
    <NMessageProvider>
      <NDialogProvider>
        <!-- Main + Copilot -->
        <NLayout position="absolute" has-sider sider-placement="right">
          <!-- Header + Body -->
          <NLayout content-class="flex flex-col items-stretch">
            <NLayoutHeader class="z-10 shadow flex items-center px-4 min-h-16 max-h-16 h-16">
              <NuxtLink
                to="/"
                class="flex items-center text-2xl cursor-pointer decoration-none text-inherit"
              >
                <span>{{ appName }}</span>
              </NuxtLink>
              <ToolsProvider />
              <div class="flex-1" />
              <div class="flex items-center space-x-4">
                <AppLogout />
                <AppLocaleSelect />
              </div>
            </NLayoutHeader>
            <!-- Nav + Content -->
            <NLayoutContent content-class="px-2 grid justify-items-center">
              <NuxtPage />
            </NLayoutContent>
          </NLayout>
          <NLayoutSider :native-scrollbar="false" bordered :width="320" content-class="h-full">
            <CopilotPanel advanced />
          </NLayoutSider>
        </NLayout>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import {
  NConfigProvider,
  NDialogProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMessageProvider,
  type GlobalThemeOverrides
} from 'naive-ui'

const { t } = useI18n()
const appName = computed(() => t('app_name'))

useHead({
  titleTemplate: `%s %separator %appName`,
  templateParams: {
    appName
  }
})

useCopilot(true, {
  global: true,
  agent: {
    environment: {
      initialModel: 'deepseek-v3',
      modelFilter: (model) => [/^gpt-/i, /^o\d+/i, /^deepseek-/i].some((re) => re.test(model.id)),
      storageKey: 'default'
    }
  }
})
const { nLocale } = useLocale()

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  return {
    common: {
      primaryColor: '#9A0000',
      primaryColorHover: '#C62828',
      primaryColorPressed: '#B71C1C'
    }
  }
})
</script>
