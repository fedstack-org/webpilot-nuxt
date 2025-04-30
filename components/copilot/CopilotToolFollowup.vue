<template>
  <div class="flex flex-col gap-2">
    <MarkdownContent
      class="max-w-none markdown-body bg-transparent!"
      :content="message?.use.params.question ?? ''"
    />
    <NButton
      v-for="(option, i) of options"
      :key="i"
      :disabled="disabled"
      :type="message.result === option ? 'success' : undefined"
      @click="handleAnswer(option)"
    >
      {{ option }}
    </NButton>
    <NInput
      v-model:value="message.uiState!.input"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      :placeholder="'请回答（⏎提交 ⇧+⏎换行）'"
      :disabled="disabled"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput } from 'naive-ui'

const message = defineModel<IToolMessage>('message', { required: true })
const { startStepTask } = useCopilot()

message.value.uiState ??= {}

const options = computed<string[]>(() => message.value.params.options ?? [])
const disabled = computed(() => message.value.state !== 'pending-response')

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAnswer(message.value.uiState!.input)
  }
}

const handleAnswer = (answer: string) => {
  message.value.result = answer
  message.value.formattedResult = answer
  message.value.state = 'completed'
  startStepTask.execute()
}
</script>
