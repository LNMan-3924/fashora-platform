import { Check, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Component OrderProgressTracker: Thanh tiến trình hoàn tất đơn hàng (Fulfillment Progression)
 * - Thể hiện trực quan 4 bước: PENDING -> CONFIRMED -> SHIPPING -> COMPLETED
 * - Đường kẻ nối liền tự động tính toán tỷ lệ % hoàn thành theo trạng thái thực tế.
 * - Hiển thị thông báo riêng biệt khi đơn hàng ở trạng thái ĐÃ HỦY (CANCELLED).
 * - Không sử dụng chấm tròn rời rạc, thiết kế sắc sảo bo góc nhẹ [2px].
 *
 * Props:
 * - status: Trạng thái hiện tại của đơn hàng ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED')
 */
export default function OrderProgressTracker({ status = 'PENDING' }) {
  const { t } = useTranslation()
  const normalized = String(status || 'PENDING').toUpperCase()
  const isCancelled = normalized === 'CANCELLED'

  // Cấu hình các bước xử lý đơn hàng
  const steps = [
    { key: 'PENDING', label: t('seller.status.pending', 'PENDING'), stepNum: 1 },
    { key: 'CONFIRMED', label: t('seller.status.confirmed', 'CONFIRMED'), stepNum: 2 },
    { key: 'SHIPPING', label: t('seller.status.shipping', 'SHIPPING'), stepNum: 3 },
    { key: 'COMPLETED', label: t('seller.status.completed', 'COMPLETED'), stepNum: 4 },
  ]

  // Xác định vị trí bước hiện tại (1..4)
  let currentStepIndex = 1
  let progressWidth = '0%'

  switch (normalized) {
    case 'CONFIRMED':
      currentStepIndex = 2
      progressWidth = '33.3%'
      break
    case 'SHIPPING':
      currentStepIndex = 3
      progressWidth = '66.6%'
      break
    case 'COMPLETED':
      currentStepIndex = 4
      progressWidth = '100%'
      break
    case 'CANCELLED':
      currentStepIndex = 0
      progressWidth = '0%'
      break
    default:
      break
  }

  const summaryText = isCancelled
    ? t('seller.orders.detail.orderCancelled', 'ORDER CANCELLED')
    : t('seller.orders.detail.stepOf', {
        current: currentStepIndex,
        status: t(`seller.status.${normalized.toLowerCase()}`, normalized),
        defaultValue: `STEP ${currentStepIndex} OF 4 (${normalized})`,
      })

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-5 shadow-xs">
      {/* Tiêu đề thanh tiến trình */}
      <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-4 flex items-center justify-between font-mono">
        <span>{t('seller.orders.detail.progressTitle', 'FULFILLMENT PROGRESSION')}</span>
        <span className="text-neutral-700">{summaryText}</span>
      </div>

      {/* Đường kẻ và các nút bước (Step Progression) - Căn vừa khít khung, không bị tràn thanh trượt */}
      <div className="pt-2 pb-1 overflow-hidden">
        <div className="flex items-center justify-between relative px-4 sm:px-8">
          {/* Đường ray tiến độ: Đường xám nền và đường đen tiến độ lồng bên trong */}
          <div className="absolute left-8 right-8 sm:left-12 sm:right-12 top-4 -translate-y-1/2 h-0.5 bg-neutral-200 z-0 overflow-hidden">
            {!isCancelled && (
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: progressWidth }}
              />
            )}
          </div>

          {/* Render 4 bước */}
          {steps.map((step) => {
            const isCompleted = !isCancelled && currentStepIndex > step.stepNum
            const isActive = !isCancelled && currentStepIndex === step.stepNum

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center gap-2 select-none"
              >
                {/* Khối biểu tượng của bước */}
                <div
                  className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isCompleted
                      ? 'bg-black text-white shadow-xs'
                      : isActive
                      ? 'bg-black text-white ring-4 ring-neutral-200 shadow-xs'
                      : 'bg-white border-2 border-neutral-300 text-neutral-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.stepNum}</span>
                  )}
                </div>

                {/* Nhãn chữ tên bước */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono tracking-wider uppercase ${
                    isActive || isCompleted
                      ? 'font-bold text-black'
                      : 'font-medium text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cảnh báo riêng khi đơn hàng bị HỦY (CANCELLED) */}
      {isCancelled && (
        <div className="mt-4 pt-3 border-t border-red-200 bg-red-50 p-3 rounded-[2px] flex items-center justify-between text-xs text-red-700 font-mono">
          <div className="flex items-center gap-2 font-semibold">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{t('seller.orders.detail.cancelledNotice', 'ORDER IS CANCELLED — Fulfillment and settlement pipeline paused.')}</span>
          </div>
          <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded-[2px] uppercase">
            {t('seller.status.cancelled', 'CANCELLED')}
          </span>
        </div>
      )}
    </section>
  )
}

