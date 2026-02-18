import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Map, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TripCard } from '@/components/trips/TripCard'
import { TripForm } from '@/components/trips/TripForm'
import { useTrips } from '@/hooks/useTrips'
import { importTripFromJSON } from '@/lib/export'
import type { Trip } from '@/db/types'

export function DashboardPage() {
  const { trips, addTrip, updateTrip, deleteTrip } = useTrips()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>()
  const [search, setSearch] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const filtered = trips.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTrip?.id) {
      await updateTrip(editingTrip.id, data)
    } else {
      await addTrip(data)
    }
    setEditingTrip(undefined)
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormOpen(true)
  }

  const handleUpdateCover = async (id: number, image: string) => {
    await updateTrip(id, { coverImage: image })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importTripFromJSON(file)
    } catch (err) {
      console.error('Import failed', err)
    }
    e.target.value = ''
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Trips</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search trips..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent w-48"
            />
          </div>
          <Button variant="secondary" size="md" onClick={() => importRef.current?.click()}>
            <Upload size={15} />
            Import
          </Button>
          <Button variant="primary" size="md" onClick={() => { setEditingTrip(undefined); setFormOpen(true) }}>
            <Plus size={15} />
            New Trip
          </Button>
        </div>
      </div>

      {/* Trip grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4">
            <Map size={36} className="text-sage-400" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {search ? 'No trips found' : 'No trips yet'}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mb-6">
            {search
              ? 'Try a different search term'
              : 'Start planning your next adventure by creating your first trip.'}
          </p>
          {!search && (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              <Plus size={15} />
              Create Your First Trip
            </Button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={handleEdit}
                onDelete={id => deleteTrip(id)}
                onUpdateCover={handleUpdateCover}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <TripForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTrip(undefined) }}
        onSave={handleSave}
        initial={editingTrip}
      />

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  )
}
