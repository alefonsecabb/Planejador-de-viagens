import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { today } from '../utils/dateUtils'

const CURRENCIES = ['BRL', 'USD', 'EUR', 'ARS', 'CLP', 'PEN', 'COP', 'GBP']

export default function NewTrip() {
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const [form, setForm] = useState({
    name: '', destination: '', startDate: '', endDate: '',
    budget: '', currency: 'BRL', status: 'planning'
  })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!form.destination.trim()) errs.destination = 'Destino obrigatório'
    if (!form.startDate) errs.startDate = 'Data obrigatória'
    if (form.endDate && form.startDate && form.endDate < form.startDate) errs.endDate = 'Deve ser após a ida'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const trip = addTrip({ ...form, budget: parseFloat(form.budget) || 0 })
    navigate(`/trips/${trip.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Nova Viagem</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-10">
        <div className="flex justify-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Plane size={32} className="text-blue-400" />
          </div>
        </div>

        <Input label="Nome da viagem" placeholder="Ex: Lisboa 2026" value={form.name}
          onChange={e => set('name', e.target.value)} error={errors.name} />

        <Input label="Destino" placeholder="Ex: Lisboa, Portugal" value={form.destination}
          onChange={e => set('destination', e.target.value)} error={errors.destination} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Data de ida" type="date" value={form.startDate} min={today()}
            onChange={e => set('startDate', e.target.value)} error={errors.startDate} />
          <Input label="Data de volta" type="date" value={form.endDate} min={form.startDate || today()}
            onChange={e => set('endDate', e.target.value)} error={errors.endDate} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Orçamento total" type="number" placeholder="0,00" min="0" step="0.01"
              value={form.budget} onChange={e => set('budget', e.target.value)} />
          </div>
          <Select label="Moeda" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="planning">Planejando</option>
          <option value="ongoing">Em viagem</option>
          <option value="completed">Concluída</option>
        </Select>

        <Button type="submit" size="lg" className="w-full mt-6">Criar Viagem</Button>
      </form>
    </div>
  )
}
