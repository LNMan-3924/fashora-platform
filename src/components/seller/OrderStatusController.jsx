import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Ban, RefreshCw } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import { CancelOrderModal } from '../order'

/**
 * Component OrderStatusController: Khối điều khiển chuyển trạng thái đơn hàng theo luồng nghiêm ngặt
 * - Quy tắc nghiệp vụ theo yêu cầu:
 *   + Người bán KHÔNG được tự ý chọn trạng thái bất kỳ từ dropdown.
 *   + Nút tiến tới chỉ giữ lại chữ tên trạng thái (PENDING -> CONFIRMED, CONFIRMED -> SHIPPING, SHIPPING -> COMPLETED).
 *   + Chỉ được HỦY đơn hàng TRƯỚC giai đoạn giao hàng (tức là chỉ cho phép hủy khi ở PENDING hoặc CONFIRMED).
 *   + Khi bấm hủy, hiển thị Modal cho phép người bán chọn lý do hủy đơn (hết hàng, khách yêu cầu, lỗi,...).
 *   + Khi không thể hủy (SHIPPING, COMPLETED, CANCELLED), ẩn nút hủy.
 *
 * Props:
 * - currentStatus: Trạng thái hiện tại của đơn hàng
 * - displayId: Mã đơn hàng hiển thị
 * - onUpdateStatus: Callback nhận trạng thái mới và dữ liệu bổ sung để gọi API
 * - isUpdating: Trạng thái đang gọi API
 */
export default function OrderStatusController({
  currentStatus = 'PENDING',
  displayId = '',
  onUpdateStatus,
  isUpdating = false,
}) {
  const { t } = useTranslation()
  const normalized = String(currentStatus || 'PENDING').toUpperCase()

  // State điều khiển mở modal chọn lý do hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

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

  // Xử lý khi xác nhận hủy đơn kèm lý do
  const handleConfirmCancel = ({ reason }) => {
    if (onUpdateStatus) {
      onUpdateStatus('CANCELLED', {
        cancelReason: reason,
        cancelledBy: 'seller',
        cancelledAt: new Date().toISOString(),
      })
      setIsCancelModalOpen(false)
    }
  }

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Cụm thông tin trạng thái bên trái */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
              {t('seller.orders.detail.controlTitle', 'ORDER STATUS CONTROL')}
            </h4>
            <OrderStatusBadge status={currentStatus} />
          </div>
        </div>

        {/* Cụm nút hành động bên phải: Chỉ cho phép TIẾN TỚI hoặc HỦY TRƯỚC SHIPPING */}
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
                  <span>{t('seller.orders.detail.updating', 'UPDATING...')}</span>
                </>
              ) : (
                <>
                  <span>{t(`seller.status.${nextAction.targetStatus.toLowerCase()}`, nextAction.label)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}

          {/* NÚT HỦY ĐƠN HÀNG (CHỈ XUẤT HIỆN TRƯỚC SHIPPING: PENDING HOẶC CONFIRMED) */}
          {canCancel && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-neutral-300 text-neutral-600 rounded-[2px] text-xs font-mono uppercase tracking-wider font-semibold hover:border-red-300 hover:text-red-700 hover:bg-red-50/50 transition-colors cursor-pointer disabled:opacity-40"
              title="Cancel this order before shipment"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{t('seller.orders.detail.cancelOrder', 'CANCEL')}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL CHỌN LÝ DO HỦY ĐƠN HÀNG DÀNH CHO SHOP */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={{ orderNumber: displayId }}
        role="seller"
        loading={isUpdating}
        onConfirm={handleConfirmCancel}
      />
    </section>
  )
}
