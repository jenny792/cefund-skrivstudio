import { useState } from 'react'
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Library } from 'lucide-react'
import { Link } from 'react-router-dom'
import StoryTypeCard from '../components/StoryTypeCard'
import PostCard from '../components/PostCard'
import PostPreview from '../components/PostPreview'
import ExportBar from '../components/ExportBar'
import { STORY_TYPES, TONES } from '../lib/storyTypes'
import { generatePosts } from '../lib/claude'
import { getSources } from '../lib/sources'

export default function Generate() {
  const [sources] = useState(() => getSources())
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedSources, setSelectedSources] = useState([])
  const [selectedTone, setSelectedTone] = useState('professionell')
  const [posts, setPosts] = useState([])
  const [selectedPostIds, setSelectedPostIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const storyType = STORY_TYPES.find(t => t.id === selectedType)

  function toggleSource(id) {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function togglePostSelect(id) {
    setSelectedPostIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function updatePost(updated) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const sourcesContent = sources
        .filter(s => selectedSources.includes(s.id))
        .map(s => s.content)

      const result = await generatePosts({
        storyType: selectedType,
        sources: sourcesContent,
        tone: selectedTone,
      })

      setPosts(result.posts || [])
      setStep(4)
    } catch (err) {
      setError(`Kunde inte generera: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">Generera stories</h1>
      <p className="text-text-muted text-sm mb-8">
        Steg {step} av 4 — {
          step === 1 ? 'Välj story-typ' :
          step === 2 ? 'Välj källor och tonläge' :
          step === 3 ? 'Generera' :
          'Resultat'
        }
      </p>

      {/* Stegindikator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${
            s <= step ? 'bg-accent' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      {/* Steg 1: Välj story-typ */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {STORY_TYPES.map(type => (
              <StoryTypeCard
                key={type.id}
                storyType={type}
                selected={selectedType}
                onSelect={setSelectedType}
              />
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Nästa <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Steg 2: Välj källor och tonläge */}
      {step === 2 && (
        <div>
          <h2 className="text-lg mb-4">Välj källor</h2>
          {sources.length === 0 ? (
            <div className="bg-bg-subtle rounded-xl p-8 text-center mb-8">
              <Library size={24} className="mx-auto text-text-muted mb-2" />
              <p className="text-text-muted text-sm mb-3">Inga källor ännu.</p>
              <Link to="/kallor" className="text-sm text-accent font-medium hover:underline">
                Lägg till källor i Källbiblioteket →
              </Link>
            </div>
          ) : (
          <div className="space-y-2 mb-8">
            {sources.map(source => (
              <label
                key={source.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSources.includes(source.id)
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="mt-1 w-4 h-4 accent-accent"
                />
                <div>
                  <p className="font-medium text-sm">{source.title}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{source.content}</p>
                </div>
              </label>
            ))}
          </div>
          )}

          <h2 className="text-lg mb-4">Välj tonläge</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {TONES.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  selectedTone === tone.id
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-sm">{tone.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{tone.description}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-text-muted hover:text-text px-4 py-2.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Tillbaka
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSources.length === 0}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Nästa <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Steg 3: Bekräfta och generera */}
      {step === 3 && (
        <div className="max-w-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          <div className="bg-bg-subtle rounded-xl p-6 mb-6">
            <h2 className="text-lg mb-4">Sammanfattning</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Story-typ</dt>
                <dd className="font-medium">{storyType?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Antal källor</dt>
                <dd className="font-medium">{selectedSources.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Tonläge</dt>
                <dd className="font-medium">{TONES.find(t => t.id === selectedTone)?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Antal inlägg</dt>
                <dd className="font-medium">7 st</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-text-muted hover:text-text px-4 py-2.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Tillbaka
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Genererar...</>
              ) : (
                <><Sparkles size={16} /> Generera 7 stories</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Steg 4: Resultat */}
      {step === 4 && (
        <div>
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">{posts.length} genererade inlägg</h2>
            <button
              onClick={() => {
                setStep(1)
                setPosts([])
                setSelectedPostIds([])
                setSelectedType(null)
                setSelectedSources([])
                setError(null)
              }}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Börja om
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={updatePost}
                onToggleSelect={togglePostSelect}
                isSelected={selectedPostIds.includes(post.id)}
              />
            ))}
          </div>

          <ExportBar
            selectedPosts={posts.filter(p => selectedPostIds.includes(p.id))}
            storyType={selectedType}
          />
        </div>
      )}
    </div>
  )
}
