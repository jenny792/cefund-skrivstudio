import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Library, FileText, ArrowRight, Loader2 } from 'lucide-react'
import PostCard from '../components/PostCard'
import { getPosts, updatePost as updatePostInDb } from '../lib/posts'

export default function Dashboard() {
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPosts({ limit: 5 })
      .then(setRecentPosts)
      .catch(err => console.error('Kunde inte hämta senaste inlägg:', err))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpdatePost(updated) {
    setRecentPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
    try {
      await updatePostInDb(updated.id, { fields: updated.fields })
    } catch (err) {
      console.error('Kunde inte spara redigering:', err)
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl mb-1">Välkommen till Cefund Studio</h1>
        <p className="text-text-muted text-sm">Internal team workspace</p>
      </div>

      {/* Snabbåtgärder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        <Link
          to="/generera"
          className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-warm/40 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
            <Sparkles size={20} className="text-gold" />
          </div>
          <h3 className="font-heading font-semibold mb-1">Generera innehåll</h3>
          <p className="text-sm text-text-muted mb-4">Skapa nya inlägg med AI</p>
          <span className="flex items-center gap-1.5 text-sm text-accent font-medium group-hover:gap-2.5 transition-all">
            Kom igång <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/kallor"
          className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-warm/40 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
            <Library size={20} className="text-gold" />
          </div>
          <h3 className="font-heading font-semibold mb-1">Källbibliotek</h3>
          <p className="text-sm text-text-muted mb-4">Hantera råmaterial och underlag</p>
          <span className="flex items-center gap-1.5 text-sm text-text-muted font-medium group-hover:text-warm group-hover:gap-2.5 transition-all">
            Öppna <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/inlagg"
          className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-warm/40 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
            <FileText size={20} className="text-gold" />
          </div>
          <h3 className="font-heading font-semibold mb-1">Inlägg</h3>
          <p className="text-sm text-text-muted mb-4">Se och hantera genererade inlägg</p>
          <span className="flex items-center gap-1.5 text-sm text-text-muted font-medium group-hover:text-warm group-hover:gap-2.5 transition-all">
            Öppna <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      {/* Senaste inlägg */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Senaste inlägg</h2>
          {recentPosts.length > 0 && (
            <Link to="/inlagg" className="text-sm text-accent font-medium hover:underline">
              Visa alla →
            </Link>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-text-muted" />
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="bg-bg-subtle rounded-xl p-8 text-center">
            <p className="text-text-muted text-sm">Inga inlägg ännu. Börja med att generera stories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={handleUpdatePost}
                onToggleSelect={() => {}}
                isSelected={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
