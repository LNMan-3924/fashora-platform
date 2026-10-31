import { Check, Ban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STATUS_CONFIG } from './orderConstants'

/**
 * Component OrderTimeline: Thanh tiến trình trạng thái đơn hàng (Fulfilment Stepper)
 */
export default function OrderTimeline({ status = 'PENDING' }) {
  const { t } = useTranslation()
  const rawStatus = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const isCancelled = rawStatus === 'CANCELLED'

  const steps = [
    { index: 1, title: t('orderDetail.timelinePlaced'), desc: t('orderDetail.stepPlacedDesc') },
    { index: 2, title: t('orderDetail.timelineConfirmed'), desc: t('orderDetail.stepConfirmedDesc') },
    { index: 3, title: t('orderDetail.timelineShipping'), desc: t('orderDetail.stepShippingDesc') },
    { index: 4, title: t('orderDetail.timelineDelivered'), desc: t('orderDetail.stepDeliveredDesc') },
  ]

  return (
    <div className="bg-white border border-neutral-200 p-5 sm:p-8 mb-8 shadow-xs">
      <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-400 mb-6">
        {t('orderDetail.fulfilmentProgression')}
      </h2>

      {isCancelled ? (
        <div className="p-4 bg-neutral-100 border border-neutral-200 text-xs text-neutral-600 flex items-center gap-3">
          <Ban className="w-5 h-5 text-neutral-500 shrink-0" />
          <div>
            <p className="font-semibold text-neutral-900 uppercase tracking-wider">
              {t('orderDetail.orderCancelledTitle')}
            </p>
            <p className="text-neutral-500 mt-0.5">
              {t('orderDetail.orderCancelledDesc')}
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

