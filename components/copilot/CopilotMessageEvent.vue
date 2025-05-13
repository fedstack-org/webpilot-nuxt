<template>
  <div v-if="message" class="px-2">
    <NAlert :type :title="$t(`webpilot.msg.event_title__${message.type}`)" />
  </div>
</template>

<script setup lang="ts">
import { NAlert } from 'naive-ui'

const props = defineProps<{
  message?: IEventMessage
}>()

const type = computed<'error' | 'default' | 'info' | 'success' | 'warning'>(() => {
  switch (props.message?.type) {
    case 'max_retries_reached':
    case 'api_error':
      return 'error'
    default:
      return 'info'
  }
})
</script>
