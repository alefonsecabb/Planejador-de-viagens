export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>}
      <input
        {...props}
        className={`bg-slate-700/60 border ${error ? 'border-red-500' : 'border-white/10'} text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 ${className}`}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>}
      <select
        {...props}
        className={`bg-slate-700/60 border ${error ? 'border-red-500' : 'border-white/10'} text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        {children}
      </select>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>}
      <textarea
        {...props}
        rows={3}
        className={`bg-slate-700/60 border ${error ? 'border-red-500' : 'border-white/10'} text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 resize-none ${className}`}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}
