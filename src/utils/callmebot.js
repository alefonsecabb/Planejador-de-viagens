export async function sendWhatsApp(phone, apiKey, message) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`CallMeBot error: ${resp.status}`)
  return resp
}

export function buildAlertMessage(tripName, expenses) {
  const overdue = expenses.filter(e => e.status === 'pending' && getDaysUntil(e.dueDate) < 0)
  const soon = expenses.filter(e => e.status === 'pending' && getDaysUntil(e.dueDate) >= 0 && getDaysUntil(e.dueDate) <= 3)

  const lines = [`📋 *${tripName}* — Alerta de Prazos\n`]

  if (overdue.length) {
    lines.push('🔴 *VENCIDOS:*')
    overdue.forEach(e => lines.push(`  • ${e.title}: ${formatCurrency(e.amount)}`))
  }
  if (soon.length) {
    lines.push('⚠️ *Vencem em breve:*')
    soon.forEach(e => {
      const days = getDaysUntil(e.dueDate)
      lines.push(`  • ${e.title}: ${formatCurrency(e.amount)} (${days === 0 ? 'hoje' : `em ${days}d`})`)
    })
  }
  if (!overdue.length && !soon.length) {
    lines.push('✅ Nenhum prazo urgente no momento.')
  }

  return lines.join('\n')
}

export function buildSummaryMessage(trip, expenses) {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const paid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount || 0), 0)
  const pct = trip.budget ? Math.round((total / trip.budget) * 100) : 0

  const catLabels = { flight: '✈️ Passagens', hotel: '🏨 Hospedagem', activity: '🎡 Passeios', car_rental: '🚗 Aluguel', misc: '🍽️ Misc' }
  const byCategory = {}
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0)
  })

  const lines = [
    `🧳 *Resumo: ${trip.name}*`,
    `📍 ${trip.destination}`,
    `📅 ${formatDate(trip.startDate)} → ${formatDate(trip.endDate)}\n`,
    `💰 Orçamento: ${formatCurrency(trip.budget, trip.currency)}`,
    `📊 Total lançado: ${formatCurrency(total, trip.currency)} (${pct}%)`,
    `✅ Já pago: ${formatCurrency(paid, trip.currency)}\n`,
    `*Por categoria:*`,
  ]
  Object.entries(byCategory).forEach(([cat, val]) => {
    lines.push(`  ${catLabels[cat] || cat}: ${formatCurrency(val, trip.currency)}`)
  })

  return lines.join('\n')
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date().toISOString().split('T')[0]
  const diff = new Date(dateStr + 'T12:00:00') - new Date(today + 'T12:00:00')
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
