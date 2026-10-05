import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Rendered into <body> so parent transforms/animations never clip them.
const portal = (node) => createPortal(node, document.body)

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return portal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto animate-fade-up`}>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur px-6 py-4 border-b border-violet-100">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-slate-100 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children, footer }) {
  if (!open) return null
  return portal(
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/20 text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/80">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmText = 'Delete', onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn bg-rose-500 text-white hover:bg-rose-600" onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  )
}
