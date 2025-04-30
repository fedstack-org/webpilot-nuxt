<!-- eslint-disable vue/no-v-html -->
<template>
  <span v-html="data" />
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
}>()

const content = computed(() => props.content)

const id = useId() || 'markdown-text'
const { data } = useAsyncData(id, () => renderMarkdownText(content.value), {
  default: () => '',
  watch: [content]
})
</script>
