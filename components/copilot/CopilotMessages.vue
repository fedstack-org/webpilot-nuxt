<template>
  <div v-if="taskContext.messages.length" class="py-2 space-y-1">
    <div v-for="(msg, i) of taskContext.messages" :key="i">
      <CopilotMessageUser v-if="msg.role === 'user'" :message="msg" :user-name />
      <CopilotMessageAssistant v-else-if="msg.role === 'assistant'" :message="msg" />
      <CopilotMessageTool
        v-else-if="msg.role === 'tool' && msg.use.name !== '_no_tool'"
        :message="msg"
        @update:message="(newMessage) => taskContext.messages.splice(i, 1, newMessage)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName?: string
}>()

const { taskContext } = useCopilot()
</script>
