import { Banknote } from 'lucide-react'

/**
 * Component PaymentMethod: Lựa chọn phương thức thanh toán.
 * Yêu cầu đặc biệt từ người dùng: Chỉ giữ lại phương thức COD (Cash on Delivery).
 * Loại bỏ hoàn toàn Bank Transfer / QR Pay.
 *
 * Props:
 * - selectedMethod: Tên phương thức đang chọn (mặc định 'cod').
 * - onChange: Hàm callback xử lý thay đổi (nếu mở rộng thêm sau này).
 */
export default function PaymentMethod({ selectedMethod = 'cod', onChange }) {
  return (
    <section className="border-b border-neutral-200 pb-8">
      {/* Tiêu đề mục thanh toán */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111] flex items-center gap-2">
          <Banknote className="w-4 h-4 text-[#111111]" />
          <span>3. Payment Method</span>
        </h2>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
          COD ONLY
        </span>
      </div>

      {/* Lựa chọn duy nhất: Thanh toán khi nhận hàng (Cash on Delivery) */}
      <div className="space-y-3">
        <label
          className={`flex items-start justify-between p-4 border cursor-pointer transition-all duration-200 ${
            selectedMethod === 'cod'
              ? 'border-[#111111] bg-neutral-50/70 shadow-xs'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="payment_method"
              value="cod"
              checked={selectedMethod === 'cod'}
              onChange={() => onChange && onChange('cod')}
              className="mt-0.5 accent-[#111111] cursor-pointer"
            />
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block">
                Cash on Delivery (COD)
              </span>
              <span className="text-[11px] text-neutral-500 block mt-1 leading-relaxed max-w-lg">
                Pay with cash or direct transfer upon courier delivery. Inspect
                pieces carefully prior to signing receipt.
              </span>
            </div>
          </div>

          {/* Biểu tượng tiền mặt */}
          <div className="shrink-0 ml-3 p-1.5 rounded-full bg-neutral-100 text-neutral-700">
            <Banknote className="w-5 h-5" />
          </div>
        </label>
      </div>
    </section>
  )
}

