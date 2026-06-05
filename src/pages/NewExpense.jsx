import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { useExpenses } from '../hooks/useExpenses'
import { useLegs } from '../hooks/useLegs'
import { imageStore } from '../utils/imageStore'
import { ImageGallery } from '../components/ImageGallery'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'

const CATEGORIES = [
  { value: 'flight',     label: '✈️ Passagem Aérea' },
  { value: 'hotel',      label: '🏨 Hospedagem' },
  { value: 'activity',   label: '🎡 Passeio / Atividade' },
  { value: 'car_rental', label: '🚗 Aluguel de Carro' },
  { value: 'misc',       label: '🍽️ Alimentação / Misc' },
]

const MISC_SUBS = ['Alimentação', 'Transporte', 'Compras', 'Farmácia', 'Outro']

const STATUSES = [
  { value: 'pending',   label: 'Pendente' },
  { value: 'paid',      label: 'Pago' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function NewExpense() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip } = useTrips()
  const { addExpense } = useExpenses(id)
  const { legs } = useLegs(id)
  const trip = getTrip(id)

  const [form, setForm] = useState({
    category: 'flight', title: '', amount: '', dueDate: '', eventDate: '',
    status: 'pending', notes: '', legId: '',
    // flight
    airline: '', origin: '', destination: '', flightNumber: '', departureTime: '',
    // hotel
    hotelName: '', nights: '', pricePerNight: '',
    // activity
    activityLocation: '', activityTime: '',
    // car_rental
    carCompany: '', carPickup: '', carReturn: '', pricePerDay: '',
    // misc
    miscSub: 'Alimentação',
  })
  const [errors, setErrors] = useState({})
  const [pendingImages, setPendingImages] = useState([])

  function set(field, value) {
    setForm(f => {
      const updated = { ...f, [field]: value }
      // Auto-calc amount for hotel and car
      if (field === 'pricePerNight' || field === 'nights') {
        const pn = parseFloat(field === 'pricePerNight' ? value : updated.pricePerNight) || 0
        const n = parseFloat(field === 'nights' ? value : updated.nights) || 0
        if (pn && n) updated.amount = String((pn * n).toFixed(2))
      }
      if (field === 'pricePerDay' || field === 'carPickup' || field === 'carReturn') {
        const pd = parseFloat(updated.pricePerDay) || 0
        const d1 = updated.carPickup, d2 = field === 'carReturn' ? value : updated.carReturn
        if (pd && d1 && d2 && d2 >= d1) {
          const days = Math.round((new Date(d2) - new Date(d1)) / 86400000) || 1
          updated.amount = String((pd * days).toFixed(2))
        }
      }
      return updated
    })
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Descrição obrigatória'
    if (!form.amount || isNaN(parseFloat(form.amount))) errs.amount = 'Valor obrigatório'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const details = buildDetails()
    const expense = addExpense({
      tripId: id,
      category: form.category,
      title: form.title || defaultTitle(),
      amount: parseFloat(form.amount) || 0,
      dueDate: form.dueDate,
      eventDate: form.eventDate,
      status: form.status,
      notes: form.notes,
      details,
      legId: form.legId || null,
    })

    for (const dataUrl of pendingImages) {
      await imageStore.add({ expenseId: expense.id, dataUrl, filename: 'foto.jpg' })
    }

    navigate(`/trips/${id}`)
  }

  function defaultTitle() {
    if (form.category === 'flight') return `Voo ${form.airline || ''} ${form.origin}→${form.destination}`.trim()
    if (form.category === 'hotel') return form.hotelName || 'Hospedagem'
    if (form.category === 'car_rental') return `Aluguel ${form.carCompany || ''}`.trim()
    return form.category
  }

  function buildDetails() {
    if (form.category === 'flight') return { airline: form.airline, origin: form.origin, destination: form.destination, flightNumber: form.flightNumber, departureTime: form.departureTime }
    if (form.category === 'hotel') return { hotelName: form.hotelName, nights: form.nights, pricePerNight: form.pricePerNight }
    if (form.category === 'activity') return { location: form.activityLocation, time: form.activityTime }
    if (form.category === 'car_rental') return { company: form.carCompany, pickup: form.carPickup, return: form.carReturn, pricePerDay: form.pricePerDay }
    if (form.category === 'misc') return { subcategory: form.miscSub }
    return {}
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Novo Gasto</h1>
            {trip && <p className="text-xs text-slate-400">{trip.name}</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-10">
        {/* Category selector */}
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-2">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('category', c.value)}
                className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                  form.category === c.value
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-800/60 border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {legs.length > 0 && (
          <Select label="Destino" value={form.legId} onChange={e => set('legId', e.target.value)}>
            <option value="">Toda a viagem</option>
            {legs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}

        <Input label="Descrição" placeholder="Ex: Passagem TAP Lisboa" value={form.title}
          onChange={e => set('title', e.target.value)} error={errors.title} />

        {/* Category-specific fields */}
        {form.category === 'flight' && (
          <div className="space-y-3 bg-slate-800/40 rounded-xl p-3 border border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Companhia" placeholder="TAP Air, LATAM..." value={form.airline}
                onChange={e => set('airline', e.target.value)} />
              <Input label="Nº do voo" placeholder="TP084" value={form.flightNumber}
                onChange={e => set('flightNumber', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Origem" placeholder="GRU" value={form.origin}
                onChange={e => set('origin', e.target.value)} />
              <Input label="Destino" placeholder="LIS" value={form.destination}
                onChange={e => set('destination', e.target.value)} />
            </div>
            <Input label="Horário de partida" type="time" value={form.departureTime}
              onChange={e => set('departureTime', e.target.value)} />
            <ImageGallery
              label="Cartão de embarque"
              pendingImages={pendingImages}
              onAdd={(dataUrl) => setPendingImages(p => [...p, dataUrl])}
              onRemove={(idx) => setPendingImages(p => p.filter((_, i) => i !== idx))}
            />
          </div>
        )}

        {form.category === 'hotel' && (
          <div className="space-y-3 bg-slate-800/40 rounded-xl p-3 border border-white/5">
            <Input label="Nome do hotel" placeholder="Hotel Bairro Alto" value={form.hotelName}
              onChange={e => set('hotelName', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nº de noites" type="number" min="1" placeholder="5" value={form.nights}
                onChange={e => set('nights', e.target.value)} />
              <Input label="Valor / noite" type="number" min="0" step="0.01" placeholder="350,00" value={form.pricePerNight}
                onChange={e => set('pricePerNight', e.target.value)} />
            </div>
          </div>
        )}

        {form.category === 'activity' && (
          <div className="space-y-3 bg-slate-800/40 rounded-xl p-3 border border-white/5">
            <Input label="Local" placeholder="Castelo de São Jorge" value={form.activityLocation}
              onChange={e => set('activityLocation', e.target.value)} />
            <Input label="Horário" type="time" value={form.activityTime}
              onChange={e => set('activityTime', e.target.value)} />
          </div>
        )}

        {form.category === 'car_rental' && (
          <div className="space-y-3 bg-slate-800/40 rounded-xl p-3 border border-white/5">
            <Input label="Empresa" placeholder="Hertz, Localiza..." value={form.carCompany}
              onChange={e => set('carCompany', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Retirada" type="date" value={form.carPickup}
                onChange={e => set('carPickup', e.target.value)} />
              <Input label="Devolução" type="date" value={form.carReturn} min={form.carPickup}
                onChange={e => set('carReturn', e.target.value)} />
            </div>
            <Input label="Valor / dia" type="number" min="0" step="0.01" placeholder="150,00" value={form.pricePerDay}
              onChange={e => set('pricePerDay', e.target.value)} />
            <ImageGallery
              label="Reserva / contrato"
              pendingImages={pendingImages}
              onAdd={(dataUrl) => setPendingImages(p => [...p, dataUrl])}
              onRemove={(idx) => setPendingImages(p => p.filter((_, i) => i !== idx))}
            />
          </div>
        )}

        {form.category === 'misc' && (
          <Select label="Subcategoria" value={form.miscSub} onChange={e => set('miscSub', e.target.value)}>
            {MISC_SUBS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Valor total (R$)" type="number" min="0" step="0.01" placeholder="0,00"
            value={form.amount} onChange={e => set('amount', e.target.value)} error={errors.amount} />
          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Prazo de pagamento" type="date" value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)} />
          <Input label={form.category === 'hotel' ? 'Check-in' : form.category === 'car_rental' ? 'Retirada' : 'Data do evento'}
            type="date" value={form.eventDate}
            onChange={e => set('eventDate', e.target.value)} />
        </div>

        <Textarea label="Observações" placeholder="Confirmação, número de reserva..." value={form.notes}
          onChange={e => set('notes', e.target.value)} />

        <Button type="submit" size="lg" className="w-full mt-4">Salvar Gasto</Button>
      </form>
    </div>
  )
}
