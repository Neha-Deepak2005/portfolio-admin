import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { ConfirmDialog } from '../components/Modal'
import { useToast } from '../components/Toast'
import api, { errorMessage, mediaUrl, uploadFile } from '../lib/api'

const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export default function MediaPage() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const inputRef = useRef()
  const toast = useToast()

  const load = () => api.get('/media').then(({ data }) => setItems(data.data))
  useEffect(() => { load() }, [])

  const upload = async (files) => {
    setBusy(true)
    let ok = 0
    for (const file of files) {
      try {
        await uploadFile(file, file.type === 'application/pdf' ? 'file' : 'image')
        ok++
      } catch (err) { toast(`${file.name}: ${errorMessage(err)}`, 'error') }
    }
    if (ok) toast(`${ok} file${ok > 1 ? 's' : ''} uploaded 🎉`)
    setBusy(false)
    load()
  }

  const copy = (m) => {
    navigator.clipboard?.writeText(m.url)
    toast('URL copied to clipboard', 'info')
  }

  const saveAlt = async (m, alt_text) => {
    if (alt_text === (m.alt_text || '')) return
    await api.put(`/media/${m.id}`, { alt_text })
    toast('Alt text saved')
  }

  const remove = async () => {
    await api.delete(`/media/${toDelete.id}`)
    toast('File deleted')
    setToDelete(null)
    load()
  }

  return (
    <div className="animate-fade-up">
      <PageHeader icon="🖼️" title="Media Library" subtitle="Upload and manage images & files used across your portfolio" color="from-cyan-400 to-blue-500">
        <button className="btn-primary" disabled={busy} onClick={() => inputRef.current.click()}>{busy ? 'Uploading…' : '⬆️ Upload files'}</button>
      </PageHeader>
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" hidden onChange={(e) => upload([...e.target.files])} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload([...e.dataTransfer.files]) }}
        onClick={() => inputRef.current.click()}
        className={`mb-6 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition ${drag ? 'border-fuchsia-500 bg-fuchsia-50 scale-[1.01]' : 'border-violet-200 bg-white hover:bg-violet-50/50'}`}>
        <p className="text-4xl">☁️</p>
        <p className="mt-2 font-bold">Drag & drop files here, or click to browse</p>
        <p className="text-sm text-slate-500">JPG, PNG, GIF, WEBP or PDF · max 5 MB · large images are resized automatically</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((m) => (
          <div key={m.id} className="card group overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-pink-100">
              {m.mime_type?.startsWith('image')
                ? <img src={mediaUrl(m.url)} alt={m.alt_text || ''} className="h-full w-full object-cover" loading="lazy" />
                : <div className="grid h-full place-items-center text-5xl">📄</div>}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/50 opacity-0 transition group-hover:opacity-100">
                <button className="btn bg-white text-slate-700" onClick={() => copy(m)}>📋 Copy URL</button>
                <a className="btn bg-white text-slate-700" href={mediaUrl(m.url)} target="_blank" rel="noreferrer">↗</a>
                <button className="btn bg-rose-500 text-white" onClick={() => setToDelete(m)}>🗑️</button>
              </div>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-bold" title={m.original_name}>{m.original_name}</p>
              <p className="text-xs text-slate-400">{fmtSize(m.size)}{m.width && ` · ${m.width}×${m.height}`}</p>
              <input className="input mt-2 !py-1.5 text-xs" placeholder="Alt text (for SEO & accessibility)"
                defaultValue={m.alt_text || ''} onBlur={(e) => saveAlt(m, e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={remove} title="Delete file?"
        message="If this file is used somewhere on your portfolio, that image will stop showing." />
    </div>
  )
}
