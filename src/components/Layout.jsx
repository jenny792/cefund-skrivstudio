import { NavLink, Outlet } from 'react-router-dom'
import { Home, FileText, Sparkles, Library } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/kallor', icon: Library, label: 'Källbibliotek' },
  { to: '/generera', icon: Sparkles, label: 'Generera' },
  { to: '/inlagg', icon: FileText, label: 'Inlägg' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-bg-subtle flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-heading text-text">
            Cefund <span className="text-accent">Skrivstudio</span>
          </h1>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-accent font-medium shadow-sm'
                    : 'text-text-muted hover:bg-white/60 hover:text-text'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-text-muted">
          Cefund Skrivstudio v1.0
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
