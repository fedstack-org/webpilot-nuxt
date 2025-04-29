<template>
  <NButton circle @click="showLogoutDialog">
    <template #icon>
      <NIcon><div class="i-carbon:logout" /></NIcon>
    </template>
  </NButton>
</template>

<script setup lang="ts">
import { NButton, NIcon, useDialog } from 'naive-ui'

const { $auth } = useNuxtApp()
const dialog = useDialog()

const logout = useTask(async () => {
  await $auth.logout()
})

const showLogoutDialog = () => {
  dialog.warning({
    title: '确认',
    content: '您正在登出AI课程论坛系统',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => logout.execute()
  })
}
</script>
