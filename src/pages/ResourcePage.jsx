import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { ConfirmDialog, Drawer, Modal } from '../components/Modal'
import { Field, StatusBadge, renderMarkdown } from '../components/FormFields'
import { useToast } from '../components/Toast'
import { RESOURCES } from '../config/resources'
import api, { errorMessage, mediaUrl } from '../lib/api'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'published', label: '🟢 Published' },
  { key: 'draft', label: '🟡 Drafts' },
]

function emptyItem(config) {
  const item = {}
  config.fields.forEach((f) => {
    if (f.type === 'boolean') item[f.name] = false
    else if (f.type === 'range') item[f.name] = 70
    else if (f.type === 'select') item[f.name] = f.options[0]
    else if (f.type === 'tags') item[f.name] = []
    else item[f.name] = ''
  })
  item.status = 'draft'
  return item
}

/** How the item will look on the portfolio (Save as draft → Preview → Publish). */
function Preview({ config, item }) {
  const img = config.imageField && item[config.imageField]
  const body = item.content || item.description || ''
  return (
    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-orange-50">
      {img && !config.round && <img src={mediaUrl(img)} alt="" className="aspect-[16/7] w-full object-cover" />}
      <div className="p-6">
        <div className="flex items-center gap-4">
          {img && config.round && <img src={mediaUrl(img)} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-fuchsia-200" />}
          {config.emojiField && item[config.emojiField] && (
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${item.color || '#8b5cf6'}22` }}>{item[config.emojiField]}</span>
          )}
          <div>
            <h2 className="text-2xl font-bold gradient-text">{item[config.titleField] || 'Untitled'}</h2>
            <p className="text-slate-500">{config.subtitleField !== 'content' && config.subtitleField !== 'description' && item[config.subtitleField]}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {config.badges(item).map((b) => <span key={b} className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700">{b}</span>)}
          {(item.tech_stack || item.tags || []).map?.((t) => <span key={t} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">{t}</span>)}
        </div>
        {item.proficiency != null && config.titleField === 'name' && item.category !== undefined && (
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${item.proficiency}%`, background: item.color || '#8b5cf6' }} />
          </div>
        )}
        {body && <div className="prose-preview mt-4 text-slate-700" dangerouslySetInnerHTML={renderMarkdown(body)} />}
      </div>
    </div>
  )
}

