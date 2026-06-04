import { useNavigate } from 'react-router-dom'
import { Plus, Plane, Settings } from 'lucide-react'
import { useTrips } from '../hooks/useTrips'
import { useExpenses } from '../hooks/useExpenses'
import { TripCard } from '../components/TripCard'
import { Button } from '../components/ui/Button'

export default function Home() {
  const navigate = useNavigate()
  const { trips } = useTrips()
  const { allExpenses } = useExpenses()

  const active = trips.filter(t => t.status !== 'completed')
  const done = trips.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Plane size={20} className="text-blue-400" />
          <h1 className="text-lg font-bold">Viagens</h1>
        </div>
        <button onClick={() => navigate('/settings')} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <Settings size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <Plane size={36} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Nenhuma viagem ainda</h2>
            <p className="text-sm text-slate-400 max-w-xs">Cadastre sua primeira viagem e comece a controlar seus gastos</p>
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

      <div className="fixed bottom-6 right-4">
        <Button onClick={() => navigate('/trips/new')} size="lg" className="shadow-2xl shadow-blue-900/50 gap-2">
          <Plus size={20} />
          Nova Viagem
        </Button>
      </div>
    </div>
  )
}
