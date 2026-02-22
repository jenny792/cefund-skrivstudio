import { Download } from 'lucide-react'
import { exportPostsToCSV } from '../lib/csv'
import { logExport } from '../lib/exports'

export default function ExportBar({ selectedPosts, storyType }) {
  const count = selectedPosts.length

  if (count === 0) return null

  async function handleExport() {
    exportPostsToCSV(selectedPosts, storyType)

    // Logga exporten i Supabase
    try {
      const postIds = selectedPosts.map(p => p.id)
      await logExport(postIds, storyType)
    } catch (err) {
      console.error('Kunde inte logga export:', err)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4 z-50">
      <span className="text-sm">{count} inlägg valda</span>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        <Download size={16} />
        Exportera CSV
      </button>
    </div>
  )
}
