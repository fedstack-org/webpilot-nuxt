export interface IAgentToolConfig {
  disabled?: boolean
  approved?: boolean
}

export interface IAgentInstructionConfig {
  disabled?: boolean
}

export interface IAgentTaskContext extends ITaskContext {
  _id: string
  title: string
  updatedAt: number
}

export interface IAgentTaskStorageProvider {
  getTasks: () => Promise<Pick<IAgentTaskContext, '_id' | 'title' | 'updatedAt'>[]>
  getTask: (taskId: string) => Promise<IAgentTaskContext | null>
  saveTask: (task: IAgentTaskContext) => Promise<string>
  deleteTask: (task: IAgentTaskContext) => Promise<void>
  clearTasks: () => Promise<void>
}

class AgentTaskStorageProviderDefault implements IAgentTaskStorageProvider {
  private tasks: IAgentTaskContext[] = []
  private generateId() {
    return Math.random().toString(36).substring(2, 15)
  }
  async getTasks() {
    return this.tasks.toSorted((a, b) => b.updatedAt - a.updatedAt)
  }
  async getTask(taskId: string) {
    return this.tasks.find((task) => task._id === taskId) || null
  }
  async saveTask(task: IAgentTaskContext) {
    task._id ||= this.generateId()
    const existingTaskIndex = this.tasks.findIndex((t) => t._id === task._id)
    if (existingTaskIndex !== -1) {
      this.tasks[existingTaskIndex] = task
    } else {
      this.tasks.push(task)
    }
    return task._id
  }
  async deleteTask(task: IAgentTaskContext) {
    this.tasks = this.tasks.filter((t) => t._id !== task._id)
  }
  async clearTasks() {
    this.tasks = []
  }
}

export interface IUseAgentOptions {
  environment?: IUseEnvironmentOptions
  createEnvironmentRoot?: boolean
  toolFilter?: (tool: IAgentTool) => boolean
  instructionFilter?: (instruction: IAgentInstruction) => boolean
  storage?: IAgentTaskStorageProvider
  storageKey?: MaybeRef<string>
}

const _useAgent = ({
  environment: environmentOptions,
  createEnvironmentRoot = false,
  toolFilter = () => true,
  instructionFilter = () => true,
  storage = new AgentTaskStorageProviderDefault(),
  storageKey = 'agent_tasks'
}: IUseAgentOptions = {}) => {
  const { openai, environment, currentModel, models } = useEnvironment(
    createEnvironmentRoot,
    environmentOptions
  )
  const tasks = useAsyncData(storageKey, storage.getTasks.bind(storage), { default: () => [] })
  const recentTasks = computed(() => tasks.data.value.slice(0, 5))
  const saveTask = useTask(
    async () => {
      if (!taskContext.value.messages.length) return
      if (!taskContext.value.title) {
        await summarizeTask.execute()
      }
      taskContext.value._id = await storage.saveTask(taskContext.value)
    },
    { toast: false, onFinished: tasks.refresh }
  )
  const summarizeTask = useTask(
    async () => {
      if (!taskContext.value.messages.length) return
      taskContext.value.title = await environment.summarize(taskContext.value, {
        model: currentModel.value
      })
    },
    { toast: false, onFinished: tasks.refresh }
  )
  const deleteTask = useTask(storage.deleteTask.bind(storage), {
    toast: false,
    onFinished: tasks.refresh
  })
  const clearTasks = useTask(storage.clearTasks.bind(storage), {
    toast: false,
    onFinished: tasks.refresh
  })
  const switchTask = useTask(
    async (taskId: string) => {
      const task = await storage.getTask(taskId)
      taskContext.value = task || createEmptyTask()
    },
    { toast: false }
  )
  const createEmptyTask = () => ({
    _id: '',
    title: '',
    messages: [],
    updatedAt: Date.now()
  })
  const taskContext = ref<IAgentTaskContext>(createEmptyTask())
  const startStepTask = useTask(
    async () => {
      await environment.nextStep(taskContext.value, {
        toolFilter: (tool) => !config.tools[tool.name]?.disabled && toolFilter(tool),
        instructionFilter: (instruction) =>
          !config.instructions[instruction.name]?.disabled && instructionFilter(instruction),
        model: currentModel.value
      })
      saveTask.execute()
    },
    { toast: false }
  )
  const handleUserInput = (content: string) => {
    taskContext.value.messages.push({
      role: 'user',
      content
    })
    startStepTask.execute()
  }
  const newTask = useTask(
    async () => {
      await saveTask.execute()
      taskContext.value = createEmptyTask()
    },
    { toast: false }
  )
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
    tasks,
    recentTasks,
    saveTask,
    deleteTask,
    clearTasks,
    switchTask,
    summarizeTask,
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
