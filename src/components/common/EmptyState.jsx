import Button from './Button'

export default function EmptyState({
  title = 'No Items Found',
  description = 'There are no items matching your request at this moment.',
  actionText,
  onAction,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#E5E5E5] bg-[#F8F8F8]/50 ${className}`}
    >
      {icon ? (
        <div className="text-[#666666] mb-4">{icon}</div>
      ) : (
        <div className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#666666] mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="square"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}

      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
        {title}
      </h3>
      <p className="text-xs text-[#666666] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}