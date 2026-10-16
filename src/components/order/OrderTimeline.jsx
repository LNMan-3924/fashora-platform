import { Check, Ban } from 'lucide-react'
import { STATUS_CONFIG } from './orderConstants'

/**
 * Component OrderTimeline: Thanh tiến trình trạng thái đơn hàng (Fulfilment Stepper)
 *
 * Tính năng:
 * - 4 bước trực quan: 01 Order Placed -> 02 Confirmed -> 03 In Transit -> 04 Delivered.
 * - Hiển thị khung cảnh báo Order Cancelled nếu đơn hàng đã bị hủy.
 * - Bố cục responsive linh hoạt: 2 cột trên Mobile, 4 cột trên Tablet và PC.
 *
 * Props:
 * - status: Trạng thái hiện tại của đơn hàng
 */
export default function OrderTimeline({ status = 'PENDING' }) {
  const rawStatus = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const isCancelled = rawStatus === 'CANCELLED'

  const steps = [
    { index: 1, title: 'Order Placed', desc: 'Received by Atelier' },
    { index: 2, title: 'Confirmed', desc: 'Tailoring & Packaging' },
    { index: 3, title: 'In Transit', desc: 'Dispatched via Courier' },
    { index: 4, title: 'Delivered', desc: 'Completed Acquisition' },
  ]

  return (
    <div className="bg-white border border-neutral-200 p-5 sm:p-8 mb-8 shadow-xs">
      <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-400 mb-6">
        FULFILMENT PROGRESSION
      </h2>

      {isCancelled ? (
        <div className="p-4 bg-neutral-100 border border-neutral-200 text-xs text-neutral-600 flex items-center gap-3">
          <Ban className="w-5 h-5 text-neutral-500 shrink-0" />
          <div>
            <p className="font-semibold text-neutral-900 uppercase tracking-wider">
              Order Cancelled
            </p>
            <p className="text-neutral-500 mt-0.5">
              This transaction has been voided. Any pending reservations have been cancelled.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((step) => {
            const isPast = config.stepIndex > step.index
            const isCurrent = config.stepIndex === step.index

            return (
              <div key={step.index} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold mb-2.5 transition-colors ${
                    isPast || isCurrent
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>0{step.index}</span>
                  )}
                </div>
                <span
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isCurrent ? 'text-black' : isPast ? 'text-neutral-800' : 'text-neutral-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 font-sans">
                  {step.desc}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

