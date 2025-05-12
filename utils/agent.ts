/* eslint-disable @typescript-eslint/no-explicit-any */
import { type } from 'arktype'
import type { OpenAI } from 'openai'
import type { VNodeChild } from 'vue'
import prompt from './prompt.md?raw'
import { noToolUsedResponse } from './responses'

export type ToolMessageState =
  | 'bad-input'
  | 'pending-approval'
  | 'pending-response'
  | 'completed'
  | 'rejected'
  | 'failed'

export interface IAgentToolParam {
  description: MaybeRef<string>
  example: MaybeRef<string>
  required?: boolean
}

export interface IAgentToolUIParamsProps<Params, _Result> {
  params: Params
}

export interface IAgentToolUIApprovalProps<Params, _Result> {
  params: Params
  state: ToolMessageState
  approve: () => void
  reject: () => void

  uiState: Record<string, any>
  'onUpdate:uiState': (state: Record<string, any>) => void
}

export interface IAgentToolUIResultProps<_Params, Result> {
  result: Result
}

export interface IAgentToolUIErrorProps<_Params, _Result> {
  error: unknown
}

export interface IAgentTool<Params = any, Result = any> {
  name: string
  description: MaybeRef<string>
  params: Record<keyof Params, IAgentToolParam>
  validator: (rawParams: Record<string, string>) => Params | string
  handler: (params: Params, message: IToolMessage) => Promise<Result>
  formatter: (result: Result) => string
  needApproval?: boolean
  metadata?: {
    provider?: string
    builtin?: boolean
    uiName?: string
    uiParams?: (props: IAgentToolUIParamsProps<Params, Result>) => VNodeChild
    uiApproval?: (props: IAgentToolUIApprovalProps<Params, Result>) => VNodeChild
    uiResult?: (props: IAgentToolUIResultProps<Params, Result>) => VNodeChild
    uiError?: (props: IAgentToolUIErrorProps<Params, Result>) => VNodeChild
  }
}

export interface IAgentInstruction {
  name: string
  instruction: MaybeRef<string>
  metadata?: {
    provider?: string
  }
}

export interface ITextMessage {
  role: 'user' | 'assistant'
  content: string
  thought?: string
  partial?: boolean
}

export interface IToolMessage {
  role: 'tool'
  use: ToolUse
  params: any
  state: ToolMessageState
  uiState: Record<string, any>
  promise?: Promise<string>
  result?: any
  formattedResult?: string
  feedback?: string
}

export type IAgentMessage = ITextMessage | IToolMessage

export interface IEnvironmentConfig {
  defaultModel?: string
  defaultRequireTool?: boolean
  defaultMaxSteps?: number
}

export interface TextContent {
  type: 'text'
  content: string
  partial: boolean
}

export interface ToolUse {
  type: 'tool_use'
  name: string
  params: Record<string, string>
  partial: boolean
}

export type AssistantMessageContent = TextContent | ToolUse

export interface ISystemPromptParams {
  tools: string
  website_instructions: string
  additional_rules: string
}

export function getSystemPrompt(params: ISystemPromptParams) {
  return prompt
    .replace(/{{tools}}/g, params.tools)
    .replace(/{{website_instructions}}/g, params.website_instructions)
}

export interface INextStepOptions {
  model?: string
  requireTool?: boolean
  maxSteps?: number
  toolFilter?: (tool: IAgentTool) => boolean
  instructionFilter?: (instruction: IAgentInstruction) => boolean
}

export interface ISummarizeOptions {
  model?: string
}

export class Environment {
  llm
  config

  private _tools
  private _instructions

  tools
  instructions

  constructor(llm: OpenAI, config: IEnvironmentConfig = {}) {
    this.llm = llm
    this.config = config

    this._tools = reactive<Record<string, IAgentTool<any, any>>>({})
    this._instructions = reactive<Record<string, IAgentInstruction>>({})
    this._addBuiltinTools()

    this.tools = computed(() => this._tools)
    this.instructions = computed(() => this._instructions)
  }

  registerTool<K extends string, Params, Result>(
    name: K,
    tool: Omit<IAgentTool<Params, Result>, 'name'> & { name?: K }
  ) {
    const oldTool = this._tools[name]
    this._tools[name] = { ...tool, name }
    return () => {
      this.unregisterTool(name)
      if (oldTool) {
        this._tools[name] = oldTool
      }
    }
  }

