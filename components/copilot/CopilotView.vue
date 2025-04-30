<template>
  <div v-if="taskContext.messages.length > 0" class="w-full h-full flex flex-col items-stretch">
    <CopilotHeader />
    <NScrollbar ref="scrollbar" class="flex-1" content-style="overflow: hidden;">
      <CopilotMessages />
    </NScrollbar>
    <CopilotInput :advanced />
    <CopilotFooter />
  </div>
  <div v-else>
    <NCard :bordered="false">
      <template #header>
        <slot name="header" />
      </template>
      <div class="text-lg text-center font-medium pb-2">
        <slot name="welcome">
          {{ welcome ?? '请输入您的问题' }}
        </slot>
      </div>
      <CopilotInput :advanced :min-rows="4" :max-rows="8" />
      <CopilotFooter />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NCard, NScrollbar } from 'naive-ui'

defineProps<{
  welcome?: string
  advanced?: boolean
}>()

const scrollbar = useTemplateRef('scrollbar')
const { taskContext } = useCopilot()
const stickyToBottom = ref(true)
const scrollToBottom = useDebounceFn(
  () => {
    scrollbar.value?.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior: 'smooth'
    })
  },
  200,
  { maxWait: 500 }
)

watch(
  () => taskContext.value.messages,
  () => stickyToBottom.value && scrollToBottom(),
  { immediate: true, deep: true }
)
</script>
