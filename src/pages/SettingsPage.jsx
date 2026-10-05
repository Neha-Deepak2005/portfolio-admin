import { useState } from 'react'
import { PageHeader } from '../components/Layout'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../lib/api'

export default function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm) return toast('New passwords do not match', 'error')
    setBusy(true)
    try {
      await api.put('/auth/password', form)
      toast('Password changed 🔐')
      setForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) { toast(errorMessage(err), 'error') } finally { setBusy(false) }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader icon="⚙️" title="Settings" subtitle="Your admin account" color="from-slate-500 to-violet-500" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-bold">👤 Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-bold">{user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-bold">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd><span className="rounded-full bg-violet-100 px-2 py-0.5 font-bold text-violet-700">{user?.role}</span></dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Last login</dt><dd className="font-bold">{user?.last_login ? new Date(user.last_login).toLocaleString() : '—'}</dd></div>
          </dl>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">🔐 Change password</h2>
          {[['current_password', 'Current password'], ['new_password', 'New password (min 8 characters)'], ['confirm', 'Confirm new password']].map(([k, l]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input className="input" type="password" required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  )
}
