<template>
  <div v-if="taskContext.messages.length > 0" class="w-full h-full flex flex-col items-stretch">
    <CopilotHeader />
    <NScrollbar ref="scrollbar" class="flex-1" content-style="overflow: hidden;">
      <CopilotMessages />
    </NScrollbar>
    <CopilotInput />
    <CopilotFooter />
  </div>
  <div v-else>
    <NCard :bordered="false">
      <template #header>
        <div class="text-center">
          <div>
            <img src="/cat.svg" class="h-32" />
          </div>
          <div class="text-2xl">{{ title ?? '智能助手' }}</div>
        </div>
      </template>
      <div class="text-lg text-center font-medium pb-2">
        <span>{{ $api.profile.value.name ?? '您好' }}</span>
        ，{{ welcome ?? '请输入您的问题' }}
      </div>
      <CopilotInput :min-rows="4" :max-rows="8" />
      <CopilotFooter />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NCard, NScrollbar } from 'naive-ui'

defineProps<{
  title?: string
  welcome?: string
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