export default function ResourcePage() {
  const { resource } = useParams()
  const config = RESOURCES[resource]
  const toast = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)   // item being edited (or new)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    if (search) params.set('search', search)
    const { data } = await api.get(`/${resource}?${params}`)
    setItems(data.data)
    setLoading(false)
  }, [resource, filter, search])

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])
  useEffect(() => { setFilter(''); setSearch(''); setEditing(null) }, [resource])

  if (!config) return <p>Unknown content type.</p>

  const save = async (status) => {
    setSaving(true)
    setErrors({})
    const payload = { ...editing, status }
    delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.read_time
    try {
      const { data } = editing.id
        ? await api.put(`/${resource}/${editing.id}`, payload)
        : await api.post(`/${resource}`, payload)
      toast(status === 'published' ? `🎉 ${config.singular} published!` : `${config.singular} saved as draft`)
      setEditing(data.data)
      load()
      return data.data
    } catch (err) {
      setErrors(err.response?.data?.fields || {})
      toast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (item) => {
    const status = item.status === 'published' ? 'draft' : 'published'
    await api.patch(`/${resource}/${item.id}/status`, { status })
    toast(status === 'published' ? 'Published 🎉' : 'Moved to drafts')
    load()
  }

  const remove = async () => {
    try {
      await api.delete(`/${resource}/${toDelete.id}`)
      toast(`${config.singular} deleted`)
      setToDelete(null)
      load()
    } catch (err) { toast(errorMessage(err), 'error') }
  }

  const move = async (index, dir) => {
    const next = [...items]
    const [it] = next.splice(index, 1)
    next.splice(index + dir, 0, it)
    setItems(next)
    await api.post(`/${resource}/reorder`, { ids: next.map((i) => i.id) })
    toast('Order saved')
  }
  const canReorder = config.fields.some((f) => f.name === 'display_order') && !filter && !search

  return (
    <div className="animate-fade-up">
      <PageHeader icon={config.icon} title={config.label} color={config.color}
        subtitle={`Create, edit, publish and organise your ${config.label.toLowerCase()}`}>
        <button className="btn-primary" onClick={() => { setErrors({}); setEditing(emptyItem(config)) }}>＋ New {config.singular.toLowerCase()}</button>
      </PageHeader>

      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${filter === f.key ? 'bg-white text-violet-700 shadow' : 'text-slate-500'}`}>{f.label}</button>
          ))}
        </div>
        <input className="input max-w-xs !py-2" placeholder={`🔍 Search ${config.label.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="ml-auto text-sm text-slate-500">{items.length} item{items.length !== 1 && 's'}</span>
      </div>

      {loading ? (
        <div className="grid h-40 place-items-center text-3xl animate-bounce">{config.icon}</div>
      ) : items.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <span className="text-5xl">{config.icon}</span>
          <p className="font-bold">No {config.label.toLowerCase()} yet</p>
          <button className="btn-primary" onClick={() => setEditing(emptyItem(config))}>Create the first one</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const img = config.imageField && item[config.imageField]
            return (
              <div key={item.id} className="card group flex flex-wrap items-center gap-4 p-3 pr-4 transition hover:shadow-lg sm:flex-nowrap">
                {canReorder && (
                  <div className="flex flex-col">
                    <button disabled={index === 0} onClick={() => move(index, -1)} className="px-1 text-slate-400 hover:text-violet-600 disabled:opacity-20">▲</button>
                    <button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="px-1 text-slate-400 hover:text-violet-600 disabled:opacity-20">▼</button>
                  </div>
                )}
                <div className={`grid h-16 w-24 shrink-0 place-items-center overflow-hidden bg-gradient-to-br ${config.color} text-2xl ${config.round ? '!w-16 rounded-full' : 'rounded-xl'}`}>
                  {img ? <img src={mediaUrl(img)} alt="" className="h-full w-full object-cover" />
                    : <span>{(config.emojiField && item[config.emojiField]) || config.icon}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{item[config.titleField]}</p>
                  <p className="truncate text-sm text-slate-500">{item[config.subtitleField]}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {config.badges(item).map((b) => <span key={b} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-600">{b}</span>)}
                  </div>
                </div>
                <StatusBadge status={item.status} onClick={() => toggleStatus(item)} />
                <div className="flex gap-1">
                  <button className="btn-ghost !px-3" title="Preview" onClick={() => setPreview(item)}>👀</button>
                  <button className="btn-soft !px-3" onClick={() => { setErrors({}); setEditing(item) }}>✏️ Edit</button>
                  <button className="btn-danger !px-3" title="Delete" onClick={() => setToDelete(item)}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)}
        title={`${config.icon} ${editing?.id ? 'Edit' : 'New'} ${config.singular.toLowerCase()}`}
        footer={editing && (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={editing.status} />
            <div className="ml-auto flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => setPreview(editing)}>👀 Preview</button>
              <button className="btn-soft" disabled={saving} onClick={() => save('draft')}>💾 Save as draft</button>
              <button className="btn-primary" disabled={saving} onClick={() => save('published')}>{saving ? 'Saving…' : '🚀 Publish'}</button>
            </div>
          </div>
        )}>
        {editing && (
          <div className="grid gap-5 sm:grid-cols-2">
            {config.fields.filter((f) => f.type !== 'hidden').map((f) => (
              <Field key={f.name} field={f} value={editing[f.name]} error={errors[f.name]}
                onChange={(v) => setEditing((e) => ({ ...e, [f.name]: v }))} />
            ))}
          </div>
        )}
      </Drawer>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="👀 Preview — how it appears on your portfolio" wide>
        {preview && <Preview config={config} item={preview} />}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={remove}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message={`"${toDelete?.[config.titleField]}" will be permanently deleted. This cannot be undone.`} />
    </div>
  )
}
