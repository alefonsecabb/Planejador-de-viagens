import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, MessageSquare, MapPin, Send, X, Share2, Pencil, ChevronUp, ChevronDown } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { useExpenses } from '../hooks/useExpenses'
import { useLegs } from '../hooks/useLegs'
import { useWhatsApp } from '../hooks/useWhatsApp'
import { BudgetBar } from '../components/BudgetBar'
import { AlertBanner } from '../components/AlertBanner'
import { ExpenseItem } from '../components/ExpenseItem'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input, Select } from '../components/ui/Input'
import { formatDate, formatCurrency } from '../utils/dateUtils'
import { buildAlertMessage, buildSummaryMessage } from '../utils/callmebot'
import { buildShareUrl } from '../utils/shareUtils'
import { contactsStore } from '../utils/storage'
import { useImages } from '../hooks/useImages'

const CAT_CONFIG = {
  flight:     { label: 'Passagens', icon: '✈️' },
  hotel:      { label: 'Hospedagem', icon: '🏨' },
  activity:   { label: 'Passeios', icon: '🎡' },
  car_rental: { label: 'Aluguel de Carro', icon: '🚗' },
  misc:       { label: 'Alimentação / Misc', icon: '🍽️' },
}

const STATUS_COLOR = { planning: 'blue', ongoing: 'green', completed: 'gray' }
const STATUS_LABEL = { planning: 'Planejando', ongoing: 'Em viagem', completed: 'Concluída' }

