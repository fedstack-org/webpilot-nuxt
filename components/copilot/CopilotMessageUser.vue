<template>
  <div class="p-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar class="bg-blue">{{ (userName ?? $t('webpilot.term.user')).slice(-2) }}</NAvatar>
        </div>
      </template>
      <div class="w-0 min-w-full">
        <MarkdownContent
          class="prose prose-sm min-w-full max-w-full markdown-body bg-transparent!"
          :content="message.content"
        />
      </div>
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
