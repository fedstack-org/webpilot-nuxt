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
    openai,
    environment,
    currentModel,
    models,
    taskContext,
    startStepTask,
    abortStepTask,
    tasks,
    recentTasks,
    saveTask,
    deleteTask,
    clearTasks,
    switchTask,
    summarizeTask,
    handleUserInput,
    newTask,
    config,
    toolFilter,
    instructionFilter
  } = useAgent(createAgentRoot, agentOptions)
  const quickActions = ref<ICopilotQuickAction[]>([])
  const userInput = ref('')
  return {
    global,
    show,
    openai,
    environment,
    currentModel,
    models,
    taskContext,
    startStepTask,
    abortStepTask,
    tasks,
    recentTasks,
    saveTask,
    deleteTask,
    clearTasks,
    switchTask,
    summarizeTask,
    handleUserInput,
    newTask,
    config,
    quickActions,
    toolFilter,
    instructionFilter,
    userInput
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
