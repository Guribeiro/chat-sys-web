import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/**
 * On a 401 the access token has probably expired: refresh it once (shared by every request
 * that failed at the same time) and replay the request. Registered by the auth store to
 * avoid a circular import.
 */
export function setupAuthRefresh(refresh: () => Promise<string | null>) {
  let pending: Promise<string | null> | null = null

  api.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthRoute = config?.url?.startsWith('/sessions/')

    if (error.response?.status !== 401 || !config || config._retried || isAuthRoute) {
      throw error
    }

    pending ??= refresh().finally(() => { pending = null })
    const token = await pending
    if (!token) throw error

    config._retried = true
    config.headers.set('Authorization', `bearer ${token}`)
    return api(config)
  })
}
