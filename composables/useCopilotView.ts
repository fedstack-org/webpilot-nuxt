export interface ICopilotViewOptions {
  userName?: string
  input?: {
    /** @default true */
    toolbar?:
      | false
      | {
          /** @default true */
          tools?: boolean
          /** @default true */
          instructions?: boolean
        }
    /** @default false */
    sendButton?: boolean
  }
  messages?: {
    /** @default false */
    emphasizeFinalMessage?: boolean
    assistant?: {
      /** @default true */
      title?: boolean
    }
  }
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
