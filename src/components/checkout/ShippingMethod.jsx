import { Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Component ShippingMethod: Lựa chọn phương thức giao hàng.
 * Bao gồm 2 gói vận chuyển:
 * 1. Standard Delivery: Miễn phí (Complimentary), giao dự kiến 3–5 ngày làm việc.
 * 2. Express Priority Courier: 50,000₫, chuyển phát nhanh hỏa tốc 1–2 ngày.
 *
 * Props:
 * - selectedMethod: Số tiền phí vận chuyển đang chọn (0 hoặc 50000).
 * - onChange: Hàm callback xử lý khi người dùng đổi phương thức giao hàng.
 */
export default function ShippingMethod({ selectedMethod = 0, onChange }) {
  const { t } = useTranslation()

  // Danh sách các tùy chọn giao hàng
  const shippingOptions = [
    {
      id: 'standard',
      cost: 0,
      title: t('checkout.standardDelivery', 'Standard Delivery'),
      subtitle: t('checkout.standardSubtitle', 'Estimated 3–5 business days dispatch via atelier courier'),
      badge: t('checkout.complimentary', 'COMPLIMENTARY'),
    },
    {
      id: 'express',
      cost: 50000,
      title: t('checkout.expressDelivery', 'Express Priority Courier'),
      subtitle: t('checkout.expressSubtitle', 'Estimated 1–2 business days priority air dispatch'),
      badge: '50,000₫',
    },
  ]

  return (
    <section className="border-b border-neutral-200 pb-8">
      {/* Tiêu đề mục phương thức giao hàng */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#111111]" />
          <span>{t('checkout.stepMethod', '2. Shipping Method')}</span>
        </h2>
      </div>

      {/* Danh sách các lựa chọn phương thức giao hàng */}
      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const isSelected = selectedMethod === option.cost

          return (
            <label
              key={option.id}
              onClick={() => onChange(option.cost)}
              className={`flex items-start justify-between p-4 border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[#111111] bg-neutral-50/70 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="shipping_method"
                  value={option.cost}
                  checked={isSelected}
                  onChange={() => onChange(option.cost)}
                  className="mt-0.5 accent-[#111111] cursor-pointer"
                />
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block">
                    {option.title}
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    {option.subtitle}
                  </span>
                </div>
              </div>

              {/* Nhãn giá tiền hoặc Complimentary */}
              <span
                className={`text-xs font-semibold uppercase tracking-wider shrink-0 ml-2 ${
                  option.cost === 0
                    ? 'text-[#111111]'
                    : 'text-[#111111] font-mono'
                }`}
              >
                {option.badge}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}

