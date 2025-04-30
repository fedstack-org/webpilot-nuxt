import { type } from 'arktype'

export default defineComponent(() => {
  const router = useRouter()
  useTool({
    name: 'get_current_route',
    description: "Get the current page's route information",
    params: {},
    validator: () => ({}),
    handler: async () => {
      return router.currentRoute.value
    },
    formatter: (route) => `Current Route: \`${route.fullPath}\``,
    metadata: {
      uiName: '路由信息',
      provider: 'Vue Router',
      uiParams: () => h('div', '获取当前页面路由信息'),
      uiResult: () => h('div', '成功获取当前页面路由信息')
    }
  })

  useTool({
    name: 'navigate_to',
    description: 'Navigate to another route',
    params: {
      path: {
        description: 'The path to navigate to',
        example: '/',
        required: true
      },
      query: {
        description: 'The optional query parameters, must be valid JSON with only string values',
        example: '{"key":"value"} (optional)'
      }
    },
    needApproval: true,
    validator: (raw) => {
      const parsed = type({
        path: 'string',
        'query?': type('string.json.parse').to('Record<string,string>')
      })(raw)
      if (parsed instanceof type.errors) {
        return parsed.summary
      }
      return parsed
    },
    handler: async ({ path, query }) => {
      router.push({ path, query })
      return `Navigated to \`${path}\` with query \`${JSON.stringify(query)}\``
    },
    formatter: (result) => result,
    metadata: {
      uiName: '路由跳转',
      provider: 'Vue Router'
    }
  })

  useInstruction({
    name: 'router',
    instruction: `
用户正在使用一个SPA应用，你可以使用 \`get_current_route\` 和 \`navigate_to\` 工具来获取当前路由信息并导航到其他路由，以辅助用户完成任务
    `.trim(),
    metadata: {
      provider: 'Vue Router'
    }
  })
  return () => h('div')
})
