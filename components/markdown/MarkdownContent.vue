<!-- eslint-disable vue/no-v-html -->
<template>
  <article class="markdown-body" v-html="data" />
</template>

<script setup lang="ts">
import 'github-markdown-css/github-markdown-light.css'
import 'katex/dist/katex.min.css'

const props = defineProps<{
  content: string
}>()

const id = useId() || 'markdown'
const { data, refresh } = useAsyncData(id, () => renderMarkdown(props.content), {
  default: () => ''
})

watch(
  () => props.content,
  () => refresh()
)
</script>

<style lang="css">
.katex-block {
  overflow: auto;
}
</style>
