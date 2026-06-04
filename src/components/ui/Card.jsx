export function Card({ children, className = '', onClick }) {
  const base = 'bg-slate-800/80 border border-white/10 rounded-2xl p-4'
  return (
    <div className={`${base} ${onClick ? 'cursor-pointer hover:bg-slate-700/80 transition-colors' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
