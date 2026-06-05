import { formatCurrency } from '../utils/dateUtils'

export function BudgetBar({ budget, expenses, currency = 'BRL' }) {
  const paid    = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount || 0), 0)
  const pending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount || 0), 0)
  const total     = paid + pending
  const remaining = budget - total
  const over      = total > budget
  const paidPct    = budget ? Math.min((paid / budget) * 100, 100) : 0
  const pendingPct = budget ? Math.min((pending / budget) * 100, 100 - paidPct) : 0

  return (
    <div className="space-y-3">
      {/* 3 key metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Gasto</p>
          <p className="text-base font-bold text-white">{formatCurrency(total, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Disponível</p>
          <p className={`text-base font-bold ${over ? 'text-red-400' : 'text-emerald-400'}`}>
            {over ? '−' : ''}{formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Orçamento</p>
          <p className="text-base font-bold text-slate-300">{formatCurrency(budget, currency)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{over ? '⚠️ Orçamento excedido' : `${Math.round((total / budget) * 100)}% utilizado`}</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${paidPct}%` }} />
          <div className="bg-yellow-500/70 h-full transition-all" style={{ width: `${pendingPct}%` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Pago: {formatCurrency(paid, currency)}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500/70 inline-block" />
          Pendente: {formatCurrency(pending, currency)}
        </span>
      </div>
    </div>
  )
}
