import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

export default function PostCard({ post, onUpdate, onToggleSelect, isSelected }) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState(post.fields)

  function handleSave() {
    onUpdate({ ...post, fields })
    setEditing(false)
  }

  function handleCancel() {
    setFields(post.fields)
    setEditing(false)
  }

  return (
    <div className={`rounded-xl border-2 bg-white transition-all ${
      isSelected ? 'border-accent shadow-sm' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(post.id)}
            className="w-4 h-4 accent-accent"
          />
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            post.status === 'reviewed'
              ? 'bg-green-100 text-green-700'
              : post.status === 'exported'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-text-muted'
          }`}>
            {post.status === 'reviewed' ? 'Klar' : post.status === 'exported' ? 'Exporterad' : 'Utkast'}
          </span>
        </div>
        <div className="flex gap-1">
          {editing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <X size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted">
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Fält */}
      <div className="p-4 space-y-3">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key}>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">{key}</label>
            {editing ? (
              <textarea
                value={value}
                onChange={e => setFields({ ...fields, [key]: e.target.value })}
                rows={2}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-accent resize-none"
              />
            ) : (
              <p className="mt-0.5 text-sm leading-relaxed">{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
