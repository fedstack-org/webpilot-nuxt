<template>
  <div class="p-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar class="bg-[#990000]">
            <NIcon size="22">
              <div class="i-fa6-brands:internet-explorer" />
            </NIcon>
          </NAvatar>
          <div>{{ message?.partial ? '请求中' : '请求成功' }}</div>
        </div>
      </template>
      <template #header-extra>
        <NSpin v-if="message?.partial" :size="24" />
        <NIcon v-else :size="24" color="green">
          <div class="i-carbon:checkmark" />
        </NIcon>
      </template>
      <NCollapse v-if="message?.thought">
        <NCollapseItem title="思考中">
          <NCard embedded>
            <MarkdownContent class="prose prose-sm max-w-none bg-transparent!" :content="message?.thought" />
          </NCard>
        </NCollapseItem>
      </NCollapse>
      <MarkdownContent
        class="prose prose-sm max-w-none bg-transparent!"
        :content="message?.content || (message?.partial ? '*等待响应*' : '我将直接使用工具来完成任务')"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAvatar, NCard, NCollapse, NCollapseItem, NIcon, NSpin } from 'naive-ui'

defineProps<{
  message?: ITextMessage
}>()
</script>
