import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { legsStore } from '../utils/storage'

export function useLegs(tripId) {
  const [allLegs, setAll] = useState(() => legsStore.getAll())

  const legs = tripId
    ? allLegs.filter(l => l.tripId === tripId).sort((a, b) => a.order - b.order)
    : allLegs

  const persist = useCallback((updated) => {
    legsStore.save(updated)
    setAll(updated)
  }, [])

  const addLeg = useCallback((data) => {
    const all = legsStore.getAll()
    const forTrip = all.filter(l => l.tripId === data.tripId)
    const leg = { ...data, id: uuid(), order: forTrip.length }
    persist([...all, leg])
    return leg
  }, [persist])

  const updateLeg = useCallback((id, changes) => {
    persist(legsStore.getAll().map(l => l.id === id ? { ...l, ...changes } : l))
  }, [persist])

  const deleteLeg = useCallback((id) => {
    persist(legsStore.getAll().filter(l => l.id !== id))
  }, [persist])

  const deleteLegsForTrip = useCallback((tripId) => {
    persist(legsStore.getAll().filter(l => l.tripId !== tripId))
  }, [persist])

  return { legs, addLeg, updateLeg, deleteLeg, deleteLegsForTrip }
}
