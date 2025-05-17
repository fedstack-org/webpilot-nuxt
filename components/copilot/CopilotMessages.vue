<template>
  <div
    v-if="messages.length"
    class="py-2 space-y-1"
    :class="{ 'wp--emphasize': options.messages?.emphasizeFinalMessage }"
  >
    <div v-for="(msg, i) of messages" :key="i" class="wp-msg" :class="[`wp-msg-${msg.role}`]">
      <CopilotMessageUser v-if="msg.role === 'user'" :message="msg" />
      <CopilotMessageAssistant v-else-if="msg.role === 'assistant'" :message="msg" />
      <CopilotMessageEvent v-else-if="msg.role === 'event'" :message="msg" />
      <CopilotMessageTool
        v-else-if="msg.role === 'tool' && msg.use.name !== '_no_tool'"
        :message="msg"
        @update:message="(newMessage) => messages.splice(i, 1, newMessage)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { taskContext } = useCopilot()
const options = useCopilotView()
const messages = computed(() => taskContext.value.messages)
</script>

<style lang="css">
.wp--emphasize .wp-msg {
  opacity: 0.5;
  transition: 200ms;
}

.wp--emphasize .wp-msg-user,
.wp--emphasize .wp-msg:hover,
.wp--emphasize :last-child {
  opacity: 1;
}
</style>
