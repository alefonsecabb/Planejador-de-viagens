import { formatCurrency } from '../utils/dateUtils'

export function BudgetBar({ budget, expenses, currency = 'BRL' }) {
  const paid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount || 0), 0)
  const pending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount || 0), 0)
  const total = paid + pending
  const paidPct = budget ? Math.min((paid / budget) * 100, 100) : 0
  const pendingPct = budget ? Math.min((pending / budget) * 100, 100 - paidPct) : 0
  const over = total > budget

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Orçamento: {formatCurrency(budget, currency)}</span>
        <span className={over ? 'text-red-400 font-semibold' : 'text-slate-300'}>
          {formatCurrency(total, currency)} ({budget ? Math.round((total / budget) * 100) : 0}%)
        </span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${paidPct}%` }} />
        <div className="bg-yellow-500/70 h-full transition-all" style={{ width: `${pendingPct}%` }} />
      </div>
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Pago: {formatCurrency(paid, currency)}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500/70 inline-block" />Pendente: {formatCurrency(pending, currency)}</span>
      </div>
    </div>
  )
}
