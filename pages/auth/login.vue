<template>
  <div>正在转向登录页面</div>
</template>

<script setup lang="ts">
const route = useRoute()
const { login } = useAuth()

onMounted(() => {
  login.execute(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
})
</script>
