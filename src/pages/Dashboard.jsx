import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { StatusBadge } from '../components/FormFields'
import { RESOURCES } from '../config/resources'
import api from '../lib/api'

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/dashboard').then(({ data }) => setData(data)) }, [])

  if (!data) return <div className="grid h-64 place-items-center text-4xl animate-bounce">🎨</div>
  const { counts } = data
  const totalContent = Object.keys(RESOURCES).reduce((s, k) => s + counts[k].total, 0)
  const totalDrafts = Object.keys(RESOURCES).reduce((s, k) => s + counts[k].draft, 0)

  const hero = [
    { label: 'Content items', value: totalContent, icon: '📦', color: 'from-violet-500 to-fuchsia-500' },
    { label: 'Drafts waiting', value: totalDrafts, icon: '📝', color: 'from-amber-400 to-orange-500' },
    { label: 'Unread messages', value: counts.messages.unread, icon: '📬', color: 'from-pink-500 to-rose-500' },
    { label: 'Media files', value: counts.media.total, icon: '🖼️', color: 'from-cyan-400 to-blue-500' },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader icon="📊" title="Dashboard" subtitle="Everything happening in your portfolio at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hero.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 80}ms` }}
            className={`animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.color} p-6 text-white shadow-xl`}>
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15" />
            <div className="text-3xl">{s.icon}</div>
            <p className="mt-3 font-display text-4xl font-bold">{s.value}</p>
            <p className="text-sm font-semibold text-white/85">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold">Content types</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(RESOURCES).map(([key, r]) => {
          const c = counts[key]
          const pct = c.total ? Math.round((c.published / c.total) * 100) : 0
          return (
            <Link key={key} to={`/content/${key}`} className="card group p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${r.color} text-xl transition group-hover:rotate-12`}>{r.icon}</span>
                <div>
                  <p className="font-bold">{r.label}</p>
                  <p className="text-xs text-slate-500">{c.published} published · {c.draft} draft</p>
                </div>
                <span className="ml-auto font-display text-2xl font-bold text-slate-700">{c.total}</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full bg-gradient-to-r ${r.color}`} style={{ width: `${pct}%` }} />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">📬 Latest messages</h2>
            <Link to="/messages" className="text-sm font-bold text-fuchsia-600">View all →</Link>
          </div>
          {data.recent_messages.length === 0 && <p className="text-sm text-slate-500">No messages yet. They'll appear here when someone uses your contact form.</p>}
          <ul className="space-y-3">
            {data.recent_messages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-xl p-2 hover:bg-violet-50">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-orange-400 font-bold text-white">{m.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{m.name} {!m.is_read && <span className="ml-1 rounded-full bg-fuchsia-100 px-2 text-[10px] text-fuchsia-600">NEW</span>}</p>
                  <p className="truncate text-sm text-slate-500">{m.subject || m.message}</p>
                </div>
                <span className="text-xs text-slate-400">{timeAgo(m.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold">🕒 Recently updated</h2>
          <ul className="space-y-3">
            {data.recent_content.map((c) => (
              <li key={`${c.type}-${c.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-violet-50">
                <span className="text-xl">{RESOURCES[c.type].icon}</span>
                <Link to={`/content/${c.type}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-fuchsia-600">{c.title}</Link>
                <StatusBadge status={c.status} />
                <span className="w-16 text-right text-xs text-slate-400">{timeAgo(c.updated_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
