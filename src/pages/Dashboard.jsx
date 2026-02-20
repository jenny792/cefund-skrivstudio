import { Link } from 'react-router-dom'
import { Sparkles, Library, FileText, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Välkommen till Skrivstudion</h1>
        <p className="text-text-muted">Generera Instagram-innehåll baserat på Cefunds råmaterial.</p>
      </div>

      {/* Snabbåtgärder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          to="/generera"
          className="group bg-accent/5 border-2 border-accent/20 rounded-xl p-6 hover:border-accent transition-colors"
        >
          <Sparkles size={24} className="text-accent mb-3" />
          <h3 className="font-heading font-semibold mb-1">Generera stories</h3>
          <p className="text-sm text-text-muted mb-3">Skapa nya Instagram-inlägg med AI</p>
          <span className="flex items-center gap-1 text-sm text-accent font-medium group-hover:gap-2 transition-all">
            Kom igång <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/kallor"
          className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
        >
          <Library size={24} className="text-warm mb-3" />
          <h3 className="font-heading font-semibold mb-1">Källbibliotek</h3>
          <p className="text-sm text-text-muted mb-3">Hantera råmaterial och underlag</p>
          <span className="flex items-center gap-1 text-sm text-text-muted font-medium group-hover:gap-2 transition-all">
            Öppna <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/inlagg"
          className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
        >
          <FileText size={24} className="text-warm mb-3" />
          <h3 className="font-heading font-semibold mb-1">Inlägg</h3>
          <p className="text-sm text-text-muted mb-3">Se och hantera genererade inlägg</p>
          <span className="flex items-center gap-1 text-sm text-text-muted font-medium group-hover:gap-2 transition-all">
            Öppna <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      {/* Senaste inlägg — placeholder */}
      <div>
        <h2 className="text-lg mb-4">Senaste inlägg</h2>
        <div className="bg-bg-subtle rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">Inga inlägg ännu. Börja med att generera stories!</p>
        </div>
      </div>
    </div>
  )
}
