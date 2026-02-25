import { NavLink, Outlet } from 'react-router-dom'
import { Home, FileText, Sparkles, Library, Lightbulb } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/kallor', icon: Library, label: 'Källbibliotek' },
  { to: '/idebank', icon: Lightbulb, label: 'Idébank' },
  { to: '/generera', icon: Sparkles, label: 'Generera' },
  { to: '/inlagg', icon: FileText, label: 'Inlägg' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col">
        <div className="px-6 pt-6 pb-5">
          <img
            src="/cefund-icon.png"
            alt="Cefund"
            className="h-10 object-contain mb-3"
          />
          <p className="text-[13px] font-semibold tracking-[0.15em] uppercase text-white">
            Cefund <span className="text-gold">Studio</span>
          </p>
        </div>
        <div className="mx-5 border-t border-white/10 mb-4" />
        <nav className="flex-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              <Icon size={18} className="text-gold" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mx-5 border-t border-white/10 mt-2" />
        <div className="px-6 py-4 text-[11px] text-white/25 tracking-wide">
          v1.0
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <main className="flex-1 overflow-auto bg-bg-subtle/50">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
