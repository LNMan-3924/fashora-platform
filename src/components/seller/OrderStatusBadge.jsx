import { STATUS_CONFIG } from '../../constants/commerce'

/**
 * Component OrderStatusBadge: Hiển thị huy hiệu trạng thái đơn hàng dạng viên thuốc (Pill)
 * Tái sử dụng bảng cấu hình tập trung STATUS_CONFIG từ src/constants/commerce.js (Single Source of Truth)
 *
 * @param {string} status - Trạng thái đơn hàng ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED')
 * @param {string} className - Class tùy biến bổ sung nếu cần
 */
export default function OrderStatusBadge({ status = 'PENDING', className = '' }) {
  const normalized = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[normalized] || {
    label: normalized,
    badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-24 shrink-0 py-1 text-[11px] font-medium font-mono rounded-[2px] tracking-wider select-none text-center ${config.badgeClass} ${className}`}
    >
      <span>{config.label}</span>
    </span>
  )
}
