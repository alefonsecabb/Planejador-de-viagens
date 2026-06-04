const colorMap = {
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gray: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

export function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  )
}
