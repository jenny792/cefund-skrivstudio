import { useState, useEffect } from 'react'
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Library, Linkedin, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import StoryTypeCard from '../components/StoryTypeCard'
import PostCard from '../components/PostCard'
import PostPreview from '../components/PostPreview'
import ExportBar from '../components/ExportBar'
import { STORY_TYPES, TONES } from '../lib/storyTypes'
import { LINKEDIN_TYPES, LINKEDIN_TONES } from '../lib/linkedinTypes'
import { generatePosts } from '../lib/claude'
import { getSources } from '../lib/sources'
import { savePosts, updatePost as updatePostInDb } from '../lib/posts'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram Stories', icon: Instagram, description: 'Korta stories för Instagram' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'Längre inlägg för LinkedIn' },
]

export default function Generate() {
  const [sources, setSources] = useState([])

  useEffect(() => {
    getSources().then(setSources)
  }, [])
  const [step, setStep] = useState(1)
  const [platform, setPlatform] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedSources, setSelectedSources] = useState([])
  const [selectedTone, setSelectedTone] = useState('professionell')
  const [posts, setPosts] = useState([])
  const [selectedPostIds, setSelectedPostIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isLinkedin = platform === 'linkedin'
  const types = isLinkedin ? LINKEDIN_TYPES : STORY_TYPES
  const tones = isLinkedin ? LINKEDIN_TONES : TONES
  const postCount = isLinkedin ? 3 : 7
  const storyType = types.find(t => t.id === selectedType)

  function handlePlatformSelect(id) {
    setPlatform(id)
    // Nollställ typ när plattform byts
    setSelectedType(null)
  }

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

  async function handleUpdatePost(updated) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
    try {
      await updatePostInDb(updated.id, { fields: updated.fields })
    } catch (err) {
      console.error('Kunde inte spara redigering:', err)
    }
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
        platform,
      })

      const generatedPosts = result.posts || []

      // Spara i Supabase och använd returnerade poster (med riktiga id:n)
      try {
        const savedPosts = await savePosts(generatedPosts, selectedType)
        setPosts(savedPosts)
      } catch (saveErr) {
        console.error('Kunde inte spara till Supabase:', saveErr)
        // Visa ändå de genererade inläggen lokalt
        setPosts(generatedPosts)
      }

      setStep(5)
    } catch (err) {
      setError(`Kunde inte generera: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = {
    1: 'Välj plattform',
    2: 'Välj inläggstyp',
    3: 'Välj källor och tonläge',
    4: 'Granska och generera',
    5: 'Resultat',
  }

  const totalSteps = 5

  return (
    <div>
      <h1 className="text-2xl mb-2">Generera innehåll</h1>
      <p className="text-text-muted text-sm mb-8">
        Steg {step} av {totalSteps} — {stepLabels[step]}
      </p>

      {/* Stegindikator */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${
            s <= step ? 'bg-accent' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      {/* Steg 1: Välj plattform */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {PLATFORMS.map(p => {
              const Icon = p.icon
              return (
                <button
                  key={p.id}
                  onClick={() => handlePlatformSelect(p.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    platform === p.id
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={32} className={platform === p.id ? 'text-accent' : 'text-text-muted'} />
                  <div className="text-center">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-text-muted mt-1">{p.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!platform}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Nästa <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Steg 2: Välj inläggstyp */}
      {step === 2 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {types.map(type => (
              <StoryTypeCard
                key={type.id}
                storyType={type}
                selected={selectedType}
                onSelect={setSelectedType}
              />
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-text-muted hover:text-text px-4 py-2.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Tillbaka
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedType}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Nästa <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Steg 3: Välj källor och tonläge */}
      {step === 3 && (
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
            {tones.map(tone => (
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
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-text-muted hover:text-text px-4 py-2.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Tillbaka
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={selectedSources.length === 0}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Nästa <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Steg 4: Bekräfta och generera */}
      {step === 4 && (
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
                <dt className="text-text-muted">Plattform</dt>
                <dd className="font-medium">{isLinkedin ? 'LinkedIn' : 'Instagram Stories'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Inläggstyp</dt>
                <dd className="font-medium">{storyType?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Antal källor</dt>
                <dd className="font-medium">{selectedSources.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Tonläge</dt>
                <dd className="font-medium">{tones.find(t => t.id === selectedTone)?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Antal inlägg</dt>
                <dd className="font-medium">{postCount} st</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
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
                <><Sparkles size={16} /> Generera {postCount} {isLinkedin ? 'inlägg' : 'stories'}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Steg 5: Resultat */}
      {step === 5 && (
        <div>
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">{posts.length} genererade {isLinkedin ? 'LinkedIn-inlägg' : 'inlägg'}</h2>
            <button
              onClick={() => {
                setStep(1)
                setPosts([])
                setSelectedPostIds([])
                setPlatform(null)
                setSelectedType(null)
                setSelectedSources([])
                setError(null)
              }}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Börja om
            </button>
          </div>

          {/* LinkedIn info */}
          {isLinkedin && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
              <Linkedin size={20} className="text-[#0A66C2] shrink-0" />
              <p className="text-sm text-blue-800">
                Redigera inlägget om du vill, kopiera texten och klistra in på LinkedIn.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={handleUpdatePost}
                onToggleSelect={togglePostSelect}
                isSelected={selectedPostIds.includes(post.id)}
              />
            ))}
          </div>

          <ExportBar
            selectedPosts={posts.filter(p => selectedPostIds.includes(p.id))}
            storyType={selectedType}
            platform={platform}
          />
        </div>
      )}
    </div>
  )
}
