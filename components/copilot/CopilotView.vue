<template>
  <div
    v-if="taskContext.messages.length > 0"
    class="w-0 min-w-full h-full flex flex-col items-stretch"
  >
    <CopilotHeader />
    <NScrollbar ref="scrollbar" class="flex-1" content-class="overflow-hidden" @scroll="onScroll">
      <CopilotMessages :user-name />
    </NScrollbar>
    <CopilotInput :advanced />
    <CopilotFooter />
  </div>
  <div v-else-if="tasks.data.value.length && showTasks">
    <NScrollbar
      class="w-0 min-w-full flex-1"
      content-class="overflow-hidden flex flex-col gap-2 p-4 items-center"
    >
      <div class="self-stretch flex items-center">
        <div class="flex-1 flex justify-start">
          <NButton size="small" @click="showTasks = false">
            <template #icon>
              <NIcon>
                <div class="i-carbon:chevron-left" />
              </NIcon>
            </template>
          </NButton>
        </div>
        {{ $t('webpilot.msg.all_tasks') }}
        <div class="flex-1 flex justify-end">
          <NPopconfirm @positive-click="clearTasks.execute()">
            <template #trigger>
              <NButton size="small" type="error" :loading="clearTasks.loading.value">
                <NIcon>
                  <div class="i-carbon:trash-can" />
                </NIcon>
              </NButton>
            </template>
            {{ $t('webpilot.msg.clear_tasks_confirm') }}
          </NPopconfirm>
        </div>
      </div>
      <CopilotTask v-for="task in tasks.data.value" :key="task._id" :task />
    </NScrollbar>
  </div>
  <div v-else>
    <NCard :bordered="false">
      <template #header>
        <slot name="header" />
      </template>
      <div class="text-lg text-center font-medium pb-2">
        <slot name="welcome">
          {{ welcome ?? $t('webpilot.msg.welcome') }}
        </slot>
      </div>
      <CopilotInput :advanced :min-rows="4" :max-rows="8" />
      <div v-if="tasks.data.value.length" class="flex justify-center space-x-2 mt-2">
        <NButton type="primary" :disabled="!userInput" @click="handleUserInput(userInput)">
          {{ $t('webpilot.msg.start_task') }}
        </NButton>
        <NButton type="info" secondary @click="showTasks = true">
          {{ $t('webpilot.msg.show_all_tasks') }}
        </NButton>
      </div>
      <CopilotFooter />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NIcon, NPopconfirm, NScrollbar } from 'naive-ui'

defineProps<{
  welcome?: string
  advanced?: boolean
  userName?: string
}>()

const scrollbar = useTemplateRef('scrollbar')
const { taskContext, clearTasks, tasks, userInput, handleUserInput } = useCopilot()
const showTasks = ref(false)
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

watch(
  () => taskContext.value.messages.length,
  (val) => {
    if (!val) {
      stickyToBottom.value = true
      showTasks.value = false
    }
  },
  { immediate: true }
)

let previousScrollTop = 0
const onScroll = (e: Event) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement
  const threshold = 16
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    stickyToBottom.value = true
  } else if (scrollTop < previousScrollTop) {
    stickyToBottom.value = false
  }
  previousScrollTop = scrollTop
}
</script>
