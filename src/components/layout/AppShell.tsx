import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Moon,
  Sun,
  Menu,
  X,
  Plane,
  Plus,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTrips'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onNewTrip: () => void
  onImport: () => void
}

export function AppShell({ children, onNewTrip, onImport }: { children: React.ReactNode; onNewTrip: () => void; onImport: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-2)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-shrink-0">
        <SidebarContent onNewTrip={onNewTrip} onImport={onImport} theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] md:hidden"
            >
              <SidebarContent onNewTrip={onNewTrip} onImport={onImport} theme={theme} toggleTheme={toggleTheme} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Plane size={20} className="text-sage-500" />
            <span className="font-bold text-[var(--color-text-primary)]">Wanderplan</span>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  onNewTrip,
  onImport,
  theme,
  toggleTheme,
  onClose,
}: SidebarProps & { theme: string; toggleTheme: () => void; onClose?: () => void }) {
  const navigate = useNavigate()

  const handleNewTrip = () => {
    onNewTrip()
    onClose?.()
  }

  const handleImport = () => {
    onImport()
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
        <button
          onClick={() => { navigate('/'); onClose?.() }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-[var(--color-text-primary)]">Wanderplan</span>
        </button>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]'
            )
          }
          end
        >
          <Map size={18} />
          My Trips
        </NavLink>
      </nav>

      {/* Actions */}
      <div className="px-3 py-4 space-y-2 border-t border-[var(--color-border)]">
        <Button variant="primary" className="w-full" onClick={handleNewTrip}>
          <Plus size={16} />
          New Trip
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleImport}>
          <Upload size={16} />
          Import Trip
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
    </div>
  )
}
