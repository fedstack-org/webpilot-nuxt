import OpenAI from 'openai'
import type { InjectionKey } from 'vue'

const _useEnvironment = () => {
  const { $auth } = useNuxtApp()
  const openai = new OpenAI({
    apiKey: 'sk-fake',
    baseURL: new URL('/api/ai', location.origin).toString(),
    dangerouslyAllowBrowser: true,
    fetch: async (...args) => {
      const request = new Request(...args)
      const headers = new Headers(request.headers)
      const token = await $auth.getAuthToken()
      headers.set('Authorization', `Bearer ${token?.token}`)
      return fetch(new Request(request, { headers }))
    }
  })
  const environment = new Environment(openai, { model: 'deepseek-v3' })
  return { openai, environment }
}

const environmentKey: InjectionKey<ReturnType<typeof _useEnvironment>> = Symbol('environment')

export const useEnvironment = (root = false) => {
  if (!root) {
    const provided = inject(environmentKey, null)
    if (provided) return provided
  }
  const created = _useEnvironment()
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
