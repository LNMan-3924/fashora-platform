import { STATUS_CONFIG } from './orderConstants'

/**
 * Component OrderStatusNotice: Khung thông báo tiến độ đơn hàng
 * Tự động chọn màu sắc, icon và lời nhắn giải thích tương ứng với trạng thái (Pending, Confirmed, Shipping, v.v.)
 *
 * Props:
 * - status: Trạng thái đơn hàng ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED')
 * - className: Các class css bổ sung (nếu có)
 */
export default function OrderStatusNotice({ status = 'PENDING', className = '' }) {
  const rawStatus = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const StatusIcon = config.icon

  return (
    <div
      className={`px-4 sm:px-6 py-3 border text-xs sm:text-sm flex items-center space-x-2.5 ${config.noticeBox} ${className}`}
    >
      <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span className="font-normal leading-relaxed">{config.noticeText}</span>
    </div>
  )
}

