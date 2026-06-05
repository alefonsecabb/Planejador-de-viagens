import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Plane, Settings, Upload } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { useTrips } from '../hooks/useTrips'
import { useExpenses } from '../hooks/useExpenses'
import { tripsStore, legsStore, expensesStore } from '../utils/storage'
import { TripCard } from '../components/TripCard'
import { Button } from '../components/ui/Button'

export default function Home() {
  const navigate = useNavigate()
  const { trips } = useTrips()
  const { allExpenses } = useExpenses()
  const fileRef = useRef(null)
  const [importError, setImportError] = useState(false)

  function handleImportFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const { trip, legs = [], expenses = [] } = JSON.parse(ev.target.result)
        if (!trip?.name) throw new Error('invalid')

        const newTripId = uuid()
        tripsStore.save([...tripsStore.getAll(), {
          ...trip, id: newTripId, createdAt: new Date().toISOString().split('T')[0]
        }])

        const legIdMap = {}
        const newLegs = legs.map((leg, i) => {
          const newId = uuid()
          legIdMap[leg.id] = newId
          return { ...leg, id: newId, tripId: newTripId, order: i }
        })
        legsStore.save([...legsStore.getAll(), ...newLegs])

        const newExpenses = expenses.map(exp => ({
          ...exp, id: uuid(), tripId: newTripId,
          legId: exp.legId ? (legIdMap[exp.legId] ?? null) : null,
          createdAt: new Date().toISOString().split('T')[0],
        }))
        expensesStore.save([...expensesStore.getAll(), ...newExpenses])

        navigate(`/trips/${newTripId}`)
      } catch {
        setImportError(true)
        setTimeout(() => setImportError(false), 3000)
      }
    }
    reader.readAsText(file)
  }

  const active = trips.filter(t => t.status !== 'completed')
  const done = trips.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />

      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane size={22} className="text-blue-400" />
            <h1 className="text-xl font-bold">Viagens</h1>
          </div>
          <div className="flex gap-1">
            <button onClick={() => fileRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white" title="Importar viagem">
              <Upload size={22} />
            </button>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <Settings size={22} />
            </button>
          </div>
        </div>
      </div>

      {importError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500/30 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          ❌ Arquivo inválido
        </div>
      )}

      <div className="p-4 space-y-4 pb-28">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <Plane size={40} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Nenhuma viagem ainda</h2>
            <p className="text-base text-slate-400 max-w-xs">Cadastre sua primeira viagem e comece a controlar seus gastos</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Em planejamento / andamento</h2>
                <div className="space-y-3">
                  {active.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expenses={allExpenses.filter(e => e.tripId === trip.id)}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
            {done.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Concluídas</h2>
                <div className="space-y-3">
                  {done.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expenses={allExpenses.filter(e => e.tripId === trip.id)}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-6 right-4 safe-bottom">
        <Button onClick={() => navigate('/trips/new')} size="lg" className="shadow-2xl shadow-blue-900/50 gap-2">
          <Plus size={20} />
          Nova Viagem
        </Button>
      </div>
    </div>
  )
}
