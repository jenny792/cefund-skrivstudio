import { useState, useEffect } from 'react'
import { Plus, Search, BookOpen, Pencil, Check, X, Trash2 } from 'lucide-react'
import { getInstructions, addInstruction, updateInstruction, deleteInstruction } from '../lib/instructions'

export default function Instructions() {
  const [instructions, setInstructions] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editFields, setEditFields] = useState({})
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    getInstructions().then(data => {
      setInstructions(data)
      setLoading(false)
    })
  }, [])

  async function handleAdd() {
    if (!newTitle.trim() || !newContent.trim()) return
    const updated = await addInstruction({ title: newTitle.trim(), content: newContent.trim() })
    setInstructions(updated)
    setNewTitle('')
    setNewContent('')
    setShowAdd(false)
  }

  function startEdit(instruction) {
    setEditingId(instruction.id)
    setEditFields({
      title: instruction.title,
      content: instruction.content,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditFields({})
  }

  async function handleSaveEdit() {
    const updated = await updateInstruction(editingId, editFields)
    setInstructions(updated)
    setEditingId(null)
    setEditFields({})
  }

  async function handleDelete(id) {
    const updated = await deleteInstruction(id)
    setInstructions(updated)
    setEditingId(null)
  }

  const filtered = instructions.filter(i =>
    i.title.toLowerCase().includes(filter.toLowerCase()) ||
    i.content.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1">Instruktioner</h1>
          <p className="text-text-muted text-sm">
            {instructions.length} instruktioner — skickas alltid med vid generering
          </p>
        </div>
        <button
          onClick={() => { console.log('CLICK', showAdd); setShowAdd(!showAdd) }}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
        >
          <Plus size={16} />
          Lägg till instruktion
        </button>
      </div>

      {/* Lägg till ny */}
      {showAdd && (
        <div className="bg-white border-2 border-accent rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Titel</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="T.ex. Tonläge och stil"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Instruktion</label>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="T.ex. Skriv alltid i du-form. Max 3 emojis per inlägg. Avsluta med en fråga."
                rows={4}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAdd(false); setNewTitle(''); setNewContent('') }}
                className="flex items-center gap-1.5 text-text-muted hover:text-text px-3 py-2 text-sm transition-colors"
              >
                <X size={14} />
                Avbryt
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Check size={14} />
                Spara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sökfilter */}
      <div className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Sök instruktioner..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">Laddar instruktioner...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <BookOpen size={24} className="mx-auto text-text-muted mb-2" />
          <p className="text-text-muted text-sm">
            {instructions.length === 0
              ? 'Inga instruktioner ännu. Lägg till din första instruktion!'
              : 'Inga instruktioner matchar din sökning.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(instruction => {
            const isEditing = editingId === instruction.id

            if (isEditing) {
              return (
                <div key={instruction.id} className="bg-white border-2 border-accent rounded-xl p-4">
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
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Instruktion</label>
                      <textarea
                        value={editFields.content}
                        onChange={e => setEditFields({ ...editFields, content: e.target.value })}
                        rows={6}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDelete(instruction.id)}
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
              <div key={instruction.id} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-bg-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{instruction.title}</h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{instruction.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-muted">
                    {new Date(instruction.created_at).toLocaleDateString('sv-SE')}
                  </span>
                  <button
                    onClick={() => startEdit(instruction)}
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
