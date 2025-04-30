<!-- eslint-disable vue/no-v-html -->
<template>
  <article class="markdown-body" v-html="data" />
</template>

<script setup lang="ts">
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
