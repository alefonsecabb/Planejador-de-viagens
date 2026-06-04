import { AlertTriangle, XCircle } from 'lucide-react'
import { getDaysUntil, formatCurrency } from '../utils/dateUtils'

export function AlertBanner({ expenses }) {
  const overdue = expenses.filter(e => {
    if (e.status !== 'pending' || !e.dueDate) return false
    const days = getDaysUntil(e.dueDate)
    return days !== null && days < 0
  })
  const soon = expenses.filter(e => {
    if (e.status !== 'pending' || !e.dueDate) return false
    const days = getDaysUntil(e.dueDate)
    return days !== null && days >= 0 && days <= 3
  })

  if (!overdue.length && !soon.length) return null

  return (
    <div className="space-y-2">
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">Prazo vencido ({overdue.length})</p>
            {overdue.map(e => (
              <p key={e.id} className="text-xs text-red-300/80 mt-0.5">
                {e.title} — {formatCurrency(e.amount)} (venceu {formatDate(e.dueDate)})
              </p>
            ))}
          </div>
        </div>
      )}
      {soon.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Vence em breve ({soon.length})</p>
            {soon.map(e => {
              const days = getDaysUntil(e.dueDate)
              return (
                <p key={e.id} className="text-xs text-yellow-300/80 mt-0.5">
                  {e.title} — {formatCurrency(e.amount)} ({days === 0 ? 'hoje' : `em ${days}d`})
                </p>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
