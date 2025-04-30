<!-- eslint-disable vue/no-v-html -->
<template>
  <article class="markdown-body" v-html="data" />
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
}>()

const content = computed(() => props.content)

const id = useId() || 'markdown'
const { data } = useAsyncData(id, () => renderMarkdown(content.value), {
  default: () => '',
  watch: [content]
})
</script>
