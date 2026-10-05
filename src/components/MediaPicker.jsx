import { useEffect, useRef, useState } from 'react'
import api, { errorMessage, mediaUrl, uploadFile } from '../lib/api'
import { Modal } from './Modal'
import { useToast } from './Toast'

/** Image field: upload a new image or pick one from the media library. */
export function ImageField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef()
  const toast = useToast()

  const onFile = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const media = await uploadFile(file, 'image')
      onChange(media.url)
      toast('Image uploaded')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-3 flex items-center gap-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
    >
      <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-200 to-pink-200 grid place-items-center">
        {value ? <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" /> : <span className="text-3xl">🖼️</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-soft" disabled={busy} onClick={() => inputRef.current.click()}>
          {busy ? 'Uploading…' : '⬆️ Upload'}
        </button>
        <button type="button" className="btn-soft" onClick={() => setOpen(true)}>📚 Library</button>
        {value && <button type="button" className="btn-danger" onClick={() => onChange('')}>Remove</button>}
        <p className="w-full text-xs text-slate-500">Drag & drop or upload · JPG, PNG, GIF, WEBP · max 5 MB</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files[0])} />
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onPick={(m) => { onChange(m.url); setOpen(false) }} />
    </div>
  )
}

/** PDF file field (resume). */
export function FileField({ value, onChange }) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef()
  const toast = useToast()
  const onFile = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const media = await uploadFile(file, 'file')
      onChange(media.url)
      toast('File uploaded')
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className="input flex-1 min-w-[200px]" value={value || ''} placeholder="/uploads/resume.pdf or https://…" onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="btn-soft" disabled={busy} onClick={() => inputRef.current.click()}>{busy ? 'Uploading…' : '📄 Upload PDF'}</button>
      {value && <a className="btn-ghost" href={mediaUrl(value)} target="_blank" rel="noreferrer">Open ↗</a>}
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => onFile(e.target.files[0])} />
    </div>
  )
}

export function MediaLibraryModal({ open, onClose, onPick }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    if (open) api.get('/media').then(({ data }) => setItems(data.data.filter((m) => m.mime_type?.startsWith('image'))))
  }, [open])
  return (
    <Modal open={open} onClose={onClose} title="📚 Choose from media library" wide>
      {items.length === 0 && <p className="text-slate-500">No images yet — upload one first.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((m) => (
          <button key={m.id} type="button" onClick={() => onPick(m)}
            className="group overflow-hidden rounded-xl border-2 border-transparent hover:border-fuchsia-400 transition">
            <img src={mediaUrl(m.url)} alt={m.alt_text || ''} className="aspect-video w-full object-cover group-hover:scale-105 transition" />
            <p className="truncate px-2 py-1 text-xs text-slate-500">{m.alt_text || m.original_name}</p>
          </button>
        ))}
      </div>
    </Modal>
  )
}
