import { useState } from 'react'
import { contactsStore } from '../utils/storage'
import { sendWhatsApp } from '../utils/callmebot'

export function useWhatsApp() {
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState([])

  async function broadcast(message) {
    const contacts = contactsStore.getAll()
    if (!contacts.length) return { sent: 0, errors: 0 }

    setSending(true)
    setResults([])
    const outcomes = []

    for (const contact of contacts) {
      try {
        await sendWhatsApp(contact.phone, contact.apiKey, message)
        outcomes.push({ name: contact.name, ok: true })
      } catch (err) {
        outcomes.push({ name: contact.name, ok: false, error: err.message })
      }
    }

    setSending(false)
    setResults(outcomes)
    return {
      sent: outcomes.filter(o => o.ok).length,
      errors: outcomes.filter(o => !o.ok).length,
    }
  }

  return { broadcast, sending, results }
}