  unregisterTool(name: string) {
    if (name in this._tools) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._tools[name]
    }
  }

  getToolRef<Params, Result>(name: string) {
    return toRef(this._tools, name) as Ref<IAgentTool<Params, Result>>
  }

  registerInstruction<K extends string>(
    name: K,
    instruction: Omit<IAgentInstruction, 'name'> & { name?: K }
  ) {
    const oldInstruction = this._instructions[name]
    this._instructions[name] = { ...instruction, name }
    return () => {
      this.unregisterInstruction(name)
      if (oldInstruction) {
        this._instructions[name] = oldInstruction
      }
    }
  }

  unregisterInstruction(name: string) {
    if (name in this._instructions) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._instructions[name]
    }
  }

  getInstructionRef(name: string) {
    return toRef(this._instructions, name) as Ref<IAgentInstruction>
  }

  async nextStep(taskContext: ITaskContext, options?: INextStepOptions) {
    const model = options?.model ?? this.config.defaultModel
    if (!model) throw new Error('No model provided')
    const requireTool = options?.requireTool ?? this.config.defaultRequireTool
    const maxSteps = options?.maxSteps ?? this.config.defaultMaxSteps ?? 50
    for (let step = 0; step < maxSteps; step++) {
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: await this._getSystemPrompt(options) },
        ...(await this._convertToOpenAIMessages(taskContext.messages))
      ]
      console.group('Step Info')
      console.log('messages', messages)
      console.groupEnd()

      const stream = this.llm.beta.chat.completions.stream({
        model,
        messages,
        stream: true
      })
      taskContext.messages.push({
        role: 'assistant',
        content: '',
        partial: true
      })
      const curMsg = taskContext.messages[taskContext.messages.length - 1] as ITextMessage

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        if (!delta) continue
        if (delta.content) {
          curMsg.content += delta.content
        }
        if ('reasoning_content' in delta) {
          curMsg.thought ??= ''
          curMsg.thought += delta.reasoning_content
        }
      }
      const chatCompletion = await stream.finalChatCompletion()
      const finalContent = chatCompletion.choices[0].message.content ?? ''
      const contentBlocks = await this._parseAssistantMessage(finalContent)
      const textContent = contentBlocks
        .filter((block) => block.type === 'text')
        .map((block) => block.content)
        .join('\n')

      console.group('Step Result')
      console.log('textContent', textContent)
      console.log('contentBlocks', contentBlocks)
      console.groupEnd()

      curMsg.content = textContent
      curMsg.partial = false
      const toolUse = contentBlocks.find((block) => block.type === 'tool_use')
      if (!toolUse) {
        if (requireTool) {
          taskContext.messages.push({
            role: 'tool',
            use: { type: 'tool_use', name: '_no_tool', params: {}, partial: false },
            params: {},
            state: 'bad-input',
            result: '',
            formattedResult: 'No tool use block found. You must use exactly one tool',
            uiState: {}
          })
          continue
        }
        break
      }
      const tool = this._tools[toolUse.name]
      const params = tool.validator(toolUse.params)
      if (typeof params === 'string') {
        taskContext.messages.push({
          role: 'tool',
          use: toolUse,
          params,
          state: 'bad-input',
          result: params,
          formattedResult: params,
          uiState: {}
        })
        continue
      }
      taskContext.messages.push({
        role: 'tool',
        use: toolUse,
        params,
        state: this._tools[toolUse.name].needApproval ? 'pending-approval' : 'pending-response',
        uiState: {}
      })
    }
  }

  async summarize(taskContext: ITaskContext, options?: ISummarizeOptions) {
    const model = options?.model ?? this.config.defaultModel
    if (!model) throw new Error('No model provided')
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
You are a helpful assistant that summarizes the conversation between the user and the assistant.
Your task is to summarize the conversation in a concise and clear manner, highlighting the key points and any important information.

RULES:
- The summary should be in a single paragraph WITHOUT any line breaks or formatting.
- The summary should be concise and should not include any unnecessary details.
- The summary will be used as the title of the conversation, so it should be a short, catchy phrase that captures the essence of the conversation.
        `.trim()
      },
      ...(await this._convertToOpenAIMessages(taskContext.messages, 'summary'))
    ]
    if (messages.at(-1)?.role !== 'user') {
      messages.push({
        role: 'user',
        content: ''
      })
    }
    console.group('Summarize Info')
    console.log('messages', messages)
    console.groupEnd()
    const completion = await this.llm.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0
    })
    const summary = completion.choices[0].message.content ?? ''
    console.group('Summarize Result')
    console.log('summary', summary)
    console.groupEnd()
    return summary
  }

  private async _convertToOpenAIMessages(
    messages: IAgentMessage[],
    mode: 'normal' | 'summary' = 'normal'
  ): Promise<OpenAI.ChatCompletionMessageParam[]> {
    const result: OpenAI.ChatCompletionMessageParam[] = []
    for (const message of messages) {
      if (message.role === 'user') {
        result.push({ role: 'user', content: message.content })
      } else if (message.role === 'assistant') {
        result.push({ role: 'assistant', content: message.content })
      } else if (message.role === 'tool') {
        if (message.use.name === '_no_tool') {
          const content = noToolUsedResponse
          result.push({ role: 'user', content })
          continue
        }
        let content = `[Result for tool ${message.use.name}]\n`
        switch (message.state) {
          case 'completed':
            content += message.formattedResult
            if (message.feedback) {
              content += `\n\n[User also provided following feedback]\n`
              content += message.feedback
            }
            break
          case 'failed':
            content += `[Tool failed with following error]\n`
            content += message.formattedResult
            if (message.feedback) {
              content += `\n\n[User also provided following feedback]\n`
              content += message.feedback
            }
            break
          case 'rejected':
            content += `[Tool was rejected by user]\n`
            if (message.feedback) {
              content += `\n\n[User also provided following feedback]\n`
              content += message.feedback
            }
            break
          case 'bad-input':
            content += `[Your input is invalid with following errors]\n`
            content += message.formattedResult
            break
          default:
            if (mode === 'summary') {
              content += `[Tool is waiting for user response]\n`
            } else {
              throw new Error(`Invalid tool state: ${message.state}`)
            }
        }
        result.push({ role: 'user', content })
      }
    }
    return result
  }

  private async _parseAssistantMessage(assistantMessage: string) {
    const contentBlocks: AssistantMessageContent[] = []
    const toolUseNames = Object.keys(this._tools)
    const toolParamNames = Object.values(this._tools)
      .map((tool) => Object.keys(tool.params))
      .flat()
    let currentTextContent: TextContent | undefined = undefined
    let currentTextContentStartIndex = 0
    let currentToolUse: ToolUse | undefined = undefined
    let currentToolUseStartIndex = 0
    let currentParamName: string | undefined = undefined
    let currentParamValueStartIndex = 0
    let accumulator = ''

    for (let i = 0; i < assistantMessage.length; i++) {
      const char = assistantMessage[i]
      accumulator += char

      // there should not be a param without a tool use
      if (currentToolUse && currentParamName) {
        const currentParamValue = accumulator.slice(currentParamValueStartIndex)
        const paramClosingTag = `</${currentParamName}>`
        if (currentParamValue.endsWith(paramClosingTag)) {
          // end of param value
          currentToolUse.params[currentParamName] = currentParamValue
            .slice(0, -paramClosingTag.length)
            .trim()
          currentParamName = undefined
          continue
        } else {
          // partial param value is accumulating
          continue
        }
      }

      // no currentParamName

      if (currentToolUse) {
        const currentToolValue = accumulator.slice(currentToolUseStartIndex)
        const toolUseClosingTag = `</${currentToolUse.name}>`
        if (currentToolValue.endsWith(toolUseClosingTag)) {
          // end of a tool use
          currentToolUse.partial = false
          contentBlocks.push(currentToolUse)
          currentToolUse = undefined
          continue
        } else {
          const possibleParamOpeningTags = toolParamNames.map((name) => `<${name}>`)
          for (const paramOpeningTag of possibleParamOpeningTags) {
            if (accumulator.endsWith(paramOpeningTag)) {
              // start of a new parameter
              currentParamName = paramOpeningTag.slice(1, -1)
              currentParamValueStartIndex = accumulator.length
              break
            }
          }

          // partial tool value is accumulating
          continue
        }
      }

      // no currentToolUse

      let didStartToolUse = false
      const possibleToolUseOpeningTags = toolUseNames.map((name) => `<${name}>`)
      for (const toolUseOpeningTag of possibleToolUseOpeningTags) {
        if (accumulator.endsWith(toolUseOpeningTag)) {
          // start of a new tool use
          currentToolUse = {
            type: 'tool_use',
            name: toolUseOpeningTag.slice(1, -1),
            params: {},
            partial: true
          }
          currentToolUseStartIndex = accumulator.length
          // this also indicates the end of the current text content
          if (currentTextContent) {
            currentTextContent.partial = false
            // remove the partially accumulated tool use tag from the end of text (<tool)
            currentTextContent.content = currentTextContent.content
              .slice(0, -toolUseOpeningTag.slice(0, -1).length)
              .trim()
            contentBlocks.push(currentTextContent)
            currentTextContent = undefined
          }

          didStartToolUse = true
          break
        }
      }

      if (!didStartToolUse) {
        // no tool use, so it must be text either at the beginning or between tools
        if (currentTextContent === undefined) {
          currentTextContentStartIndex = i
        }
        currentTextContent = {
          type: 'text',
          content: accumulator.slice(currentTextContentStartIndex).trim(),
          partial: true
        }
      }
    }

    if (currentToolUse) {
      // stream did not complete tool call, add it as partial
      if (currentParamName) {
        // tool call has a parameter that was not completed
        currentToolUse.params[currentParamName] = accumulator
          .slice(currentParamValueStartIndex)
          .trim()
      }
      contentBlocks.push(currentToolUse)
    }

    // Note: it doesnt matter if check for currentToolUse or currentTextContent, only one of them will be defined since only one can be partial at a time
    if (currentTextContent) {
      // stream did not complete text content, add it as partial
      contentBlocks.push(currentTextContent)
    }

    return contentBlocks
  }

  private async _getSystemPrompt(options?: INextStepOptions) {
    const params: ISystemPromptParams = {
      tools: '',
      website_instructions: '',
      additional_rules: ''
    }
    const tools = Object.values(this._tools).filter(options?.toolFilter ?? (() => true))
    for (const tool of tools) {
      params.tools += `
## ${tool.name}

Description: ${unref(tool.description)}`
      if (Object.keys(tool.params).length) {
        params.tools += `\n\nParameters:\n`
        for (const [name, param] of Object.entries(tool.params)) {
          params.tools += `- ${name}: (${param.required ? 'required' : 'optional'}) ${unref(param.description)}\n`
        }
      }
      params.tools += `\nUsage Example:\n`
      params.tools += `<${tool.name}>\n`
      for (const [name, param] of Object.entries(tool.params)) {
        params.tools += `<${name}>`
        params.tools += `${unref(param.example)}`
        params.tools += `</${name}>\n`
      }
      params.tools += `</${tool.name}>\n\n`
    }
    const instructions = Object.values(this._instructions).filter(
      options?.instructionFilter ?? (() => true)
    )
    for (const instruction of instructions) {
      params.website_instructions += `
## ${instruction.name}
${unref(instruction.instruction)}
      `.trim()
      params.website_instructions += '\n\n'
    }
    if (options?.requireTool ?? this.config.defaultRequireTool) {
      params.additional_rules += `
- For EACH of your message, you MUST select one best tool to be used.
`.trim()
    }
    return getSystemPrompt(params)
  }

  private async _addBuiltinTools() {
    this.registerTool('ask_followup_question', {
      description:
        'Ask the user a question to gather additional information needed to complete the task. This tool should be used when you encounter ambiguities, need clarification, or require more details to proceed effectively. It allows for interactive problem-solving by enabling direct communication with the user. Use this tool judiciously to maintain a balance between gathering necessary information and avoiding excessive back-and-forth',

      params: {
        question: {
          required: true,
          description:
            'The question to ask the user. This should be a clear, specific question that addresses the information you need',
          example: 'Your question here'
        },
        options: {
          required: false,
          description:
            'An array of 2-5 options for the user to choose from. Each option should be a string describing a possible answer. You may not always need to provide options, but it may be helpful in many cases where it can save the user from having to type out a response manually',
          example: 'Array of options here (optional), e.g. ["Option 1", "Option 2", "Option 3"]'
        }
      },
      validator: (raw) => {
        const parsed = type({
          question: 'string',
          'options?': type('string.json.parse').to('string[]')
        })(raw)
        if (parsed instanceof type.errors) {
          return parsed.summary
        }
        return parsed
      },
      handler: () => {
        throw new Error('Must be called within WebPilot View')
      },
      formatter: () => '',
      metadata: {
        builtin: true
      }
    })
    this.registerTool('attempt_completion', {
      description:
        `After each tool use, the user will respond with the result of that tool use, i.e. if it succeeded or failed, along with any reasons for failure. Once you've received the results of tool uses and can confirm that the task is complete, use this tool to present the result of your work to the user. The user may respond with feedback if they are not satisfied with the result, which you can use to make improvements and try again.
IMPORTANT NOTE: This tool CANNOT be used until you've confirmed from the user that any previous tool uses were successful. Failure to do so will result in code corruption and system failure. Before using this tool, you must ask yourself if you've confirmed from the user that any previous tool uses were successful. If not, then DO NOT use this tool.
`.trim(),
      params: {
        result: {
          required: true,
          description:
            "The result of the task. Formulate this result in a way that is final and does not require further input from the user. Don't end your result with questions or offers for further assistance",
          example: 'Your final result description here'
        }
      },
      validator: (raw) => {
        const parsed = type({
          result: 'string'
        })(raw)
        if (parsed instanceof type.errors) {
          return parsed.summary
        }
        return parsed
      },
      handler: () => {
        throw new Error('Must be called within WebPilot View')
      },
      formatter: () => '',
      metadata: {
        builtin: true
      }
    })
  }
}

export interface ITaskContext {
  messages: IAgentMessage[]
}
