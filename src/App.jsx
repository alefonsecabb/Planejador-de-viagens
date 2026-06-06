import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NewTrip from './pages/NewTrip'
import TripDetail from './pages/TripDetail'
import NewExpense from './pages/NewExpense'
import EditExpense from './pages/EditExpense'
import Settings from './pages/Settings'
import ImportTrip from './pages/ImportTrip'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips/new" element={<NewTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trips/:id/expenses/new" element={<NewExpense />} />
        <Route path="/trips/:id/expenses/:expenseId/edit" element={<EditExpense />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/import" element={<ImportTrip />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
