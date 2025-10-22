export function Card({ children, className = '', onClick }) {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
        isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
