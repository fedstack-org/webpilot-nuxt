<template>
  <div class="px-4 h-16 min-h-16 max-h-16 flex items-center gap-2">
    <h1 class="text-lg">
      <div class="i-fa6-brands:internet-explorer text-lg inline-block mb-[-0.15rem]" />
      智能助手
    </h1>
    <div class="flex-1" />
    <NButton secondary circle class="!h-8 !w-8" @click="newTask">
      <div class="i-carbon:add-comment text-lg" />
    </NButton>
    <NButton v-if="showClose" circle class="!h-8 !w-8" @click="show = false">
      <div class="i-carbon:close text-lg" />
    </NButton>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{ showClose?: boolean }>()
const { show, newTask } = useCopilot()
</script>
