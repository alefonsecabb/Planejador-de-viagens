import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { CheckCircle, MapPin, Calendar, Wallet } from 'lucide-react'
import { tripsStore, legsStore, expensesStore } from '../utils/storage'
import { imageStore } from '../utils/imageStore'
import { decodeShareData } from '../utils/shareUtils'
import { formatDate, formatCurrency } from '../utils/dateUtils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

const STATUS_LABEL = { planning: 'Planejando', ongoing: 'Em viagem', completed: 'Concluída' }
const STATUS_COLOR  = { planning: 'blue', ongoing: 'green', completed: 'gray' }

export default function ImportTrip() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [done, setDone] = useState(false)

  const encoded = searchParams.get('data')
  const payload = encoded ? decodeShareData(encoded) : null

  async function handleImport() {
    if (!payload) return
    const { trip, legs = [], expenses = [], images = [] } = payload

    const today = new Date().toISOString().split('T')[0]
    const newTripId = uuid()
    tripsStore.save([...tripsStore.getAll(), { ...trip, id: newTripId, createdAt: today }])

    const legIdMap = {}
    const newLegs = legs.map((leg, i) => {
      const newId = uuid()
      legIdMap[leg.id] = newId
      return { ...leg, id: newId, tripId: newTripId, order: i }
    })
    legsStore.save([...legsStore.getAll(), ...newLegs])

    const expenseIdMap = {}
    const newExpenses = expenses.map(exp => {
      const newId = uuid()
      expenseIdMap[exp.id] = newId
      return { ...exp, id: newId, tripId: newTripId,
        legId: exp.legId ? (legIdMap[exp.legId] ?? null) : null,
        createdAt: today }
    })
    expensesStore.save([...expensesStore.getAll(), ...newExpenses])

    if (images.length) {
      await imageStore.addBatch(
        images
          .filter(img => expenseIdMap[img.expenseId])
          .map(img => ({ dataUrl: img.dataUrl, filename: img.filename,
                         expenseId: expenseIdMap[img.expenseId] }))
      )
    }

    setDone(true)
    setTimeout(() => navigate(`/trips/${newTripId}`), 1500)
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-4 text-center">
        <p className="text-4xl">❌</p>
        <p className="text-xl font-bold">Link inválido</p>
        <p className="text-slate-400">O link de convite está expirado ou incompleto.</p>
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-4">
        <CheckCircle size={56} className="text-emerald-400" />
        <p className="text-2xl font-bold">Viagem importada!</p>
        <p className="text-slate-400">Abrindo o planejamento...</p>
      </div>
    )
  }

  const { trip, legs = [], expenses = [] } = payload
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">Convite de viagem ✈️</h1>
          <p className="text-xs text-slate-400 mt-0.5">Alguém compartilhou um planejamento com você</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-10">
        {/* Trip card */}
        <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-2xl font-bold text-white leading-tight">{trip.name}</h2>
            <Badge color={STATUS_COLOR[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
          </div>
          {legs.length > 0 && (
            <div className="flex items-center gap-2 text-base text-slate-300">
              <MapPin size={16} className="text-blue-400 shrink-0" />
              <span>{legs.map(l => l.name).join(' → ')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar size={15} className="shrink-0" />
            <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
          </div>
          {trip.budget > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Wallet size={15} className="shrink-0" />
              <span>Orçamento: {formatCurrency(trip.budget, trip.currency)}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: legs.length, label: 'Destinos' },
            { value: expenses.length, label: 'Gastos' },
            { value: formatCurrency(total, trip.currency), label: 'Total' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-slate-800/60 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white truncate">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Itinerary */}
        {legs.length > 0 && (
          <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Itinerário</h3>
            <div className="space-y-1">
              {legs.map((leg, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{leg.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(leg.startDate)}{leg.endDate && leg.endDate !== leg.startDate ? ` → ${formatDate(leg.endDate)}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Button size="lg" className="w-full" onClick={handleImport}>
            Adicionar à minha lista
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