const CURRENCIES = ['BRL', 'USD', 'EUR', 'ARS', 'CLP', 'PEN', 'COP', 'GBP']

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip, deleteTrip, updateTrip } = useTrips()
  const { expenses, updateExpense, deleteExpense } = useExpenses(id)
  const { legs, addLeg, updateLeg, deleteLeg } = useLegs(id)
  const { broadcast, sending } = useWhatsApp()

  const [shareToast, setShareToast] = useState(false)
  const [whatsappModal, setWhatsappModal] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)

  // Add/Edit leg
  const [addLegModal, setAddLegModal] = useState(false)
  const [newLeg, setNewLeg] = useState({ name: '', startDate: '', endDate: '' })
  const [legErrors, setLegErrors] = useState({})
  const [editingLeg, setEditingLeg] = useState(null)
  const [editLegForm, setEditLegForm] = useState({ name: '', startDate: '', endDate: '' })
  const [editLegErrors, setEditLegErrors] = useState({})

  // Edit flight inline
  const [editingFlight, setEditingFlight] = useState(null)
  const [editFlightForm, setEditFlightForm] = useState({ airline: '', flightNumber: '', origin: '', destination: '', departureTime: '' })

  // Edit trip
  const [editTripModal, setEditTripModal] = useState(false)
  const [editTripForm, setEditTripForm] = useState({ name: '', budget: '', currency: 'BRL' })

  const trip = getTrip(id)
  if (!trip) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <p className="text-slate-400">Viagem não encontrada.</p>
    </div>
  )

  const hasContacts = contactsStore.getAll().length > 0

  function syncTripDates(updatedLegs) {
    if (!updatedLegs.length) return
    const sorted = [...updatedLegs].sort((a, b) => (a.startDate || '') < (b.startDate || '') ? -1 : 1)
    updateTrip(trip.id, {
      startDate: sorted[0].startDate,
      endDate: sorted[sorted.length - 1].endDate || sorted[sorted.length - 1].startDate,
      destination: updatedLegs.map(l => l.name).join(' → '),
    })
  }

  async function handleShare() {
    const payload = JSON.stringify({ trip, legs, expenses })
    const safeName = trip.name.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').trim() || 'viagem'
    const file = new File([payload], `${safeName}.json`, { type: 'application/json' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: trip.name, files: [file] })
    } else if (navigator.share) {
      const url = buildShareUrl(trip, legs, expenses)
      await navigator.share({ title: trip.name, url })
    } else {
      const url = buildShareUrl(trip, legs, expenses)
      await navigator.clipboard.writeText(url)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 3000)
    }
  }

  async function handleSendAlert(type) {
    const msg = type === 'alerts'
      ? buildAlertMessage(trip.name, expenses)
      : buildSummaryMessage(trip, expenses)
    const result = await broadcast(msg)
    setSendResult(result)
  }

  function handleDelete() {
    deleteTrip(trip.id)
    navigate('/')
  }

  function handleAddLeg() {
    const errs = {}
    if (!newLeg.name.trim()) errs.name = 'Nome obrigatório'
    if (!newLeg.startDate) errs.startDate = 'Data obrigatória'
    if (Object.keys(errs).length) { setLegErrors(errs); return }
    const added = addLeg({ tripId: id, name: newLeg.name, startDate: newLeg.startDate, endDate: newLeg.endDate || newLeg.startDate, order: legs.length })
    setNewLeg({ name: '', startDate: '', endDate: '' })
    setLegErrors({})
    setAddLegModal(false)
    syncTripDates([...legs, added])
  }

  function openEditLeg(leg) {
    setEditingLeg(leg)
    setEditLegForm({ name: leg.name, startDate: leg.startDate, endDate: leg.endDate || '' })
    setEditLegErrors({})
  }

  function handleSaveEditLeg() {
    const errs = {}
    if (!editLegForm.name.trim()) errs.name = 'Nome obrigatório'
    if (!editLegForm.startDate) errs.startDate = 'Data obrigatória'
    if (Object.keys(errs).length) { setEditLegErrors(errs); return }
    updateLeg(editingLeg.id, {
      name: editLegForm.name,
      startDate: editLegForm.startDate,
      endDate: editLegForm.endDate || editLegForm.startDate,
    })
    const updatedLegs = legs.map(l => l.id === editingLeg.id
      ? { ...l, name: editLegForm.name, startDate: editLegForm.startDate, endDate: editLegForm.endDate || editLegForm.startDate }
      : l
    )
    syncTripDates(updatedLegs)
    setEditingLeg(null)
  }

  function handleDeleteLeg(legId) {
    deleteLeg(legId)
    const updatedLegs = legs.filter(l => l.id !== legId)
    syncTripDates(updatedLegs)
  }

  function moveLeg(leg, direction) {
    const sorted = [...legs]
    const idx = sorted.findIndex(l => l.id === leg.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    updateLeg(sorted[idx].id, { order: sorted[swapIdx].order })
    updateLeg(sorted[swapIdx].id, { order: sorted[idx].order })
  }

  function openEditFlight(f) {
    setEditingFlight(f)
    setEditFlightForm({
      airline: f.details?.airline || '',
      flightNumber: f.details?.flightNumber || '',
      origin: f.details?.origin || '',
      destination: f.details?.destination || '',
      departureTime: f.details?.departureTime || '',
    })
  }

  function handleSaveEditFlight() {
    updateExpense(editingFlight.id, {
      details: { ...editingFlight.details, ...editFlightForm },
    })
    setEditingFlight(null)
  }

  function openEditTrip() {
    setEditTripForm({ name: trip.name, budget: String(trip.budget || ''), currency: trip.currency || 'BRL' })
    setEditTripModal(true)
  }

  function handleSaveEditTrip() {
    updateTrip(trip.id, {
      name: editTripForm.name.trim() || trip.name,
      budget: parseFloat(editTripForm.budget) || 0,
      currency: editTripForm.currency,
    })
    setEditTripModal(false)
  }

  // Group expenses: by leg, then "Geral" for those without legId
  const legExpenses = (legId) => expenses.filter(e => e.legId === legId)
  const generalExpenses = expenses.filter(e => !e.legId)

  function FlightImages({ expenseId }) {
    const { images } = useImages(expenseId)
    const [viewing, setViewing] = useState(null)
    if (!images.length) return null
    return (
      <div className="ml-9 mt-2 flex gap-2 flex-wrap">
        {images.map(img => (
          <button key={img.id} type="button" onClick={() => setViewing(img.dataUrl)}
            className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 active:opacity-80">
            <img src={img.dataUrl} className="w-full h-full object-cover" alt="Cartão de embarque" />
          </button>
        ))}
        {viewing && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setViewing(null)}>
            <div className="safe-top flex justify-end px-4 pt-4">
              <button className="p-2 rounded-full bg-white/10 text-white"><X size={22} /></button>
            </div>
            <div className="flex-1 flex items-center justify-center p-3">
              <img src={viewing} className="max-w-full max-h-full object-contain rounded-xl" alt="Cartão de embarque" />
            </div>
          </div>
        )}
      </div>
    )
  }

  function ExpenseSection({ items, currency }) {
    if (!items.length) return null
    return (
      <div className="space-y-3">
        {Object.entries(CAT_CONFIG).map(([cat, { label, icon }]) => {
          const catItems = items.filter(e => e.category === cat)
          if (!catItems.length) return null
          const catTotal = catItems.reduce((s, e) => s + (e.amount || 0), 0)
          return (
            <div key={cat} className="bg-slate-800/80 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <h3 className="text-base font-semibold text-white">{label}</h3>
                </div>
                <span className="text-base font-bold text-white">{formatCurrency(catTotal, currency)}</span>
              </div>
              {catItems.map(e => (
                <ExpenseItem key={e.id} expense={e}
                  onDelete={deleteExpense}
                  onStatusChange={(expId, status) => updateExpense(expId, { status })} />
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex gap-1">
            <button onClick={handleShare}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-blue-400" title="Compartilhar viagem">
              <Share2 size={22} />
            </button>
            <button onClick={() => setWhatsappModal(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-green-400" title="Enviar WhatsApp">
              <MessageSquare size={22} />
            </button>
            <button onClick={() => setDeleteModal(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-red-400">
              <Trash2 size={22} />
            </button>
          </div>
        </div>
      </div>

      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-700 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          ✅ Link copiado!
        </div>
      )}

      <div className="p-4 space-y-4 pb-28">
        {/* Trip header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white leading-tight truncate">{trip.name}</h1>
              <button onClick={openEditTrip}
                className="shrink-0 p-1 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-colors">
                <Pencil size={15} />
              </button>
            </div>
            <Badge color={STATUS_COLOR[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
          </div>
          {legs.length > 0 ? (
            <p className="text-base text-slate-400 mb-1">📍 {legs.map(l => l.name).join(' → ')}</p>
          ) : (
            <p className="text-base text-slate-400 mb-1">📍 {trip.destination}</p>
          )}
          <p className="text-sm text-slate-500">📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}</p>
        </div>

        {/* Status quick-change */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_LABEL).map(([s, l]) => (
            <button key={s} onClick={() => updateTrip(trip.id, { status: s })}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${trip.status === s ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Budget bar */}
        {trip.budget > 0 && (
          <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-4">
            <BudgetBar budget={trip.budget} expenses={expenses} currency={trip.currency} />
          </div>
        )}

        {/* Alert banners */}
        <AlertBanner expenses={expenses} />

        {/* Itinerary section */}
        {legs.length > 0 && (
          <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin size={17} className="text-blue-400" />
                Itinerário
              </h2>
              {legs.length < 10 && (
                <button onClick={() => setAddLegModal(true)}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <Plus size={16} />
                  Destino
                </button>
              )}
            </div>
            <div className="space-y-2">
              {legs.map((leg, idx) => {
                const legTotal = legExpenses(leg.id).reduce((s, e) => s + (e.amount || 0), 0)
                const legFlights = expenses.filter(e => e.legId === leg.id && e.category === 'flight')
                return (
                  <div key={leg.id} className="py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      {/* Reorder arrows */}
                      <div className="flex flex-col shrink-0">
                        <button onClick={() => moveLeg(leg, 'up')}
                          className={`p-0.5 rounded transition-colors ${idx === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:text-blue-400 hover:bg-blue-500/10'}`}>
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => moveLeg(leg, 'down')}
                          className={`p-0.5 rounded transition-colors ${idx === legs.length - 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:text-blue-400 hover:bg-blue-500/10'}`}>
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-300">
                          {idx + 1}
                        </div>
                        {(idx < legs.length - 1) && <div className="w-px h-4 bg-blue-500/20 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-white truncate">{leg.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatDate(leg.startDate)}{leg.endDate && leg.endDate !== leg.startDate ? ` → ${formatDate(leg.endDate)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {legTotal > 0 && <span className="text-sm font-semibold text-slate-300 mr-1">{formatCurrency(legTotal, trip.currency)}</span>}
                        <button onClick={() => openEditLeg(leg)}
                          className="p-1 rounded-lg hover:bg-blue-500/20 text-slate-600 hover:text-blue-400 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteLeg(leg.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {legFlights.map(f => (
                      <div key={f.id}>
                        <div className="ml-14 mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <span>✈️</span>
                          <span className="font-medium text-slate-300">
                            {[f.details?.airline, f.details?.flightNumber].filter(Boolean).join(' ')}
                          </span>
                          {f.details?.origin && f.details?.destination && (
                            <span>{f.details.origin} → {f.details.destination}</span>
                          )}
                          {f.details?.departureTime && (
                            <span className="text-slate-500">· {f.details.departureTime}</span>
                          )}
                          <button onClick={() => openEditFlight(f)}
                            className="ml-1 p-0.5 rounded hover:bg-blue-500/20 text-slate-600 hover:text-blue-400 transition-colors">
                            <Pencil size={11} />
                          </button>
                        </div>
                        <FlightImages expenseId={f.id} />
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Expenses grouped by leg */}
        {legs.map(leg => {
          const items = legExpenses(leg.id)
          if (!items.length) return null
          return (
            <div key={leg.id}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin size={13} className="text-blue-400" />
                {leg.name}
              </h3>
              <ExpenseSection items={items} currency={trip.currency} />
            </div>
          )
        })}

        {/* General expenses (no leg) */}
        {generalExpenses.length > 0 && (
          <div>
            {legs.length > 0 && (
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Toda a viagem
              </h3>
            )}
            <ExpenseSection items={generalExpenses} currency={trip.currency} />
          </div>
        )}

        {expenses.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-base">
            Nenhum gasto lançado ainda.
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-4 safe-bottom">
        <Button onClick={() => navigate(`/trips/${id}/expenses/new`)} size="lg" className="shadow-2xl shadow-blue-900/50 gap-2">
          <Plus size={20} />
          Novo Gasto
        </Button>
      </div>

      {/* Add Leg Modal */}
      <Modal open={addLegModal} onClose={() => { setAddLegModal(false); setLegErrors({}) }} title="Novo Destino">
        <div className="space-y-4">
          <Input label="Nome do destino" placeholder="Ex: Paris, Roma..." value={newLeg.name}
            onChange={e => { setNewLeg(l => ({ ...l, name: e.target.value })); setLegErrors(er => ({ ...er, name: undefined })) }}
            error={legErrors.name} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Chegada" type="date" value={newLeg.startDate}
              onChange={e => {
                const v = e.target.value
                setNewLeg(l => ({ ...l, startDate: v, endDate: l.endDate || v }))
                setLegErrors(er => ({ ...er, startDate: undefined }))
              }}
              error={legErrors.startDate} />
            <Input label="Partida" type="date" value={newLeg.endDate} min={newLeg.startDate}
              onChange={e => setNewLeg(l => ({ ...l, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddLegModal(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleAddLeg}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Leg Modal */}
      <Modal open={!!editingLeg} onClose={() => setEditingLeg(null)} title="Editar Destino">
        <div className="space-y-4">
          <Input label="Nome do destino" placeholder="Ex: Paris, Roma..." value={editLegForm.name}
            onChange={e => { setEditLegForm(f => ({ ...f, name: e.target.value })); setEditLegErrors(er => ({ ...er, name: undefined })) }}
            error={editLegErrors.name} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Chegada" type="date" value={editLegForm.startDate}
              onChange={e => {
                const v = e.target.value
                setEditLegForm(f => ({ ...f, startDate: v, endDate: f.endDate || v }))
                setEditLegErrors(er => ({ ...er, startDate: undefined }))
              }}
              error={editLegErrors.startDate} />
            <Input label="Partida" type="date" value={editLegForm.endDate} min={editLegForm.startDate}
              onChange={e => setEditLegForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingLeg(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSaveEditLeg}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Flight Modal */}
      <Modal open={!!editingFlight} onClose={() => setEditingFlight(null)} title="Editar Voo">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Companhia" placeholder="TAP Air, LATAM..." value={editFlightForm.airline}
              onChange={e => setEditFlightForm(f => ({ ...f, airline: e.target.value }))} />
            <Input label="Nº do voo" placeholder="TP084" value={editFlightForm.flightNumber}
              onChange={e => setEditFlightForm(f => ({ ...f, flightNumber: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Origem" placeholder="GRU" value={editFlightForm.origin}
              onChange={e => setEditFlightForm(f => ({ ...f, origin: e.target.value }))} />
            <Input label="Destino" placeholder="LIS" value={editFlightForm.destination}
              onChange={e => setEditFlightForm(f => ({ ...f, destination: e.target.value }))} />
          </div>
          <Input label="Horário de partida" type="time" value={editFlightForm.departureTime}
            onChange={e => setEditFlightForm(f => ({ ...f, departureTime: e.target.value }))} />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingFlight(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSaveEditFlight}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal open={editTripModal} onClose={() => setEditTripModal(false)} title="Editar Viagem">
        <div className="space-y-4">
          <Input label="Nome da viagem" placeholder="Ex: Europa 2026" value={editTripForm.name}
            onChange={e => setEditTripForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Orçamento total" type="number" min="0" step="0.01" placeholder="0,00"
                value={editTripForm.budget}
                onChange={e => setEditTripForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <Select label="Moeda" value={editTripForm.currency}
              onChange={e => setEditTripForm(f => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditTripModal(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSaveEditTrip}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal open={whatsappModal} onClose={() => { setWhatsappModal(false); setSendResult(null) }} title="Enviar via WhatsApp">
        {!hasContacts ? (
          <div className="text-center py-4">
            <p className="text-base text-slate-400 mb-4">Nenhum contato configurado. Adicione nas Configurações.</p>
            <Button onClick={() => navigate('/settings')}>Ir para Configurações</Button>
          </div>
        ) : sendResult ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-emerald-400 font-semibold text-base">✅ {sendResult.sent} mensagem(s) enviada(s)</p>
            {sendResult.errors > 0 && <p className="text-red-400">{sendResult.errors} erro(s)</p>}
            <Button variant="secondary" onClick={() => { setWhatsappModal(false); setSendResult(null) }}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-base text-slate-400">Escolha o que enviar:</p>
            <Button className="w-full gap-2" onClick={() => handleSendAlert('alerts')} disabled={sending}>
              <Send size={16} />Enviar alertas de prazo
            </Button>
            <Button variant="secondary" className="w-full gap-2" onClick={() => handleSendAlert('summary')} disabled={sending}>
              <Send size={16} />Enviar resumo da viagem
            </Button>
            {sending && <p className="text-sm text-slate-400 text-center">Enviando...</p>}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Excluir viagem?">
        <p className="text-base text-slate-400 mb-5">Todos os gastos e destinos serão excluídos. Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
