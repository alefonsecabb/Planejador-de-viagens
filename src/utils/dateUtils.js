export function today() {
  return new Date().toISOString().split('T')[0]
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T12:00:00') - new Date(today() + 'T12:00:00')
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateStr) {
  return getDaysUntil(dateStr) < 0
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatCurrency(amount, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount || 0)
}

export function dueLabelAndColor(dateStr) {
  const days = getDaysUntil(dateStr)
  if (days === null) return { label: '', color: 'gray' }
  if (days < 0) return { label: `Vencido há ${Math.abs(days)}d`, color: 'red' }
  if (days === 0) return { label: 'Vence hoje', color: 'red' }
  if (days <= 3) return { label: `Vence em ${days}d`, color: 'orange' }
  if (days <= 7) return { label: `Vence em ${days}d`, color: 'yellow' }
  return { label: `${formatDate(dateStr)}`, color: 'gray' }
}
