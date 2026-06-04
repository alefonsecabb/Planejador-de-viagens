import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { expensesStore } from '../utils/storage'

export function useExpenses(tripId) {
  const [allExpenses, setAll] = useState(() => expensesStore.getAll())

  const expenses = tripId ? allExpenses.filter(e => e.tripId === tripId) : allExpenses

  const persist = useCallback((updated) => {
    expensesStore.save(updated)
    setAll(updated)
  }, [])

  const addExpense = useCallback((data) => {
    const expense = { ...data, id: uuid(), createdAt: new Date().toISOString().split('T')[0] }
    persist([...expensesStore.getAll(), expense])
    return expense
  }, [persist])

  const updateExpense = useCallback((id, changes) => {
    const updated = expensesStore.getAll().map(e => e.id === id ? { ...e, ...changes } : e)
    persist(updated)
  }, [persist])

  const deleteExpense = useCallback((id) => {
    persist(expensesStore.getAll().filter(e => e.id !== id))
  }, [persist])

  return { expenses, allExpenses, addExpense, updateExpense, deleteExpense }
}
