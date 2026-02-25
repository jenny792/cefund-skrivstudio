import { useState, useEffect } from 'react'
import { Plus, Trash2, Lightbulb, Loader2, X } from 'lucide-react'
import { getIdeas, createIdea, deleteIdea } from '../lib/ideas'

export default function IdeaBank() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Formulärfält
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    try {
      const data = await getIdeas()
      setIdeas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    try {
      const idea = await createIdea({
        title: title.trim(),
        description: description.trim() || null,
        tags,
      })
      setIdeas(prev => [idea, ...prev])
      setTitle('')
      setDescription('')
      setTags([])
      setTagInput('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteIdea(id)
      setIdeas(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleAddTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (!tags.includes(tag)) {
        setTags(prev => [...prev, tag])
      }
      setTagInput('')
    }
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">Idébank</h1>
      <p className="text-text-muted text-sm mb-8">
        Samla idéer för framtida innehåll
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Formulär */}
      <form onSubmit={handleSubmit} className="bg-bg-subtle rounded-xl p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Titel *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Vad handlar idén om?"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text mb-1 block">Beskrivning</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Beskriv idén mer i detalj..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text mb-1 block">Taggar</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Skriv en tagg och tryck Enter"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Sparar...</>
            ) : (
              <><Plus size={16} /> Spara idé</>
            )}
          </button>
        </div>
      </form>

      {/* Idélista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-bg-subtle rounded-xl p-12 text-center">
          <Lightbulb size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">Inga idéer ännu. Lägg till din första!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col hover:shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-sm">{idea.title}</h3>
                <button
                  onClick={() => handleDelete(idea.id)}
                  className="p-1 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {idea.description && (
                <p className="text-sm text-text-muted leading-relaxed mb-3 flex-1">{idea.description}</p>
              )}
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {idea.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-text-muted mt-3">
                {new Date(idea.created_at).toLocaleDateString('sv-SE')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
