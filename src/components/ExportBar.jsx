import { Download, ShieldX } from 'lucide-react'
import { exportPostsToCSV } from '../lib/csv'
import { logExport } from '../lib/exports'

export default function ExportBar({ selectedPosts, storyType, platform = 'instagram' }) {
  const count = selectedPosts.length

  if (count === 0) return null

  const hasFailed = selectedPosts.some(p => p.compliance?.verdict === 'fail')

  async function handleExport() {
    if (hasFailed) return

    exportPostsToCSV(selectedPosts, storyType, platform)

    // Logga exporten i Supabase
    try {
      const postIds = selectedPosts.map(p => p.id)
      await logExport(postIds, storyType)
    } catch (err) {
      console.error('Kunde inte logga export:', err)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-50">
      <span className="text-sm">{count} inlägg valda</span>
      {hasFailed && (
        <span className="flex items-center gap-1 text-xs text-red-300">
          <ShieldX size={14} /> Innehåller ej godkända inlägg
        </span>
      )}
      <button
        onClick={handleExport}
        disabled={hasFailed}
        className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
      >
        <Download size={16} />
        Exportera CSV
      </button>
    </div>
  )
}
