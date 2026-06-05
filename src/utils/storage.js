const KEYS = {
  TRIPS: 'vt_trips',
  EXPENSES: 'vt_expenses',
  CONTACTS: 'vt_contacts',
  SETTINGS: 'vt_settings',
  LEGS: 'vt_legs',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const tripsStore = {
  getAll: () => load(KEYS.TRIPS, []),
  save: (trips) => save(KEYS.TRIPS, trips),
}

export const expensesStore = {
  getAll: () => load(KEYS.EXPENSES, []),
  save: (expenses) => save(KEYS.EXPENSES, expenses),
}

export const contactsStore = {
  getAll: () => load(KEYS.CONTACTS, []),
  save: (contacts) => save(KEYS.CONTACTS, contacts),
}

export const settingsStore = {
  get: () => load(KEYS.SETTINGS, { alertDaysBeforeDue: 3, defaultCurrency: 'BRL' }),
  save: (settings) => save(KEYS.SETTINGS, settings),
}

export const legsStore = {
  getAll: () => load(KEYS.LEGS, []),
  save: (legs) => save(KEYS.LEGS, legs),
}
