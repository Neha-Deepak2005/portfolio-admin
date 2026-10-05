import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { tokenStore } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.user)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    tokenStore.save(data)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('cms:logout', onLogout)
    // validate stored session on load
    if (tokenStore.access) api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {})
    return () => window.removeEventListener('cms:logout', onLogout)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
