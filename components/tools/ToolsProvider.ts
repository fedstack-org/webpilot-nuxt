import RouterProvider from './providers/RouterProvider'

export default defineComponent(() => {
  return () =>
    h('div', [
      // Tools
      h(RouterProvider, {})
    ])
})
