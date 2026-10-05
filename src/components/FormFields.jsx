import { marked } from 'marked'
import { useState } from 'react'
import { FileField, ImageField } from './MediaPicker'

export function renderMarkdown(md) {
  // Admin-only preview. The public site renders markdown with react-markdown (no raw HTML).
  return { __html: marked.parse(md || '', { breaks: true }) }
}

function MarkdownField({ value, onChange, rows = 10 }) {
  const [tab, setTab] = useState('write')
  return (
    <div className="rounded-xl border-2 border-slate-200 overflow-hidden focus-within:border-violet-500">
      <div className="flex gap-1 bg-slate-50 px-2 pt-2">
        {['write', 'preview'].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${tab === t ? 'bg-white text-violet-700' : 'text-slate-500'}`}>
            {t === 'write' ? '✏️ Write' : '👀 Preview'}
          </button>
        ))}
        <span className="ml-auto self-center text-[11px] text-slate-400 pr-2">Markdown supported: **bold**, ## heading, - list, `code`</span>
      </div>
      {tab === 'write' ? (
        <textarea className="w-full p-3.5 text-sm font-mono outline-none resize-y" rows={rows}
          value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="prose-preview min-h-[160px] p-4 text-sm" dangerouslySetInnerHTML={renderMarkdown(value)} />
      )}
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
      <span className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </span>
      {label}
    </button>
  )
}

function TagsField({ value, onChange, placeholder }) {
  const list = Array.isArray(value) ? value : (value || '').split(',').map((s) => s.trim()).filter(Boolean)
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim().replace(/,$/, '')
    if (v && !list.includes(v)) onChange([...list, v])
    setDraft('')
  }
  const colors = ['bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-700', 'bg-orange-100 text-orange-700', 'bg-cyan-100 text-cyan-700', 'bg-emerald-100 text-emerald-700']
  return (
    <div className="input flex flex-wrap gap-2 items-center">
      {list.map((t, i) => (
        <span key={t} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${colors[i % colors.length]}`}>
          {t}
          <button type="button" onClick={() => onChange(list.filter((x) => x !== t))} className="opacity-60 hover:opacity-100">×</button>
        </span>
      ))}
      <input aria-label="Add tag" className="flex-1 min-w-[120px] outline-none text-sm bg-transparent" value={draft} placeholder={list.length ? '' : placeholder}
        onChange={(e) => (e.target.value.endsWith(',') ? (setDraft(e.target.value), setTimeout(add)) : setDraft(e.target.value))}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } if (e.key === 'Backspace' && !draft && list.length) onChange(list.slice(0, -1)) }}
        onBlur={add} />
    </div>
  )
}

export function Field({ field, value, onChange, error }) {
  const common = {
    className: `input ${error ? '!border-rose-400' : ''}`,
    value: value ?? '',
    placeholder: field.placeholder,
    onChange: (e) => onChange(e.target.value),
  }
  let control
  switch (field.type) {
    case 'textarea': control = <textarea rows={field.rows || 3} {...common} />; break
    case 'markdown': control = <MarkdownField value={value} onChange={onChange} rows={field.rows} />; break
    case 'number': control = <input type="number" {...common} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />; break
    case 'url': control = <input type="url" {...common} placeholder={field.placeholder || 'https://'} />; break
    case 'email': control = <input type="email" {...common} />; break
    case 'month': control = <input type="month" {...common} />; break
    case 'date': control = <input type="date" {...common} />; break
    case 'boolean': control = <Toggle value={!!value} onChange={onChange} label={field.label} />; break
    case 'image': control = <ImageField value={value} onChange={onChange} />; break
    case 'file': control = <FileField value={value} onChange={onChange} />; break
    case 'tags': control = <TagsField value={value} onChange={onChange} placeholder={field.placeholder} />; break
    case 'select':
      control = (
        <select {...common} onChange={(e) => onChange(isNaN(e.target.value) ? e.target.value : Number(e.target.value))}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ); break
    case 'color':
      control = (
        <div className="flex items-center gap-2">
          <input type="color" value={value || '#8b5cf6'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border-2 border-slate-200" />
          <input {...common} placeholder="#8b5cf6" />
        </div>
      ); break
    case 'range':
      control = (
        <div className="flex items-center gap-4">
          <input type="range" min={field.min} max={field.max} value={value ?? 50} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-fuchsia-500" />
          <span className="w-14 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 py-1 text-center text-sm font-bold text-white">{value ?? 50}%</span>
        </div>
      ); break
    default: control = <input type="text" {...common} />
  }
  return (
    <div className={field.full ? 'sm:col-span-2' : ''}>
      {field.type !== 'boolean' && (
        <label className="label">{field.label}{field.required && <span className="text-fuchsia-500"> *</span>}</label>
      )}
      {control}
      {error ? <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        : field.help && <p className="mt-1 text-xs text-slate-400">{field.help}</p>}
    </div>
  )
}

export function StatusBadge({ status, onClick }) {
  const published = status === 'published'
  return (
    <button type="button" onClick={onClick} title={onClick ? `Click to ${published ? 'unpublish' : 'publish'}` : ''}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition hover:scale-105 ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {published ? 'Published' : 'Draft'}
    </button>
  )
}
