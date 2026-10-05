import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { ConfirmDialog } from '../components/Modal'
import { useToast } from '../components/Toast'
import api from '../lib/api'

export default function MessagesPage() {
  const [items, setItems] = useState([])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const toast = useToast()

  const load = () => {
    const p = new URLSearchParams()
    if (unreadOnly) p.set('unread', '1')
    if (search) p.set('search', search)
    return api.get(`/messages?${p}`).then(({ data }) => setItems(data.data))
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [unreadOnly, search]) // eslint-disable-line

  const open = async (m) => {
    setSelected(m)
    if (!m.is_read) {
      await api.patch(`/messages/${m.id}`, { is_read: true })
      setItems((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)))
    }
  }
  const markUnread = async (m) => {
    await api.patch(`/messages/${m.id}`, { is_read: false })
    toast('Marked as unread', 'info')
    setSelected(null)
    load()
  }
  const remove = async () => {
    await api.delete(`/messages/${toDelete.id}`)
    toast('Message deleted')
    setToDelete(null)
    setSelected(null)
    load()
  }

  return (
    <div className="animate-fade-up">
      <PageHeader icon="📬" title="Messages" subtitle="Everything sent through your portfolio's contact form" color="from-pink-500 to-rose-500" />
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[[false, 'All'], [true, '✨ Unread']].map(([v, l]) => (
            <button key={l} onClick={() => setUnreadOnly(v)} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${unreadOnly === v ? 'bg-white text-violet-700 shadow' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>
        <input className="input max-w-xs !py-2" placeholder="🔍 Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {items.length === 0 && <div className="card p-8 text-center text-slate-500">📭 No messages here yet</div>}
          {items.map((m) => (
            <button key={m.id} onClick={() => open(m)}
              className={`card block w-full p-4 text-left transition hover:shadow-lg ${selected?.id === m.id ? 'ring-2 ring-fuchsia-400' : ''} ${!m.is_read ? 'border-l-4 !border-l-fuchsia-500' : ''}`}>
              <div className="flex items-center gap-2">
                <p className={`flex-1 truncate ${m.is_read ? 'font-semibold' : 'font-extrabold'}`}>{m.name}</p>
                <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <p className="truncate text-sm font-semibold text-violet-700">{m.subject || '(no subject)'}</p>
              <p className="truncate text-sm text-slate-500">{m.message}</p>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 p-6 text-white">
                <p className="text-sm opacity-80">{new Date(selected.created_at).toLocaleString()}</p>
                <h2 className="mt-1 text-2xl font-bold">{selected.subject || '(no subject)'}</h2>
                <p className="mt-2">From <b>{selected.name}</b> · {selected.email}</p>
              </div>
              <p className="whitespace-pre-wrap p-6 leading-relaxed text-slate-700">{selected.message}</p>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
                <a className="btn-primary" href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your message')}`}>↩️ Reply by email</a>
                <button className="btn-soft" onClick={() => markUnread(selected)}>Mark unread</button>
                <button className="btn-danger ml-auto" onClick={() => setToDelete(selected)}>🗑️ Delete</button>
                <span className="w-full text-xs text-slate-400">{selected.email_sent ? '✅ Email notification was sent' : 'ℹ️ Email notification not sent (SMTP not configured) — message saved in database'}</span>
              </div>
            </div>
          ) : (
            <div className="card grid h-64 place-items-center text-center text-slate-400"><div><p className="text-5xl">💌</p><p className="mt-2">Select a message to read it</p></div></div>
          )}
        </div>
      </div>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={remove} title="Delete message?" message="This message will be permanently deleted." />
    </div>
  )
}
