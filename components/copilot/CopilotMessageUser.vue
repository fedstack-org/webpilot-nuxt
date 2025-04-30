<template>
  <div class="p-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar class="bg-blue">{{ (userName ?? '用户').slice(-2) }}</NAvatar>
        </div>
      </template>
      <MarkdownContent
        class="prose prose-sm max-w-none markdown-body bg-transparent!"
        :content="message.content"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAvatar, NCard } from 'naive-ui'

defineProps<{
  message: ITextMessage
  userName?: string
}>()
</script>
