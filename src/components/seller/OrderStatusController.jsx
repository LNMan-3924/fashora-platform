import { useState } from 'react'
import { ArrowRight, Ban, AlertTriangle, RefreshCw } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'

/**
 * Component OrderStatusController: Khối điều khiển chuyển trạng thái đơn hàng theo luồng nghiêm ngặt
 * - Quy tắc nghiệp vụ theo yêu cầu:
 *   + Người bán KHÔNG được tự ý chọn trạng thái bất kỳ từ dropdown.
 *   + Nút tiến tới chỉ giữ lại chữ tên trạng thái (PENDING -> CONFIRMED, CONFIRMED -> SHIPPING, SHIPPING -> COMPLETED).
 *   + Chỉ được HỦY đơn hàng TRƯỚC giai đoạn giao hàng (tức là chỉ cho phép hủy khi ở PENDING hoặc CONFIRMED).
 *   + Khi không thể hủy (SHIPPING, COMPLETED, CANCELLED), ẩn nút hủy chứ không thay bằng nút mới hay huy hiệu thay thế.
 *   + Toàn bộ giao diện người dùng hiển thị 100% bằng tiếng Anh.
 *
 * Props:
 * - currentStatus: Trạng thái hiện tại của đơn hàng
 * - displayId: Mã đơn hàng hiển thị
 * - onUpdateStatus: Callback nhận trạng thái mới để gọi API cập nhật
 * - isUpdating: Trạng thái đang gọi API
 */
export default function OrderStatusController({
  currentStatus = 'PENDING',
  displayId = '',
  onUpdateStatus,
  isUpdating = false,
}) {
  const normalized = String(currentStatus || 'PENDING').toUpperCase()

  // State xác nhận hủy đơn hàng (tránh người bán bấm nhầm)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // 1. Xác định bước tiến tới tiếp theo và cấu hình nút bấm
  let nextAction = null
  let canCancel = false

  switch (normalized) {
    case 'PENDING':
      nextAction = {
        targetStatus: 'CONFIRMED',
        label: 'CONFIRMED',
      }
      canCancel = true // Trước shipping -> Cho phép hủy
      break

    case 'CONFIRMED':
      nextAction = {
        targetStatus: 'SHIPPING',
        label: 'SHIPPING',
      }
      canCancel = true // Trước shipping -> Cho phép hủy
      break

    case 'SHIPPING':
      nextAction = {
        targetStatus: 'COMPLETED',
        label: 'COMPLETED',
      }
      break

    default:
      break
  }

  // Xử lý khi nhấn nút tiến tới bước tiếp theo
  const handleAdvance = () => {
    if (nextAction && onUpdateStatus) {
      onUpdateStatus(nextAction.targetStatus)
    }
  }

  // Xử lý khi xác nhận hủy đơn
  const handleConfirmCancel = () => {
    if (onUpdateStatus) {
      onUpdateStatus('CANCELLED')
      setShowCancelConfirm(false)
    }
  }

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Cụm thông tin trạng thái bên trái */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
              ORDER STATUS CONTROL
            </h4>
            <OrderStatusBadge status={currentStatus} />
          </div>
        </div>

        {/* Cụm nút hành động bên phải: Chỉ cho phép TIẾN TỚI hoặc HỦY TRƯỚC SHIPPING. Không thể hủy thì ẩn nút hủy, không thay bằng nút mới */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {/* NÚT TIẾN TỚI (ADVANCE) */}
          {nextAction && (
            <button
              type="button"
              onClick={handleAdvance}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-[2px] text-xs font-mono uppercase tracking-[0.15em] font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={`Advance order to ${nextAction.targetStatus}`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>UPDATING...</span>
                </>
              ) : (
                <>
                  <span>{nextAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}

          {/* NÚT HỦY ĐƠN HÀNG (CHỈ XUẤT HIỆN TRƯỚC SHIPPING: PENDING HOẶC CONFIRMED) */}
          {canCancel && !showCancelConfirm && (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-neutral-300 text-neutral-600 rounded-[2px] text-xs font-mono uppercase tracking-wider font-semibold hover:border-red-300 hover:text-red-700 hover:bg-red-50/50 transition-colors cursor-pointer disabled:opacity-40"
              title="Cancel this order before shipment"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>CANCEL</span>
            </button>
          )}
        </div>
      </div>

      {/* HỘP XÁC NHẬN HỦY ĐƠN HÀNG (INLINE CONFIRMATION) */}
      {showCancelConfirm && (
        <div className="mt-4 pt-4 border-t border-red-200 bg-red-50/60 p-3.5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs text-red-800 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Cancel order <strong>{displayId}</strong>? This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-[2px] text-xs font-mono uppercase text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isUpdating}
              className="px-3.5 py-1.5 bg-red-600 text-white rounded-[2px] text-xs font-mono uppercase font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
