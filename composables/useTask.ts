import { useMessage } from 'naive-ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IUseTaskOptions<T extends (...args: any) => any> {
  toast?: boolean
  onError?: (error: Error) => void
  onSuccess?: (result: Awaited<ReturnType<T>>) => void
  onFinished?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTask = <T extends (...args: any) => any>(
  task: T,
  options: IUseTaskOptions<T> = {
    toast: true
  }
) => {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const result = ref<ReturnType<T> | null>(null)
  const message = options.toast ? useMessage() : (null as never)
  const execute = async (...args: Parameters<T>) => {
    loading.value = true
    error.value = null
    try {
      result.value = await task(...args)
      if (options.toast) {
        message.success('操作成功')
      }
      options.onSuccess?.(result.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(`${e}`)
      if (options.toast) {
        message.error('操作失败')
      }
      options.onError?.(error.value)
    } finally {
      loading.value = false
      options.onFinished?.()
    }
  }
  return { loading, error, result, execute }
}
