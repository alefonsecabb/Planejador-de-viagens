import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { tripsStore } from '../utils/storage'

export function useTrips() {
  const [trips, setTrips] = useState(() => tripsStore.getAll())

  const persist = useCallback((updated) => {
    tripsStore.save(updated)
    setTrips(updated)
  }, [])

  const addTrip = useCallback((data) => {
    const trip = { ...data, id: uuid(), createdAt: new Date().toISOString().split('T')[0] }
    persist([...tripsStore.getAll(), trip])
    return trip
  }, [persist])

  const updateTrip = useCallback((id, changes) => {
    const updated = tripsStore.getAll().map(t => t.id === id ? { ...t, ...changes } : t)
    persist(updated)
  }, [persist])

  const deleteTrip = useCallback((id) => {
    persist(tripsStore.getAll().filter(t => t.id !== id))
  }, [persist])

  const getTrip = useCallback((id) => trips.find(t => t.id === id), [trips])

  return { trips, addTrip, updateTrip, deleteTrip, getTrip }
}
