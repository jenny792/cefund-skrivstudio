import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import PostCard from '../components/PostCard'
import ExportBar from '../components/ExportBar'
import { STORY_TYPES } from '../lib/storyTypes'

export default function Posts() {
  // I framtiden hämtas inlägg från Supabase — nu är det tomt
  const [posts, setPosts] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  function toggleSelect(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function updatePost(updated) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const filtered = posts.filter(p => {
    const matchesType = typeFilter === 'all' || p.story_type === typeFilter
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesSearch = searchQuery === '' ||
      Object.values(p.fields).some(v =>
        v.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesType && matchesStatus && matchesSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1">Inlägg</h1>
          <p className="text-text-muted text-sm">{posts.length} inlägg totalt</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sök i inlägg..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-white"
        >
          <option value="all">Alla typer</option>
          {STORY_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-white"
        >
          <option value="all">Alla status</option>
          <option value="draft">Utkast</option>
          <option value="reviewed">Klar</option>
          <option value="exported">Exporterad</option>
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">
            {posts.length === 0
              ? 'Inga inlägg ännu. Generera stories för att komma igång!'
              : 'Inga inlägg matchar dina filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={updatePost}
              onToggleSelect={toggleSelect}
              isSelected={selectedIds.includes(post.id)}
            />
          ))}
        </div>
      )}

      <ExportBar
        selectedPosts={posts.filter(p => selectedIds.includes(p.id))}
        storyType={typeFilter !== 'all' ? typeFilter : filtered[0]?.story_type}
      />
    </div>
  )
}
