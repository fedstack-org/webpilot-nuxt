<template>
  <div class="my-2">
    <NSpace>
      <NButton
        v-for="option in options"
        :key="option"
        :type="option === message.result ? 'primary' : undefined"
        size="small"
        :disabled="disabled"
        @click="handleAnswer(option)"
      >
        {{ option }}
      </NButton>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import { NButton, NSpace } from 'naive-ui'

const message = defineModel<IToolMessage>('message', { required: true })
const { startStepTask } = useCopilot()

message.value.uiState ??= {}

const options = computed<string[]>(() => message.value.params.options ?? [])
const disabled = computed(() => message.value.state !== 'pending-response')

const handleAnswer = (answer: string) => {
  message.value.result = answer
  message.value.formattedResult = answer
  message.value.state = 'completed'
  startStepTask.execute(true)
}
</script>
