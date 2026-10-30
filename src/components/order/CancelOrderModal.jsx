import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../common'
import { CUSTOMER_CANCEL_REASONS, SELLER_CANCEL_REASONS } from '../../constants'

/**
 * Component CancelOrderModal: Hộp thoại xác nhận và chọn lý do hủy đơn hàng
 * Dùng chung cho cả Người mua (Customer) và Người bán (Seller).
 *
 * Props:
 * - isOpen: Trạng thái hiển thị modal (boolean)
 * - onClose: Hàm đóng modal
 * - onConfirm: Callback khi xác nhận hủy đơn, nhận ({ reason, note, cancelledBy })
 * - order: Đối tượng đơn hàng cần hủy (chứa id, orderNumber)
 * - role: Vai trò người thực hiện hủy ('customer' | 'seller', mặc định 'customer')
 * - loading: Trạng thái đang gửi yêu cầu lên API
 */
export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  role = 'customer',
  loading = false,
}) {
  const { t } = useTranslation()
  const isSeller = role === 'seller'
  // Lựa chọn danh sách lý do hủy phù hợp theo vai trò người dùng
  const reasons = isSeller ? SELLER_CANCEL_REASONS : CUSTOMER_CANCEL_REASONS

  // 1. Quản lý trạng thái nội bộ của modal
  const [selectedReason, setSelectedReason] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const getTranslatedReason = (r) => {
    if (r.includes('Changed my mind') || r.includes('Thay đổi ý định')) return t('orders.reasonChangeMind', r)
    if (r.includes('wrong size') || r.includes('Đặt nhầm')) return t('orders.reasonWrongItem', r)
    if (r.includes('better price') || r.includes('giá tốt hơn')) return t('orders.reasonFoundBetterPrice', r)
    if (r.includes('taking too long') || r.includes('quá lâu')) return t('orders.reasonTooSlow', r)
    if (r.includes('Other') || r.includes('Lý do khác')) return t('orders.reasonOther', r)
    return r
  }

  // 2. Dọn dẹp form khi đóng modal
  const handleClose = () => {
    setSelectedReason('')
    setCustomNote('')
    setErrorMessage('')
    onClose?.()
  }

  // 3. Xử lý khi nhấn nút xác nhận hủy đơn
  const handleConfirm = () => {
    // Kiểm tra người dùng đã chọn lý do chưa
    if (!selectedReason) {
      setErrorMessage(t('orders.selectReason', 'Please select a cancellation reason before confirming.'))
      return
    }

    const isOther = selectedReason === 'Other reasons' || selectedReason === 'Lý do khác'

    // Nếu chọn lý do khác thì bắt buộc phải nhập chi tiết
    if (isOther && !customNote.trim()) {
      setErrorMessage(t('orders.enterOtherReason', 'Please provide specific details for the cancellation.'))
      return
    }

    // Chuẩn hóa chuỗi lý do cuối cùng
    const trimmedNote = customNote?.trim() || ''

    let finalReason = selectedReason
    if (isOther) {
      finalReason = trimmedNote ? `Other reasons: ${trimmedNote}` : 'Other reasons'
    } else if (trimmedNote) {
      finalReason = `${selectedReason} (${trimmedNote})`
    }

    onConfirm?.({
      reason: finalReason,
      selectedReason,
      customNote: trimmedNote,
      cancelledBy: role,
    })

    setSelectedReason('')
    setCustomNote('')
    setErrorMessage('')
  }

  const orderCode = order?.orderNumber || order?.id || ''
  const isOtherSelected = selectedReason === 'Other reasons' || selectedReason === 'Lý do khác'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSeller ? 'CONFIRM CANCELLATION (FOR ATELIER)' : t('orders.cancelModalTitle', 'CONFIRM ORDER CANCELLATION')}
      confirmText={t('orders.confirmCancel', 'CONFIRM CANCELLATION')}
      cancelText={t('orders.keepOrder', 'KEEP ORDER')}
      confirmVariant="danger"
      onConfirm={handleConfirm}
      loading={loading}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Thông tin đơn hàng & Cảnh báo hủy */}
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-[2px] space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              {t('orders.cancelOrder', 'Cancel order')}: <strong className="font-mono text-red-900">{orderCode}</strong>
            </span>
          </div>
          <p className="text-[11px] text-red-700 leading-relaxed">
            {isSeller
              ? 'Notice: The order will be cancelled immediately and the reason will be communicated to the buyer.'
              : t('orders.cancelNotice', 'Notice: Once cancelled, the order cannot be restored and the items will be returned to inventory.')}
          </p>
        </div>

        {/* Tiêu đề hướng dẫn */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black font-mono mb-2">
            {t('orders.selectReason', 'PLEASE SELECT A REASON TO CANCEL')} <span className="text-red-500">*</span>
          </label>

          {/* Danh sách các lý do dạng Radio buttons */}
          <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
            {reasons.map((reason) => {
              const isChecked = selectedReason === reason
              return (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-2.5 border rounded-[2px] cursor-pointer transition-colors ${isChecked
                      ? 'border-black bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="cancelReasonOption"
                    value={reason}
                    checked={isChecked}
                    onChange={() => {
                      setSelectedReason(reason)
                      setErrorMessage('')
                    }}
                    className="mt-0.5 accent-black cursor-pointer"
                  />
                  <span className="text-xs text-neutral-800 font-sans leading-tight">
                    {getTranslatedReason(reason)}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Ô nhập ghi chú khi chọn "Lý do khác" */}
        {isOtherSelected && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="block text-[11px] font-mono text-neutral-600 uppercase">
              {t('orders.enterOtherReason', 'Enter details for other reason:')}
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => {
                setCustomNote(e.target.value)
                setErrorMessage('')
              }}
              placeholder={t('orders.otherReasonPlaceholder', 'Please provide details about the cancellation...')}
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-[2px] focus:outline-none focus:border-black transition-colors resize-none font-sans"
            />
          </div>
        )}

        {/* Dòng thông báo lỗi xác thực nếu chưa chọn lý do */}
        {errorMessage && (
          <p className="text-xs text-red-600 font-mono font-medium">
            * {errorMessage}
          </p>
        )}
      </div>
    </Modal>
  )
}

