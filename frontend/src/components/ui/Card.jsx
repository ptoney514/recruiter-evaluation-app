export function Card({ children, className = '', onClick, glass = false }) {
  const isClickable = !!onClick

  const baseStyles = glass
    ? 'bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-300'
    : 'bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300'

  const hoverStyles = isClickable
    ? glass
      ? 'cursor-pointer hover:shadow-3xl hover:bg-white/80 hover:scale-[1.02]'
      : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'
    : ''

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  )
}
