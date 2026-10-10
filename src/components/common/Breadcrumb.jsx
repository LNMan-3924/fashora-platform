import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex items-center flex-wrap gap-2 text-[12px] uppercase tracking-wider text-[#666666]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-[#E5E5E5] select-none">/</span>}
              {isLast || !item.to ? (
                <span className="text-[#111111] font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-[#111111] transition-colors duration-150"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}