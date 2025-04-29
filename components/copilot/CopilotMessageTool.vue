<template>
  <div class="p-2">
    <NCard size="small">
      <template #header>
        <div class="flex items-center gap-2">
          <NAvatar class="bg-blue-6">
            <NIcon size="22">
              <div :class="[iconClass]" />
            </NIcon>
          </NAvatar>
          <div>智能助手{{ toolTitle }}</div>
        </div>
      </template>
      <template #header-extra>
        <NSpin v-if="displayState.pending" :size="24" />
        <NIcon v-else :size="24" :color="displayState.color">
          <div :class="displayState.class" />
        </NIcon>
      </template>
      <CopilotToolFollowup v-if="message.use.name === 'ask_followup_question'" :message />
      <CopilotToolCompletion v-else-if="message.use.name === 'attempt_completion'" :message />
      <NAlert v-else-if="message.state === 'bad-input'" title="AI遇到了问题，重试中" type="error" />
      <NCollapse v-else :default-expanded-names="['params', 'result']">
        <NCollapseItem name="params" title="工具调用详情">
          <CommonRenderFunction
            v-if="metadata?.uiParams"
            :renderer="metadata?.uiParams"
            :props="{ params: message.use.params }"
          />
          <MarkdownContent v-else class="border rounded max-w-none shadow" :content="details" />
        </NCollapseItem>
        <NCollapseItem v-if="message.result" name="result" title="工具调用结果">
          <CommonRenderFunction
            v-if="message.state === 'completed' && metadata?.uiResult"
            :renderer="metadata?.uiResult"
            :props="{ result: message.result }"
          />
          <MarkdownContent
            v-else
            class="border rounded max-w-none shadow"
            :content="displayCode(message.formattedResult || '')"
          />
        </NCollapseItem>
      </NCollapse>

      <div v-if="message.state === 'pending-approval'" class="mt-2">
        <CommonRenderFunction
          v-if="metadata?.uiApproval"
          :renderer="metadata?.uiApproval"
          :props="{
            params: message.params,
            state: message.state,
            uiState: message.uiState,
            'onUpdate:uiState': ($ev: Record<string, any>) => (message.uiState = $ev),
            approve,
            reject
          }"
        />
        <div v-else class="flex gap-2">
          <NButton :disabled size="small" secondary type="success" class="flex-1" @click="approve"> 允许 </NButton>
          <NButton :disabled size="small" secondary type="error" class="flex-1" @click="reject"> 拒绝 </NButton>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAlert, NAvatar, NButton, NCard, NCollapse, NCollapseItem, NIcon } from 'naive-ui'

const message = defineModel<IToolMessage>('message', { required: true })
const { startStepTask, environment, config } = useCopilot()
const disabled = computed(() => message.value.state !== 'pending-approval')

const details = computed(() =>
  `
${'```yaml'}
tool_name: ${message.value.use.name}
tool_params:
  ${Object.entries(message.value.use.params)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join('\n')}
${'```'}
`.trim()
)

const iconClass = computed(() => {
  switch (message.value.use.name) {
    case 'ask_followup_question':
      return 'i-carbon:help'
    case 'attempt_completion':
      return 'i-carbon:checkmark'
    default:
      return 'i-carbon:tool-kit'
  }
})

const metadata = computed(() => environment.tools.value[message.value.use.name]?.metadata)

const toolTitle = computed(() => {
  const toolName = metadata.value?.uiName ?? '工具'
  switch (message.value.use.name) {
    case 'ask_followup_question':
      return '想问您一个问题'
    case 'attempt_completion':
      return '完成了任务'
    default:
      switch (message.value.state) {
        case 'pending-response':
          return '正在使用工具'
        case 'completed':
        case 'failed':
          return `使用了${toolName}`
        case 'rejected':
          return '工具使用被拒绝'
        case 'pending-approval':
        default:
          return `希望使用${toolName}`
      }
  }
})

const displayState = computed(() => {
  switch (message.value.state) {
    case 'completed':
      return { class: 'i-carbon:checkmark', color: 'green' }
    case 'rejected':
      return { class: 'i-carbon:close-outline', color: 'red' }
    case 'failed':
      return { class: 'i-carbon:error', color: 'orange' }
    case 'bad-input':
      return { class: 'i-carbon:ai-status-failed', color: 'red' }
    case 'pending-approval':
      return { class: 'i-carbon:ai-status-in-progress', color: 'blue' }
    case 'pending-response':
      return { pending: true }
    default:
      return { class: 'i-carbon:tool-kit', color: 'blue' }
  }
})

function displayCode(code: string, lang: string = 'plain') {
  return '```' + lang + '\n' + code + '\n```'
}

function approve() {
  if (message.value.promise || message.value.result) return
  if (!['pending-approval', 'pending-response'].includes(message.value.state)) return
  message.value.state = 'pending-response'
  const tool = environment.tools.value[message.value.use.name]
  message.value.promise = tool.handler(message.value.params, message.value)
  message.value.promise
    .then((result) => {
      message.value.result = result
      message.value.formattedResult = tool.formatter(result)
      message.value.state = 'completed'
      startStepTask.execute()
    })
    .catch((err) => {
      message.value.result = err
      message.value.formattedResult = `${err}`
      message.value.state = 'failed'
      startStepTask.execute()
    })
}

function reject() {
  message.value.state = 'rejected'
  startStepTask.execute()
}

onMounted(() => {
  if (['ask_followup_question', 'attempt_completion'].includes(message.value.use.name)) {
    return
  }
  if (!environment.tools.value[message.value.use.name]?.needApproval || config.tools[message.value.use.name]?.approved) {
    approve()
  }
})
</script>
