import { useTranslation } from 'react-i18next'
import { STATUS_CONFIG } from '../../constants/commerce'

/**
 * Component OrderStatusBadge: Hiển thị huy hiệu trạng thái đơn hàng dạng viên thuốc (Pill)
 */
export default function OrderStatusBadge({ status = 'PENDING', className = '' }) {
  const { t } = useTranslation()
  const normalized = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[normalized] || {
    label: normalized,
    badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  }

  const statusKeyMap = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPING: 'shipping',
    COMPLETED: 'completed',
    DELIVERED: 'completed',
    CANCELLED: 'cancelled',
  }

  const transKey = statusKeyMap[normalized]
  const displayLabel = transKey ? t(`seller.status.${transKey}`, config.label) : config.label

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[5.5rem] px-2.5 shrink-0 py-1 text-[11px] font-medium font-mono rounded-[2px] tracking-wider select-none text-center ${config.badgeClass} ${className}`}
    >
      <span>{displayLabel}</span>
    </span>
  )
}
