/**
 * Component OrderStatusBadge: Hiển thị huy hiệu trạng thái đơn hàng dạng viên thuốc (Pill)
 * Kèm chấm tròn màu sắc nhận diện đặc trưng (Chấm màu + Nền + Chữ tương ứng).
 * 
 * Tái sử dụng được cho tất cả các trang quản lý người bán (Dashboard, Orders, OrderDetail).
 *
 * @param {string} status - Trạng thái đơn hàng ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED')
 * @param {string} className - Class tùy biến bổ sung nếu cần
 */
export default function OrderStatusBadge({ status = 'PENDING', className = '' }) {
  // Chuẩn hóa trạng thái về chữ hoa
  const normalized = String(status || 'PENDING').toUpperCase()

  // Cấu hình màu sắc badge cho từng trạng thái
  const config = {
    PENDING: {
      label: 'PENDING',
      pillClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    CONFIRMED: {
      label: 'CONFIRMED',
      pillClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
    },
    PROCESSING: {
      label: 'CONFIRMED',
      pillClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
    },
    SHIPPING: {
      label: 'SHIPPING',
      pillClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    },
    COMPLETED: {
      label: 'COMPLETED',
      pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    },
    CANCELLED: {
      label: 'CANCELLED',
      pillClass: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    },
  }[normalized] || {
    label: normalized,
    pillClass: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-24 shrink-0 py-1 text-[11px] font-medium font-mono border rounded-[2px] tracking-wider select-none text-center ${config.pillClass} ${className}`}
    >
      <span>{config.label}</span>
    </span>
  )
}

