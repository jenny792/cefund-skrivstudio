import { useState } from 'react'
import { Upload, X } from 'lucide-react'

const SOURCE_TYPES = [
  { id: 'transcript_event', label: 'Transkript (event)' },
  { id: 'transcript_meeting', label: 'Transkript (möte)' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'document', label: 'Dokument' },
  { id: 'webpage', label: 'Webbsida/länk' },
  { id: 'note', label: 'Fritext/anteckning' },
]

export default function SourceUpload({ onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('note')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      title,
      type,
      content,
      url: type === 'webpage' ? url : null,
      created_at: new Date().toISOString(),
    })
    setTitle('')
    setContent('')
    setUrl('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold">Lägg till källa</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-bg-subtle rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-text-muted block mb-1">Titel</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            placeholder="T.ex. Eventpresentation Q1 2026"
          />
        </div>
        <div>
          <label className="text-sm text-text-muted block mb-1">Typ</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-white"
          >
            {SOURCE_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        {type === 'webpage' && (
          <div>
            <label className="text-sm text-text-muted block mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="https://..."
            />
          </div>
        )}
        <div>
          <label className="text-sm text-text-muted block mb-1">Innehåll</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            placeholder="Klistra in text från transkript, dokument, presentation..."
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Upload size={16} />
          Lägg till källa
        </button>
      </form>
    </div>
  )
}
