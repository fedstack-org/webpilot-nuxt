<template>
  <NPopselect v-model:value="locale" :options="options" trigger="click">
    <NButton> {{ currentLocale?.name ?? currentLocale?.code ?? '选择语言' }} </NButton>
  </NPopselect>
</template>

<script setup lang="ts">
import type { SelectOption } from 'naive-ui'
import { NButton, NPopselect } from 'naive-ui'

const { currentLocale, locale, locales } = useLocale()
const options = computed<SelectOption[]>(() =>
  locales.value.map((item) => ({
    label: item.name ?? item.code,
    value: item.code
  }))
)
</script>
