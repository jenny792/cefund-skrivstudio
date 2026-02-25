import { useState, useEffect } from 'react'
import { Plus, Search, FileText, Globe, Mic, StickyNote, Pencil, Check, X, Trash2 } from 'lucide-react'
import SourceUpload from '../components/SourceUpload'
import { getSources, addSource as saveSource, updateSource, deleteSource } from '../lib/sources'

const TYPE_ICONS = {
  transcript_event: Mic,
  transcript_meeting: Mic,
  presentation: FileText,
  document: FileText,
  webpage: Globe,
  note: StickyNote,
}

const TYPE_LABELS = {
  transcript_event: 'Transkript (event)',
  transcript_meeting: 'Transkript (möte)',
  presentation: 'Presentation',
  document: 'Dokument',
  webpage: 'Webbsida',
  note: 'Anteckning',
}

export default function Sources() {
  const [sources, setSources] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editFields, setEditFields] = useState({})

  useEffect(() => {
    getSources().then(data => {
      setSources(data)
      setLoading(false)
    })
  }, [])

  async function handleAddSource(source) {
    const updated = await saveSource(source)
    setSources(updated)
    setShowUpload(false)
  }

  function startEdit(source) {
    setEditingId(source.id)
    setEditFields({
      title: source.title,
      type: source.type,
      content: source.content,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditFields({})
  }

  async function handleSaveEdit() {
    const updated = await updateSource(editingId, editFields)
    setSources(updated)
    setEditingId(null)
    setEditFields({})
  }

  async function handleDelete(id) {
    const updated = await deleteSource(id)
    setSources(updated)
    setEditingId(null)
  }

  const filtered = sources.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(filter.toLowerCase())
    const matchesType = typeFilter === 'all' || s.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1">Källbibliotek</h1>
          <p className="text-text-muted text-sm">{sources.length} källor</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
        >
          <Plus size={16} />
          Lägg till källa
        </button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <SourceUpload onAdd={handleAddSource} onClose={() => setShowUpload(false)} />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Sök källor..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-white"
        >
          <option value="all">Alla typer</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">Laddar källor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">
            {sources.length === 0
              ? 'Inga källor ännu. Lägg till din första källa!'
              : 'Inga källor matchar din sökning.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(source => {
            const Icon = TYPE_ICONS[source.type] || FileText
            const isEditing = editingId === source.id

            if (isEditing) {
              return (
                <div key={source.id} className="bg-white border-2 border-accent rounded-xl p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Titel</label>
                      <input
                        type="text"
                        value={editFields.title}
                        onChange={e => setEditFields({ ...editFields, title: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Typ</label>
                      <select
                        value={editFields.type}
                        onChange={e => setEditFields({ ...editFields, type: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-white"
                      >
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Innehåll</label>
                      <textarea
                        value={editFields.content}
                        onChange={e => setEditFields({ ...editFields, content: e.target.value })}
                        rows={6}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        <Trash2 size={14} />
                        Ta bort
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 text-text-muted hover:text-text px-3 py-2 text-sm transition-colors"
                        >
                          <X size={14} />
                          Avbryt
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Check size={14} />
                          Spara
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={source.id} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-bg-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{source.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{TYPE_LABELS[source.type]}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{source.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-muted">
                    {new Date(source.created_at).toLocaleDateString('sv-SE')}
                  </span>
                  <button
                    onClick={() => startEdit(source)}
                    className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
