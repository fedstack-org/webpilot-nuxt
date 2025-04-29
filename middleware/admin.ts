export default defineNuxtRouteMiddleware(() => {
  const { $api } = useNuxtApp()
  if (!$api.isAdmin.value) {
    return navigateTo('/')
  }
})
