import { Trash2, CheckCircle } from 'lucide-react'
import { formatCurrency, dueLabelAndColor, formatDate } from '../utils/dateUtils'
import { Badge } from './ui/Badge'
import { ImageGallery } from './ImageGallery'

const STATUS_COLOR = { pending: 'yellow', paid: 'green', confirmed: 'blue', cancelled: 'gray' }
const STATUS_LABEL = { pending: 'Pendente', paid: 'Pago', confirmed: 'Confirmado', cancelled: 'Cancelado' }

const CAT_ICON = {
  flight: '✈️', hotel: '🏨', activity: '🎡', car_rental: '🚗', misc: '🍽️'
}

const IMAGE_CATS = ['flight', 'car_rental']
const IMAGE_LABEL = { flight: 'Cartão de embarque', car_rental: 'Reserva / contrato' }

export function ExpenseItem({ expense, onDelete, onStatusChange }) {
  const { label: dueLabel, color: dueColor } = expense.dueDate && expense.status === 'pending'
    ? dueLabelAndColor(expense.dueDate)
    : { label: '', color: 'gray' }

  const showGallery = IMAGE_CATS.includes(expense.category)

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">{CAT_ICON[expense.category] || '💸'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{expense.title}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <Badge color={STATUS_COLOR[expense.status]}>{STATUS_LABEL[expense.status]}</Badge>
            {dueLabel && <Badge color={dueColor}>{dueLabel}</Badge>}
            {expense.eventDate && (
              <span className="text-xs text-slate-500">{formatDate(expense.eventDate)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-bold text-white">{formatCurrency(expense.amount)}</span>
          <div className="flex gap-1">
            {expense.status === 'pending' && (
              <button
                onClick={() => onStatusChange(expense.id, 'paid')}
                className="p-1 rounded-lg hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 transition-colors"
                title="Marcar como pago"
              >
                <CheckCircle size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {showGallery && (
        <div className="ml-8">
          <ImageGallery
            expenseId={expense.id}
            label={IMAGE_LABEL[expense.category]}
          />
        </div>
      )}
    </div>
  )
}
