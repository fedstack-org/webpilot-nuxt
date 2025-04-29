<template>
  <div class="w-full h-full flex flex-col items-stretch">
    <CopilotHeader show-close class="z-10 shadow" />
    <NScrollbar
      v-if="taskContext.messages.length"
      ref="scrollbar"
      class="flex-1"
      :class="[$style['copilot-panel']]"
      content-style="overflow: hidden;"
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

<style lang="css" module>
.copilot-panel {
  background: #0000000c;
}
</style>
