<template>
  <div class="flex flex-col gap-2">
    <MarkdownContent
      class="max-w-none markdown-body bg-transparent!"
      :content="message?.use.params.result ?? ''"
    />
    <NButton :disabled="disabled" :loading="newTask.loading.value" @click="newTask.execute()">
      {{ $t('webpilot.action.new_task') }}
    </NButton>
    <NInput
      v-model:value="message.uiState!.input"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      :placeholder="$t('webpilot.msg.attempt_completion_feedback_placeholder')"
      :disabled="disabled"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput } from 'naive-ui'

const message = defineModel<IToolMessage>('message', { required: true })
const { startStepTask, newTask } = useCopilot()

message.value.uiState ??= {}

const disabled = computed(() => message.value.state !== 'pending-response')

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAnswer(message.value.uiState!.input)
  }
}

const handleAnswer = (answer: string) => {
  message.value.feedback = answer
  message.value.state = 'rejected'
  startStepTask.execute()
}
</script>
