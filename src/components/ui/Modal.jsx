import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-slate-900 rounded-t-3xl border border-white/10 p-6 safe-bottom max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
