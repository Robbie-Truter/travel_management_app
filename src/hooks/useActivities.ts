import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { Activity } from '@/db/types'

export function useActivities(tripId: number) {
  const activities = useLiveQuery(
    () => db.activities.where('tripId').equals(tripId).sortBy('date'),
    [tripId]
  )

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    return db.activities.add({ ...activity, createdAt: new Date().toISOString() })
  }

  const updateActivity = async (id: number, changes: Partial<Activity>) => {
    return db.activities.update(id, changes)
  }

  const deleteActivity = async (id: number) => {
    return db.activities.delete(id)
  }

  const reorderActivities = async (updates: { id: number; order: number }[]) => {
    await Promise.all(updates.map(({ id, order }) => db.activities.update(id, { order })))
  }

  return { activities: activities ?? [], addActivity, updateActivity, deleteActivity, reorderActivities }
}
