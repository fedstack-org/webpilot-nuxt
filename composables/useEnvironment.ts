import type OpenAI from 'openai'
import type { InjectionKey } from 'vue'

export interface IUseEnvironmentOptions {
  config?: IEnvironmentConfig
  storageKey?: string
  initialModel?: string
  modelFilter?: (model: OpenAI.Models.Model) => boolean
  additionalModels?: OpenAI.Models.Model[]
}

const _useEnvironment = ({
  config,
  storageKey,
  initialModel = '',
  modelFilter = () => true,
  additionalModels = []
}: IUseEnvironmentOptions = {}) => {
  const { openai } = useOpenAI()
  const environment = new Environment(openai, config)
  const environmentId = useId() || 'environment'
  const currentModel = storageKey
    ? useLocalStorage(`environment-model-${storageKey}`, initialModel)
    : ref(initialModel)
  const models = useAsyncData(
    computed(() => `model-list-${environmentId}`),
    async () => {
      const { data } = await openai.models.list()
      const filtered = [...data, ...additionalModels].filter(modelFilter)
      if (!filtered.some((model) => model.id === currentModel.value)) {
        currentModel.value = ''
      }
      if (!currentModel.value && filtered.length > 0) {
        currentModel.value = filtered[0].id
      }
      return filtered
    },
    { default: () => [] }
  )
  return { openai, environment, currentModel, models }
}

const environmentKey: InjectionKey<ReturnType<typeof _useEnvironment>> = Symbol('environment')

export const useEnvironment = (root = false, options?: IUseEnvironmentOptions) => {
  if (!root) {
    const provided = inject(environmentKey, null)
    if (provided) return provided
  }
  const created = _useEnvironment(options)
  provide(environmentKey, created)
  return created
}

export const useTool = <Param, Result>(spec: IAgentTool<Param, Result>) => {
  const { environment } = useEnvironment()
  const instance = getCurrentInstance()
  let cleanup: () => void
  onMounted(() => {
    cleanup = environment.registerTool(spec.name, {
      ...spec,
      metadata: {
        ...(spec.metadata ?? {}),
        provider: spec.metadata?.provider ?? instance?.type.__name ?? 'unspecified'
      }
    })
  })
  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
    }
  })
  return { tool: environment.getToolRef(spec.name) }
}

export const useInstruction = (spec: IAgentInstruction) => {
  const { environment } = useEnvironment()
  const instance = getCurrentInstance()
  let cleanup: () => void
  onMounted(() => {
    cleanup = environment.registerInstruction(spec.name, {
      ...spec,
      metadata: {
        ...(spec.metadata ?? {}),
        provider: spec.metadata?.provider ?? instance?.type.__name ?? 'unspecified'
      }
    })
  })
  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
    }
  })
  return { instruction: environment.getInstructionRef(spec.name) }
}
