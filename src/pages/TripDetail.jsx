import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Send, Trash2, Edit3, MessageSquare } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { useExpenses } from '../hooks/useExpenses'
import { useWhatsApp } from '../hooks/useWhatsApp'
import { BudgetBar } from '../components/BudgetBar'
import { AlertBanner } from '../components/AlertBanner'
import { ExpenseItem } from '../components/ExpenseItem'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { formatDate, formatCurrency } from '../utils/dateUtils'
import { buildAlertMessage, buildSummaryMessage } from '../utils/callmebot'
import { contactsStore } from '../utils/storage'

const CAT_CONFIG = {
  flight:     { label: 'Passagens', icon: '✈️' },
  hotel:      { label: 'Hospedagem', icon: '🏨' },
  activity:   { label: 'Passeios', icon: '🎡' },
  car_rental: { label: 'Aluguel de Carro', icon: '🚗' },
  misc:       { label: 'Alimentação / Misc', icon: '🍽️' },
}

const STATUS_COLOR = { planning: 'blue', ongoing: 'green', completed: 'gray' }
const STATUS_LABEL = { planning: 'Planejando', ongoing: 'Em viagem', completed: 'Concluída' }

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip, deleteTrip, updateTrip } = useTrips()
  const { expenses, updateExpense, deleteExpense } = useExpenses(id)
  const { broadcast, sending } = useWhatsApp()
  const [whatsappModal, setWhatsappModal] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)

  const trip = getTrip(id)
  if (!trip) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <p className="text-slate-400">Viagem não encontrada.</p>
    </div>
  )

  const hasContacts = contactsStore.getAll().length > 0

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setWhatsappModal(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-green-400"
              title="Enviar WhatsApp"
            >
              <MessageSquare size={20} />
            </button>
            <button onClick={() => setDeleteModal(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-red-400">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-28">
        {/* Trip header info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-white leading-tight">{trip.name}</h1>
            <Badge color={STATUS_COLOR[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
          </div>
          <p className="text-sm text-slate-400 mb-1">📍 {trip.destination}</p>
          <p className="text-xs text-slate-500">📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}</p>
        </div>

        {/* Status quick-change */}
        <div className="flex gap-2">
          {Object.entries(STATUS_LABEL).map(([s, l]) => (
            <button
              key={s}
              onClick={() => updateTrip(trip.id, { status: s })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${trip.status === s ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
            >
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

        {/* Expenses by category */}
        {Object.entries(CAT_CONFIG).map(([cat, { label, icon }]) => {
          const items = expenses.filter(e => e.category === cat)
          if (!items.length) return null
          const catTotal = items.reduce((s, e) => s + (e.amount || 0), 0)
          return (
            <div key={cat} className="bg-slate-800/80 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                </div>
                <span className="text-sm font-bold text-white">{formatCurrency(catTotal, trip.currency)}</span>
              </div>
              {items.map(e => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  onDelete={(expId) => deleteExpense(expId)}
                  onStatusChange={(expId, status) => updateExpense(expId, { status })}
                />
              ))}
            </div>
          )
        })}

        {expenses.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            Nenhum gasto lançado ainda.
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-4">
        <Button onClick={() => navigate(`/trips/${id}/expenses/new`)} size="lg" className="shadow-2xl shadow-blue-900/50 gap-2">
          <Plus size={20} />
          Novo Gasto
        </Button>
      </div>

      {/* WhatsApp Modal */}
      <Modal open={whatsappModal} onClose={() => { setWhatsappModal(false); setSendResult(null) }} title="Enviar via WhatsApp">
        {!hasContacts ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400 mb-4">Nenhum contato configurado. Adicione seus contatos nas Configurações.</p>
            <Button onClick={() => navigate('/settings')}>Ir para Configurações</Button>
          </div>
        ) : sendResult ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-emerald-400 font-semibold">✅ {sendResult.sent} mensagem(s) enviada(s)</p>
            {sendResult.errors > 0 && <p className="text-red-400 text-sm">{sendResult.errors} erro(s)</p>}
            <Button variant="secondary" onClick={() => { setWhatsappModal(false); setSendResult(null) }}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Escolha o que enviar para os contatos cadastrados:</p>
            <Button className="w-full gap-2" onClick={() => handleSendAlert('alerts')} disabled={sending}>
              <Send size={16} />
              Enviar alertas de prazo
            </Button>
            <Button variant="secondary" className="w-full gap-2" onClick={() => handleSendAlert('summary')} disabled={sending}>
              <Send size={16} />
              Enviar resumo da viagem
            </Button>
            {sending && <p className="text-xs text-slate-400 text-center">Enviando...</p>}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Excluir viagem?">
        <p className="text-sm text-slate-400 mb-5">Todos os gastos desta viagem também serão excluídos. Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
