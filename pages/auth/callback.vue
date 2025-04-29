<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute()
const { loginCallback } = useAuth()

onMounted(() => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''
  const state = typeof route.query.state === 'string' ? route.query.state : ''
  loginCallback.execute(code, state)
})
</script>
