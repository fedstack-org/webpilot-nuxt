<template>
  <NCard size="small">
    <div v-if="advanced" class="flex gap-2 items-center mb-2">
      <NPopover trigger="click">
        <template #trigger>
          <NTag type="info" size="small" class="cursor-pointer">
            <template #icon>
              <NIcon>
                <div class="i-carbon:tool-kit" />
              </NIcon>
            </template>
            {{ tools.filter((tool) => !config.tools[tool.name]?.disabled).length }} /
            {{ tools.length }}
          </NTag>
        </template>
        <div>
          <div class="text-center">
            {{ $t('webpilot.control.available_tools') }}
          </div>
          <div v-for="tool in tools" :key="tool.name" class="flex items-center gap-2">
            <NSwitch
              :value="!config.tools[tool.name]?.disabled"
              :round="false"
              :disabled="environment.tools.value[tool.name]?.metadata?.builtin"
              size="small"
              @update:value="toggleToolDisable(tool.name)"
            />
            <div class="flex-1">
              <span class="font-bold font-mono">{{ tool.name }}</span>
              <span v-if="tool.metadata?.provider" class="ml-2 text-xs font-mono">
                {{ tool.metadata.provider }}
              </span>
            </div>
            <NCheckbox
              :checked="
                !environment.tools.value[tool.name]?.needApproval ||
                config.tools[tool.name]?.approved
              "
              :disabled="!environment.tools.value[tool.name]?.needApproval"
              @update:checked="toggleToolApprove(tool.name)"
            >
              {{ $t('webpilot.control.auto_approve') }}
            </NCheckbox>
          </div>
        </div>
      </NPopover>
      <NPopover trigger="click">
        <template #trigger>
          <NTag type="info" size="small" class="cursor-pointer">
            <template #icon>
              <NIcon>
                <div class="i-carbon:text-indent" />
              </NIcon>
            </template>
            {{ instructions.filter((inst) => !config.instructions[inst.name]?.disabled).length }} /
            {{ instructions.length }}
          </NTag>
        </template>
        <div>
          <div class="text-center">
            {{ $t('webpilot.control.available_instructions') }}
          </div>
          <div class="grid grid-cols-1">
            <NCheckbox
              v-for="instruction in instructions"
              :key="instruction.name"
              :checked="!config.instructions[instruction.name]?.disabled"
              @update:checked="toggleInstructionDisable(instruction.name)"
            >
              <span class="font-bold font-mono">{{ instruction.name }}</span>
              <span v-if="instruction.metadata?.provider" class="ml-2 text-xs font-mono">
                {{ instruction.metadata.provider }}
              </span>
            </NCheckbox>
          </div>
        </div>
      </NPopover>
      <div class="flex-1" />
      <NPopselect v-model:value="currentModel" :options="modelOptions" trigger="click">
        <NTag type="primary" size="small" class="cursor-pointer">
          <template #icon>
            <NIcon>
              <div class="i-carbon:machine-learning-model" />
            </NIcon>
          </template>
          {{ currentModel || $t('webpilot.msg.no_model') }}
        </NTag>
      </NPopselect>
    </div>
    <NInput
      v-model:value="userInput"
      type="textarea"
      :autosize="{ minRows, maxRows }"
      :placeholder="$t('webpilot.msg.input_placeholder')"
      :disabled="!!disabled"
      @keydown="handleKeydown"
    />
    <div v-if="!taskContext.messages.length" class="mt-2 flex flex-col items-stretch">
      <NButton
        v-for="action of quickActions"
        :key="action.name"
        size="small"
        @click="handleUserInput(action.instruction)"
      >
        {{ action.name }}
      </NButton>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import type { SelectOption } from 'naive-ui'
import {
  NButton,
  NCard,
  NCheckbox,
  NIcon,
  NInput,
  NPopover,
  NPopselect,
  NSwitch,
  NTag
} from 'naive-ui'

const {
  minRows = 1,
  maxRows = 4,
  advanced = true
} = defineProps<{
  minRows?: number
  maxRows?: number
  advanced?: boolean
}>()

const {
  handleUserInput,
  startStepTask,
  environment,
  config,
  taskContext,
  quickActions,
  toolFilter,
  instructionFilter,
  currentModel,
  models,
  userInput
} = useCopilot()

const modelOptions = computed<SelectOption[]>(() =>
  models.data.value.map((model) => ({
    label: model.id,
    value: model.id
  }))
)

const disabled = computed(() => {
  if (startStepTask.loading.value) {
    return 'loading'
  }
  const lastMsg = taskContext.value.messages.at(-1)
  if (lastMsg?.role === 'tool') {
    if (['pending-approval', 'pending-response'].includes(lastMsg.state)) {
      return 'pending-tool'
    }
  }
  return ''
})

const tools = computed(() => Object.values(environment.tools.value).filter(toolFilter))
const instructions = computed(() =>
  Object.values(environment.instructions.value).filter(instructionFilter)
)

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleUserInput(userInput.value)
    userInput.value = ''
  }
}

const toggleToolDisable = (name: string) => {
  config.tools[name] ??= {}
  config.tools[name].disabled = !config.tools[name].disabled
}

const toggleToolApprove = (name: string) => {
  config.tools[name] ??= {}
  config.tools[name].approved = !config.tools[name].approved
}

const toggleInstructionDisable = (name: string) => {
  config.instructions[name] ??= {}
  config.instructions[name].disabled = !config.instructions[name].disabled
}
</script>
