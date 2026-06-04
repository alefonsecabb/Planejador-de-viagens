import { MapPin, Calendar, ChevronRight, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency, getDaysUntil } from '../utils/dateUtils'
import { Badge } from './ui/Badge'

const STATUS_LABEL = { planning: 'Planejando', ongoing: 'Em viagem', completed: 'Concluída' }
const STATUS_COLOR = { planning: 'blue', ongoing: 'green', completed: 'gray' }

export function TripCard({ trip, expenses = [], onClick }) {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const pct = trip.budget ? Math.round((total / trip.budget) * 100) : 0
  const hasAlerts = expenses.some(e => e.status === 'pending' && e.dueDate && getDaysUntil(e.dueDate) <= 3)

  return (
    <div
      className="bg-slate-800/80 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-slate-700/80 transition-colors active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-white truncate">{trip.name}</h3>
            {hasAlerts && <AlertTriangle size={14} className="text-yellow-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <MapPin size={12} />
            <span className="truncate">{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={12} />
            <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge color={STATUS_COLOR[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
          <ChevronRight size={18} className="text-slate-500" />
        </div>
      </div>

      {trip.budget > 0 && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatCurrency(total, trip.currency)}</span>
            <span>{pct}% de {formatCurrency(trip.budget, trip.currency)}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
