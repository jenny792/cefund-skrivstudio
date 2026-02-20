import { useState } from 'react'
import { Upload, X, Loader2, Globe } from 'lucide-react'

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
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState(null)

  async function handleScrape() {
    if (!url) return
    setScraping(true)
    setScrapeError(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContent(data.content)
      if (!title) {
        // Föreslå titel baserat på URL
        const hostname = new URL(url).hostname.replace('www.', '')
        setTitle(hostname)
      }
    } catch (err) {
      setScrapeError(err.message)
    } finally {
      setScraping(false)
    }
  }

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
    setScrapeError(null)
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
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onBlur={() => { if (url && !content) handleScrape() }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleScrape}
                disabled={!url || scraping}
                className="flex items-center gap-2 bg-bg-subtle hover:bg-gray-200 disabled:opacity-40 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {scraping ? (
                  <><Loader2 size={14} className="animate-spin" /> Hämtar...</>
                ) : (
                  <><Globe size={14} /> Hämta text</>
                )}
              </button>
            </div>
            {scrapeError && (
              <p className="text-xs text-red-500 mt-1">{scrapeError}</p>
            )}
          </div>
        )}
        <div>
          <label className="text-sm text-text-muted block mb-1">
            Innehåll {type === 'webpage' && content && <span className="text-green-600">(hämtat från sidan)</span>}
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            placeholder={type === 'webpage'
              ? 'Klistra in URL ovan och klicka "Hämta text", eller klistra in manuellt...'
              : 'Klistra in text från transkript, dokument, presentation...'}
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
