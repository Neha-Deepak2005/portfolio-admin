import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RESOURCES } from '../config/resources'
import api, { API_URL } from '../lib/api'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3000'

function NavItem({ to, icon, label, badge, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-white text-violet-700 shadow-lg shadow-violet-900/20' : 'text-white/85 hover:bg-white/15 hover:text-white'}`}>
      <span className="text-lg transition group-hover:scale-125">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="rounded-full bg-orange-400 px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    api.get('/messages?unread=1').then(({ data }) => setUnread(data.unread)).catch(() => {})
  }, [location.pathname])

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-gradient-to-b from-violet-700 via-fuchsia-600 to-orange-500 p-4 text-white">
      <div className="mb-4 flex items-center gap-3 px-2 pt-1">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur">🎨</div>
        <div>
          <p className="font-display text-lg font-bold leading-tight">Portfolio CMS</p>
          <p className="text-xs text-white/70">Content studio</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <NavItem to="/" end icon="📊" label="Dashboard" />
        <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-widest text-white/60">Content</p>
        <NavItem to="/about" icon="🙋" label="About / Profile" />
        {Object.entries(RESOURCES).map(([key, r]) => (
          <NavItem key={key} to={`/content/${key}`} icon={r.icon} label={r.label} />
        ))}
        <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-widest text-white/60">Manage</p>
        <NavItem to="/media" icon="🖼️" label="Media Library" />
        <NavItem to="/messages" icon="📬" label="Messages" badge={unread} />
        <NavItem to="/settings" icon="⚙️" label="Settings" />
      </nav>
      <div className="mt-4 rounded-2xl bg-white/15 p-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white font-bold text-fuchsia-600">
            {(user?.name || 'A')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-white/70">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="mt-3 w-full rounded-xl bg-white/20 py-2 text-sm font-bold hover:bg-white/30">Log out</button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 animate-fade-up">{sidebar}</div>
        </div>
      )}
      <div className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-violet-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-8">
          <button className="btn-ghost lg:hidden" onClick={() => setOpen(true)}>☰</button>
          <p className="text-sm text-slate-500">Welcome back, <b className="gradient-text">{user?.name?.split(' ')[0]}</b> 👋</p>
          <div className="ml-auto flex gap-2">
            <a href={`${API_URL}/api/docs`} target="_blank" rel="noreferrer" className="btn-ghost hidden sm:inline-flex">📚 API Docs</a>
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="btn-soft">🌐 View site</a>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  )
}

export function PageHeader({ icon, title, subtitle, color = 'from-violet-500 to-fuchsia-500', children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${color} text-2xl shadow-lg`}>{icon}</div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
