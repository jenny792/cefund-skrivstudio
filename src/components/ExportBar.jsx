import { Download } from 'lucide-react'
import { exportPostsToCSV } from '../lib/csv'

export default function ExportBar({ selectedPosts, storyType }) {
  const count = selectedPosts.length

  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4 z-50">
      <span className="text-sm">{count} inlägg valda</span>
      <button
        onClick={() => exportPostsToCSV(selectedPosts, storyType)}
        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        <Download size={16} />
        Exportera CSV
      </button>
    </div>
  )
}
