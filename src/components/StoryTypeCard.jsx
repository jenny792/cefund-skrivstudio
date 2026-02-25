export default function StoryTypeCard({ storyType, selected, onSelect }) {
  const isSelected = selected === storyType.id

  return (
    <button
      onClick={() => onSelect(storyType.id)}
      className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'border-warm bg-warm/5 shadow-md'
          : 'border-gray-200 hover:border-warm/30 hover:shadow-sm bg-white'
      }`}
    >
      <div className="text-2xl mb-2">{storyType.icon}</div>
      <h3 className="font-heading font-semibold text-sm mb-1">{storyType.name}</h3>
      <p className="text-xs text-text-muted">{storyType.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {storyType.columns.map(col => (
          <span key={col} className="text-[10px] px-1.5 py-0.5 bg-bg-subtle rounded text-text-muted">
            {col}
          </span>
        ))}
      </div>
    </button>
  )
}
