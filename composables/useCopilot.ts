import type { InjectionKey } from 'vue'

export interface ICopilotQuickAction {
  name: string
  instruction: string
}

export interface IUseCopilotOptions {
  agent?: IUseAgentOptions
  createAgentRoot?: boolean
  global?: boolean
}

const _useCopilot = ({
  agent: agentOptions,
  createAgentRoot = false,
  global = false
}: IUseCopilotOptions = {}) => {
  const show = ref(true)
  const {
    environment,
    taskContext,
    startStepTask,
    handleUserInput,
    newTask,
    config,
    toolFilter,
    instructionFilter
  } = useAgent(createAgentRoot, agentOptions)
  const quickActions = ref<ICopilotQuickAction[]>([])
  return {
    global,
    show,
    environment,
    taskContext,
    startStepTask,
    handleUserInput,
    newTask,
    config,
    quickActions,
    toolFilter,
    instructionFilter
  }
}

const copilotKey: InjectionKey<ReturnType<typeof _useCopilot>> = Symbol('copilot')

export const useCopilot = (root = false, options?: IUseCopilotOptions) => {
  if (!root) {
    const provided = inject(copilotKey, null)
    if (provided) return provided
  }
  const created = _useCopilot(options)
  provide(copilotKey, created)
  return created
}

export const useQuickAction = (action: ICopilotQuickAction) => {
  const { quickActions } = useCopilot()
  onMounted(() => {
    quickActions.value.push(action)
  })
  onBeforeUnmount(() => {
    const index = quickActions.value.findIndex(
      (a) => a.name === action.name && a.instruction === action.instruction
    )
    if (index > -1) {
      quickActions.value.splice(index, 1)
    }
  })
}
