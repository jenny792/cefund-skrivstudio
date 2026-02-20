// Story-format preview (1080×1920 aspect ratio)
export default function PostPreview({ post, storyType }) {
  const fields = post.fields || {}
  const entries = Object.entries(fields)

  return (
    <div className="w-[270px] h-[480px] bg-gradient-to-b from-bg-subtle to-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-accent text-white px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider opacity-80">Cefund</p>
        <p className="text-xs font-semibold mt-0.5">{storyType?.name || 'Story'}</p>
      </div>

      {/* Innehåll */}
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-[9px] uppercase tracking-wide text-accent font-semibold">{key}</p>
            <p className="text-[11px] leading-snug mt-0.5 text-text line-clamp-3">{value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100">
        <p className="text-[9px] text-text-muted">@cefund.se</p>
      </div>
    </div>
  )
}
