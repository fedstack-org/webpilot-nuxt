import OpenAI from 'openai'

export const useOpenAI = () => {
  const { $auth } = useNuxtApp()
  const openai = new OpenAI({
    apiKey: 'sk-fake',
    baseURL: new URL('/api/ai', location.origin).toString(),
    dangerouslyAllowBrowser: true,
    fetch: async (...args) => {
      const request = new Request(...args)
      const headers = new Headers(request.headers)
      const token = await $auth.getAuthToken()
      headers.set('Authorization', `Bearer ${token?.token}`)
      return fetch(new Request(request, { headers }))
    }
  })
  return { openai }
}
