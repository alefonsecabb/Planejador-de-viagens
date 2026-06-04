export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/10',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
