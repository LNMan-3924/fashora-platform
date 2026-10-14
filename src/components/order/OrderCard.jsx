import { Copy, ArrowRight } from 'lucide-react'
import { Button, Badge } from '../common'
import OrderStatusNotice from './OrderStatusNotice'
import {
  STATUS_CONFIG,
  FALLBACK_IMAGE,
  handleImageError,
  formatVND,
  formatDate,
} from './orderConstants'

/**
 * Component OrderCard: Thẻ hiển thị một đơn hàng trong danh sách My Orders
 *
 * Tính năng:
 * - Header thông tin mã đơn, ngày đặt, phương thức thanh toán, badge trạng thái.
 * - Khung thông báo tiến độ (OrderStatusNotice).
 * - Danh sách sản phẩm kèm ảnh có cơ chế tự động xử lý ảnh lỗi (fallback.png).
 * - Chân thẻ hiển thị tổng tiền, nút hủy đơn (Cancel Order), nút xem chi tiết (View Details).
 * - Bố cục responsive toàn diện trên Mobile, Tablet và Desktop.
 *
 * Props:
 * - order: Dữ liệu chi tiết của đơn hàng
 * - onCancel: Callback khi bấm nút hủy đơn
 * - onViewDetails: Callback khi bấm nút xem chi tiết
 * - onCopyOrderNumber: Callback khi bấm sao chép mã đơn
 */
export default function OrderCard({
  order,
  onCancel,
  onViewDetails,
  onCopyOrderNumber,
}) {
  if (!order) return null

  const rawStatus = (order.status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const isCancelled = rawStatus === 'CANCELLED'
  const canCancel =
    rawStatus === 'PENDING' ||
    rawStatus === 'CONFIRMED' ||
    rawStatus === 'PROCESSING'

  return (
    <article
      className={`bg-white border border-neutral-200 transition-shadow duration-200 hover:shadow-xs ${isCancelled ? 'opacity-90' : ''
        }`}
    >
      {/* 1. THANH TIÊU ĐỀ ĐƠN HÀNG (HEADER STRIP) */}
      <div className="px-4 sm:px-6 py-4 bg-stone-50/80 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-neutral-600">
          <span className="font-semibold text-black text-xs sm:text-sm">
            SHOP: {order.shopName || 'M STUDIO'}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="font-bold text-black tracking-wide text-xs sm:text-sm inline-flex items-center gap-1.5">
            ORDER: {order.orderNumber}
            {onCopyOrderNumber && (
              <button
                type="button"
                onClick={() => onCopyOrderNumber(order.orderNumber)}
                title="Copy order number"
                className="text-neutral-400 hover:text-black cursor-pointer p-0.5"
                aria-label="Copy order number"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-500 font-sans text-xs">
            Placed on {formatDate(order.createdAt)}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-700 text-xs">
            PAYMENT: {order.paymentMethod || 'COD'}
          </span>
        </div>

        <div>
          <Badge
            variant={rawStatus.toLowerCase() === 'processing' ? 'confirmed' : rawStatus.toLowerCase()}
            className={config.badgeClass}
          >
            {config.label}
          </Badge>
        </div>
      </div>

      {/* 2. KHUNG THÔNG BÁO TIẾN ĐỘ THEO TRẠNG THÁI */}
      <OrderStatusNotice status={rawStatus} />

      {/* 3. DANH SÁCH CÁC SẢN PHẨM TRONG ĐƠN (LINE ITEMS) */}
      <div className="divide-y divide-neutral-100">
        {order.items?.map((item, idx) => (
          <div
            key={item.id ? `${item.id}-${idx}` : idx}
            className="p-4 sm:p-6 flex items-start gap-4 sm:gap-5"
          >
            {/* Ảnh sản phẩm kèm cơ chế bắt lỗi ảnh tự động */}
            <img
              src={item.image || FALLBACK_IMAGE}
              alt={item.name}
              onError={handleImageError}
              className={`w-20 h-28 sm:w-24 sm:h-32 object-cover border border-neutral-200 shrink-0 bg-stone-100 ${isCancelled ? 'opacity-80' : ''
                }`}
            />

            {/* Chi tiết tên, phân loại size/màu và số lượng */}
            <div className="flex-grow min-w-0 py-0.5 sm:py-1">
              <h3 className="text-sm sm:text-base font-medium tracking-tight text-neutral-900 truncate">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Size: {item.selectedSize || 'Standard'} • {item.selectedColor || 'Standard'}
              </p>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                Quantity: {item.quantity || 1}
              </p>
            </div>

            {/* Đơn giá / Thành tiền */}
            <div className="text-right py-0.5 sm:py-1 shrink-0 font-mono">
              <p
                className={`text-sm sm:text-base font-semibold ${isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900'
                  }`}
              >
                {formatVND((item.price || 0) * (item.quantity || 1))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. CHÂN THẺ ĐƠN HÀNG (FOOTER VỚI TỔNG TIỀN & CÁC NÚT THAO TÁC) */}
      <div className="px-4 sm:px-6 py-4 bg-stone-50/50 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs sm:text-sm">
          {order.shippingFee > 0 && (
            <div className="text-neutral-500 text-xs mb-0.5">
              Shipping:{' '}
              <span className="font-mono text-neutral-700 font-medium">
                {formatVND(order.shippingFee)}
              </span>
            </div>
          )}
          <div>
            <span className="text-neutral-500 uppercase tracking-wider text-[11px] font-medium">
              TOTAL AMOUNT (COD):
            </span>
            <span
              className={`ml-2 font-mono text-base sm:text-xl font-bold ${isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900'
                }`}
            >
              {formatVND(order.total)}
            </span>
            <span className="ml-2 text-xs text-neutral-400">
              {isCancelled
                ? '(Cancelled)'
                : order.shippingFee === 0
                  ? '(Free Atelier Shipping)'
                  : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {/* Nút hủy đơn (chỉ cho phép khi đơn Pending hoặc Confirmed) */}
          {canCancel && onCancel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onCancel(order)}
              className="text-xs tracking-wider uppercase font-medium h-9 px-4"
            >
              Cancel
            </Button>
          )}

          {/* Nút xem chi tiết đơn hàng */}
          {onViewDetails && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(order)}
              className="text-xs tracking-wider uppercase font-medium h-9 px-5 flex items-center gap-1.5"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

