import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { Field } from '../components/FormFields'
import { useToast } from '../components/Toast'
import { ABOUT_FIELDS } from '../config/resources'
import api, { errorMessage, mediaUrl } from '../lib/api'

export default function AboutPage() {
  const [about, setAbout] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { api.get('/about').then(({ data }) => setAbout(data.data)) }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = Object.fromEntries(ABOUT_FIELDS.map((f) => [f.name, about[f.name]]))
    try {
      const { data } = await api.put('/about', payload)
      setAbout(data.data)
      toast('Profile updated 🎉')
    } catch (err) {
      setErrors(err.response?.data?.fields || {})
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!about) return <div className="grid h-64 place-items-center text-4xl animate-bounce">🙋</div>

  return (
    <form onSubmit={save} className="animate-fade-up">
      <PageHeader icon="🙋" title="About / Profile" subtitle="Your name, bio, photo and contact details shown across the portfolio" color="from-fuchsia-500 to-orange-400">
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : '💾 Save changes'}</button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            {ABOUT_FIELDS.map((f) => (
              <Field key={f.name} field={f} value={about[f.name]} error={errors[f.name]}
                onChange={(v) => setAbout((a) => ({ ...a, [f.name]: v }))} />
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-1 shadow-2xl">
          <div className="rounded-[1.4rem] bg-white p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live preview</p>
            <div className="mx-auto mt-4 h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-violet-400 to-pink-400 p-1">
              {about.profile_image
                ? <img src={mediaUrl(about.profile_image)} alt="" className="h-full w-full rounded-full object-cover" />
                : <div className="grid h-full w-full place-items-center rounded-full bg-white text-4xl">🙂</div>}
            </div>
            <h3 className="mt-4 text-2xl font-bold">{about.name}</h3>
            <p className="gradient-text font-bold">{about.title}</p>
            <p className="mt-3 text-sm text-slate-500">{about.tagline}</p>
            {about.available_for_work && (
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Available for work
              </span>
            )}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[['years_experience', 'Years', 'text-violet-600'], ['projects_completed', 'Projects', 'text-fuchsia-600'], ['happy_clients', 'Clients', 'text-orange-500']].map(([k, l, c]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-2">
                  <p className={`font-display text-2xl font-bold ${c}`}>{about[k] || 0}+</p>
                  <p className="text-[11px] font-semibold text-slate-500">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">📍 {about.location} · ✉️ {about.email}</p>
          </div>
        </div>
      </div>
    </form>
  )
}
