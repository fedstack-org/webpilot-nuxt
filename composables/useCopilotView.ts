export interface ICopilotViewOptions {
  advanced?: boolean
  userName?: string
  emphasizeFinalMessage?: boolean
}

export const copilotViewKey: InjectionKey<ICopilotViewOptions> = Symbol('copilotView')

export const provideCopilotView = (options: ICopilotViewOptions) => {
  provide(copilotViewKey, options)
}

export const useCopilotView = () => {
  const provided = inject(copilotViewKey, null)
  if (!provided) {
    throw new Error('useCopilotView must be used within a CopilotViewProvider')
  }
  return provided
}
