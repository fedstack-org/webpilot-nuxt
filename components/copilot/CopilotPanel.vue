<template>
  <div class="w-full h-full flex flex-col items-stretch">
    <CopilotHeader show-close class="z-10 shadow" />
    <NScrollbar
      v-if="taskContext.messages.length"
      ref="scrollbar"
      content-class="overflow-hidden"
      class="flex-1"
      :class="[$style['copilot-panel']]"
      @scroll="onScroll"
    >
      <CopilotMessages />
    </NScrollbar>
    <CopilotNoMessages v-else :class="[$style['copilot-panel']]" />
    <CopilotInput />
    <CopilotFooter />
  </div>
</template>

<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

const { options = {} } = defineProps<{
  options?: ICopilotViewOptions
}>()

provideCopilotView(options)

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

watch(
  () => taskContext.value.messages.length,
  (val) => val || (stickyToBottom.value = true),
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

<style lang="css" module>
.copilot-panel {
  background: #0000000c;
}
</style>
