<template>
  <div class="px-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar size="small" class="bg-blue">
            {{ (userName ?? $t('webpilot.term.user')).slice(-2) }}
          </NAvatar>
        </div>
      </template>
      <MarkdownContent class="w-0 min-w-full bg-transparent!" :content="message.content" />
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
