import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane, Plus, Trash2, MapPin } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { useLegs } from '../hooks/useLegs'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { today } from '../utils/dateUtils'

const CURRENCIES = ['BRL', 'USD', 'EUR', 'ARS', 'CLP', 'PEN', 'COP', 'GBP']
const MAX_LEGS = 10

const emptyLeg = () => ({ tempId: Math.random().toString(36).slice(2), name: '', startDate: '', endDate: '' })

export default function NewTrip() {
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const { addLeg } = useLegs()

  const [form, setForm] = useState({
    name: '', budget: '', currency: 'BRL', status: 'planning'
  })
  const [legs, setLegs] = useState([emptyLeg()])
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function setLeg(tempId, field, value) {
    setLegs(ls => ls.map(l => l.tempId === tempId ? { ...l, [field]: value } : l))
    setErrors(e => ({ ...e, [`leg_${tempId}_${field}`]: undefined }))
  }

  function addLegRow() {
    if (legs.length >= MAX_LEGS) return
    setLegs(ls => [...ls, emptyLeg()])
  }

  function removeLegRow(tempId) {
    setLegs(ls => ls.filter(l => l.tempId !== tempId))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!legs.length) errs.legs = 'Adicione ao menos um destino'
    legs.forEach(l => {
      if (!l.name.trim()) errs[`leg_${l.tempId}_name`] = 'Nome obrigatório'
      if (!l.startDate) errs[`leg_${l.tempId}_startDate`] = 'Data obrigatória'
    })
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const sortedLegs = [...legs].sort((a, b) => (a.startDate || '') < (b.startDate || '') ? -1 : 1)
    const startDate = sortedLegs[0]?.startDate || ''
    const endDate = sortedLegs[sortedLegs.length - 1]?.endDate || sortedLegs[sortedLegs.length - 1]?.startDate || ''
    const destination = legs.length === 1
      ? legs[0].name
      : legs.map(l => l.name).join(' → ')

    const trip = addTrip({
      ...form,
      budget: parseFloat(form.budget) || 0,
      destination,
      startDate,
      endDate,
    })

    sortedLegs.forEach((l, i) => {
      addLeg({ tripId: trip.id, name: l.name, startDate: l.startDate, endDate: l.endDate || l.startDate, order: i })
    })

    navigate(`/trips/${trip.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">Nova Viagem</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-10">
        <div className="flex justify-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Plane size={32} className="text-blue-400" />
          </div>
        </div>

        <Input label="Nome da viagem" placeholder="Ex: Europa 2026" value={form.name}
          onChange={e => setField('name', e.target.value)} error={errors.name} />

        {/* Destinos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={13} />
              Destinos da viagem
            </label>
            <button
              type="button"
              onClick={addLegRow}
              disabled={legs.length >= MAX_LEGS}
              title={legs.length >= MAX_LEGS ? 'Limite de 10 destinos' : 'Adicionar destino'}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          {errors.legs && <p className="text-sm text-red-400 mb-2">{errors.legs}</p>}

          <div className="space-y-3">
            {legs.map((leg, idx) => (
              <div key={leg.tempId} className="bg-slate-800/60 border border-white/10 rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Destino {idx + 1}
                  </span>
                  {legs.length > 1 && (
                    <button type="button" onClick={() => removeLegRow(leg.tempId)}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Ex: Lisboa, Paris, Roma..."
                  value={leg.name}
                  onChange={e => setLeg(leg.tempId, 'name', e.target.value)}
                  error={errors[`leg_${leg.tempId}_name`]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Chegada" type="date" value={leg.startDate}
                    onChange={e => {
                      setLeg(leg.tempId, 'startDate', e.target.value)
                      if (!leg.endDate) setLeg(leg.tempId, 'endDate', e.target.value)
                    }}
                    error={errors[`leg_${leg.tempId}_startDate`]} />
                  <Input label="Partida" type="date" value={leg.endDate}
                    min={leg.startDate}
                    onChange={e => setLeg(leg.tempId, 'endDate', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Orçamento total" type="number" placeholder="0,00" min="0" step="0.01"
              value={form.budget} onChange={e => setField('budget', e.target.value)} />
          </div>
          <Select label="Moeda" value={form.currency} onChange={e => setField('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Select label="Status" value={form.status} onChange={e => setField('status', e.target.value)}>
          <option value="planning">Planejando</option>
          <option value="ongoing">Em viagem</option>
          <option value="completed">Concluída</option>
        </Select>

        <Button type="submit" size="lg" className="w-full mt-2">Criar Viagem</Button>
      </form>
    </div>
  )
}
