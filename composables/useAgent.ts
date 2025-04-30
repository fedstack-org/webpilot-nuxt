export interface IAgentToolConfig {
  disabled?: boolean
  approved?: boolean
}

export interface IAgentInstructionConfig {
  disabled?: boolean
}

export interface IUseAgentOptions {
  environment?: IUseEnvironmentOptions
  createEnvironmentRoot?: boolean
  toolFilter?: (tool: IAgentTool) => boolean
  instructionFilter?: (instruction: IAgentInstruction) => boolean
}

const _useAgent = ({
  environment: environmentOptions,
  createEnvironmentRoot = false,
  toolFilter = () => true,
  instructionFilter = () => true
}: IUseAgentOptions = {}) => {
  const { openai, environment, currentModel, models } = useEnvironment(
    createEnvironmentRoot,
    environmentOptions
  )
  const taskContext = ref<ITaskContext>({ messages: [] })
  const startStepTask = useTask(
    () =>
      environment.nextStep(taskContext.value, {
        toolFilter: (tool) => !config.tools[tool.name]?.disabled && toolFilter(tool),
        instructionFilter: (instruction) =>
          !config.instructions[instruction.name]?.disabled && instructionFilter(instruction),
        model: currentModel.value
      }),
    { toast: false }
  )
  const handleUserInput = (content: string) => {
    taskContext.value.messages.push({
      role: 'user',
      content
    })
    startStepTask.execute()
  }
  const newTask = () => {
    taskContext.value = {
      messages: []
    }
  }
  const config = reactive({
    tools: {} as Record<string, IAgentToolConfig>,
    instructions: {} as Record<string, IAgentInstructionConfig>
  })
  return {
    openai,
    environment,
    currentModel,
    models,
    taskContext,
    startStepTask,
    config,
    handleUserInput,
    newTask,
    toolFilter,
    instructionFilter
  }
}

const agentKey: InjectionKey<ReturnType<typeof _useAgent>> = Symbol('agent')

export const useAgent = (root = false, options?: IUseAgentOptions) => {
  if (!root) {
    const provided = inject(agentKey, null)
    if (provided) return provided
  }
  const created = _useAgent(options)
  provide(agentKey, created)
  return created
}
