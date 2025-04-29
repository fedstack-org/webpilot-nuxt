import RouterProvider from './RouterProvider'

export default defineComponent(() => {
  return () =>
    h('div', [
      // Tools
      h(RouterProvider, {})
    ])
})
