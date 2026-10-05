import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-400 p-4">
      {/* animated colour blobs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-cyan-400/50 blur-3xl animate-blob" />
      <div className="absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-yellow-300/40 blur-3xl animate-blob [animation-delay:3s]" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 rounded-full bg-pink-400/50 blur-3xl animate-blob [animation-delay:6s]" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white/95 shadow-2xl backdrop-blur md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-600 to-fuchsia-600 p-10 text-white md:flex">
          <div className="text-5xl">🎨</div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">Your portfolio,<br />your content,<br /><span className="text-yellow-300">your rules.</span></h2>
            <p className="mt-4 text-white/80">Manage projects, skills, blogs and more — changes go live on your portfolio instantly.</p>
          </div>
          <div className="flex gap-2">
            {['🚀', '⚡', '✍️', '💼', '💬'].map((e) => (
              <span key={e} className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">{e}</span>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold"><span className="gradient-text">Welcome back</span> 👋</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to the Portfolio CMS admin panel</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required autoFocus value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="admin@portfolio.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-16" type={show ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-600">{show ? 'HIDE' : 'SHOW'}</button>
              </div>
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">⚠️ {error}</p>}
            <button className="btn-primary w-full py-3 text-base" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">🔒 Secured with JWT access & refresh tokens</p>
        </form>
      </div>
    </div>
  )
}
