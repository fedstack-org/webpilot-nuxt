<template>
  <div v-if="taskContext.messages.length">
    <div v-for="(msg, i) of taskContext.messages" :key="i">
      <CopilotMessageUser v-if="msg.role === 'user'" :message="msg" />
      <CopilotMessageAssistant v-else-if="msg.role === 'assistant'" :message="msg" />
      <CopilotMessageTool
        v-else-if="msg.role === 'tool'"
        :message="msg"
        @update:message="(newMessage) => taskContext.messages.splice(i, 1, newMessage)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { taskContext } = useCopilot()
</script>
