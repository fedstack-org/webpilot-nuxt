import type { VNodeChild } from 'vue'

export default defineComponent(
  <T>(props: { renderer: (props: T) => VNodeChild; props: T }) => {
    return () => props.renderer(props.props)
  },
  { props: ['renderer', 'props'] }
)
