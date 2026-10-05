import axios from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const ACCESS = 'cms_access_token'
const REFRESH = 'cms_refresh_token'
const USER = 'cms_user'

// ---- token storage -------------------------------------------------------
export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS) },
  get refresh() { return localStorage.getItem(REFRESH) },
  get user() { try { return JSON.parse(localStorage.getItem(USER)) } catch { return null } },
  save({ access_token, refresh_token, user }) {
    if (access_token) localStorage.setItem(ACCESS, access_token)
    if (refresh_token) localStorage.setItem(REFRESH, refresh_token)
    if (user) localStorage.setItem(USER, JSON.stringify(user))
  },
  clear() { [ACCESS, REFRESH, USER].forEach((k) => localStorage.removeItem(k)) },
}

// ---- axios instance ------------------------------------------------------
const api = axios.create({ baseURL: `${API_URL}/api` })

api.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

// When the access token expires, get a new one with the refresh token and retry once.
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && tokenStore.refresh && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true
      try {
        refreshing = refreshing || axios.post(`${API_URL}/api/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${tokenStore.refresh}` },
        })
        const { data } = await refreshing
        tokenStore.save({ access_token: data.access_token })
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        tokenStore.clear()
        window.dispatchEvent(new Event('cms:logout'))
      } finally {
        refreshing = null
      }
    }
    return Promise.reject(error)
  },
)

export default api

// ---- helpers -------------------------------------------------------------
export function errorMessage(err) {
  const data = err?.response?.data
  if (data?.fields) return Object.entries(data.fields).map(([k, v]) => `${k}: ${v}`).join(' · ')
  return data?.error || err?.message || 'Something went wrong'
}

export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${API_URL}${path}`
}

export async function uploadFile(file, kind = 'image', altText = '') {
  const form = new FormData()
  form.append('file', file)
  if (altText) form.append('alt_text', altText)
  const { data } = await api.post(`/upload/${kind}`, form)
  return data.data
}
