export const decodeJWT = (token: string) => {
  return JSON.parse(atob(token.split('.')[1]))
}

export const useAuth = () => {
  const router = useRouter()
  const { $auth } = useNuxtApp()

  const login = useTask(
    async (redirectTo: string) => {
      const redirectUrl = await $auth.startLogin(redirectTo, {
        permissions: [
          `{{server}}/**`,
          `{{issuer}}/session/claim`,
          `{{issuer}}/session/silent_authorize`
        ],
        additionalParams: {}
      })
      location.href = redirectUrl
    },
    { toast: false }
  )

  const loginCallback = useTask(
    async (code: string, state: string) => {
      const redirectUrl = await $auth.finishLogin(code, state)
      await refreshNuxtData()
      await router.replace(redirectUrl)
    },
    { onError: () => router.replace('/') }
  )

  return { login, loginCallback }
}
