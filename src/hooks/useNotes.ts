import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'

export function useNotes(tripId: number) {
  const note = useLiveQuery(
    () => db.notes.where('tripId').equals(tripId).first(),
    [tripId]
  )

  const saveNote = async (content: string) => {
    const existing = await db.notes.where('tripId').equals(tripId).first()
    const now = new Date().toISOString()
    if (existing?.id) {
      return db.notes.update(existing.id, { content, updatedAt: now })
    } else {
      return db.notes.add({ tripId, content, updatedAt: now })
    }
  }

  return { note, saveNote }
}
