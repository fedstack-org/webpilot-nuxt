<template>
  <div class="px-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar size="small" class="bg-[#990000]">
            <NIcon>
              <div class="i-fa6-brands:internet-explorer" />
            </NIcon>
          </NAvatar>
          <div>
            {{ $t(message?.partial ? 'webpilot.msg.api_pending' : 'webpilot.msg.api_success') }}
          </div>
        </div>
      </template>
      <template #header-extra>
        <NSpin v-if="message?.partial" :size="24" />
        <NIcon v-else :size="24" color="green">
          <div class="i-carbon:checkmark" />
        </NIcon>
      </template>
      <NCollapse v-if="message?.thought" class="mb-2">
        <NCollapseItem
          :title="
            $t(
              message?.partial && !message?.content
                ? 'webpilot.msg.thinking'
                : 'webpilot.msg.thought'
            )
          "
        >
          <NCard embedded>
            <div class="w-0 min-w-full">
              <MarkdownContent
                class="prose prose-sm min-w-full max-w-full bg-transparent!"
                :content="message?.thought"
              />
            </div>
          </NCard>
        </NCollapseItem>
      </NCollapse>
      <div class="w-0 min-w-full">
        <MarkdownContent
          class="prose prose-sm min-w-full max-w-full bg-transparent!"
          :content="
            message?.content || (message?.partial ? '' : $t('webpilot.msg.direct_tool_use'))
          "
        />
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAvatar, NCard, NCollapse, NCollapseItem, NIcon, NSpin } from 'naive-ui'

defineProps<{
  message?: ITextMessage
}>()
</script>
