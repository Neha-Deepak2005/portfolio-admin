import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

const STYLES = {
  success: 'from-emerald-500 to-teal-500',
  error: 'from-rose-500 to-pink-500',
  info: 'from-violet-500 to-fuchsia-500',
}
const ICONS = { success: '✅', error: '⚠️', info: '💡' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={`animate-fade-up flex items-center gap-3 rounded-2xl bg-gradient-to-r ${STYLES[t.type]} px-5 py-3 text-sm font-semibold text-white shadow-xl max-w-sm`}>
            <span>{ICONS[t.type]}</span>{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
