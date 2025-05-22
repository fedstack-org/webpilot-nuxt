<template>
  <div class="px-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar size="small" class="bg-[#990000]">
            <NIcon>
              <div class="i-webpilot:icon" />
            </NIcon>
          </NAvatar>
          <div v-if="options.messages?.assistant?.title !== false">
            {{ $t(message?.partial ? 'webpilot.msg.api_pending' : 'webpilot.msg.api_success') }}
          </div>
        </div>
      </template>
      <template #header-extra>
        <NSpin v-if="message?.partial" :size="24" />
        <NIcon v-else-if="message?.aborted" :size="24" color="red">
          <div class="i-carbon:stop" />
        </NIcon>
        <NIcon v-else :size="24" color="green">
          <div class="i-carbon:checkmark" />
        </NIcon>
      </template>
      <NCollapse v-if="message?.thought" class="mb-2">
        <NCollapseItem :title="thinkingTitle">
          <NCard embedded>
            <MarkdownContent class="w-0 min-w-full bg-transparent!" :content="message.thought" />
          </NCard>
        </NCollapseItem>
      </NCollapse>
      <MarkdownContent class="w-0 min-w-full bg-transparent!" :content />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAvatar, NCard, NCollapse, NCollapseItem, NIcon, NSpin } from 'naive-ui'

const props = defineProps<{
  message?: ITextMessage
}>()

const options = useCopilotView()
const { t } = useI18n()
const content = computed(() => {
  if (!props.message) return ''
  if (props.message.content) return props.message.content
  if (props.message.partial || props.message.aborted) return ''
  return t('webpilot.msg.direct_tool_use')
})
const thinkingTitle = computed(() => {
  if (!props.message) return ''
  if (props.message.partial && !props.message.content) return t('webpilot.msg.thinking')
  return t('webpilot.msg.thought')
})
</script>
