import { useState } from 'react'
import { Plus, Search, FileText, Globe, Mic, StickyNote } from 'lucide-react'
import SourceUpload from '../components/SourceUpload'

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

  function addSource(source) {
    setSources([source, ...sources])
    setShowUpload(false)
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
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Lägg till källa
        </button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <SourceUpload onAdd={addSource} onClose={() => setShowUpload(false)} />
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
      {filtered.length === 0 ? (
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
            return (
              <div key={source.id} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-bg-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{source.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{TYPE_LABELS[source.type]}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{source.content}</p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {new Date(source.created_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
