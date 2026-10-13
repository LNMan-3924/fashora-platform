import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'

/**
 * Component OrderReview: Xem lại thông tin đơn hàng trước khi đặt và nút Submit "PLACE ORDER".
 * Bao gồm:
 * 1. Tóm tắt thông tin người nhận (Họ tên, SĐT, Địa chỉ đầy đủ 3 cấp).
 * 2. Tóm tắt phương thức giao hàng và phương thức thanh toán COD.
 * 3. Nút đặt hàng "PLACE ORDER" cùng điều khoản atelier.
 *
 * Props:
 * - formData: Thông tin người nhận ({ fullName, phone, address, ward, district, city }).
 * - shippingMethod: Gói vận chuyển được chọn (0 hoặc 50000).
 * - paymentMethod: Phương thức thanh toán (mặc định 'cod').
 * - isSubmitting: Trạng thái đang gửi yêu cầu đặt hàng.
 * - onSubmit: Hàm thực thi gửi đơn hàng.
 */
export default function OrderReview({
  formData,
  shippingMethod = 0,
  paymentMethod = 'cod',
  isSubmitting = false,
  onSubmit,
}) {
  // Gộp địa chỉ đầy đủ thành chuỗi ngăn cách bởi dấu phẩy
  const fullAddress =
    [formData.address, formData.ward, formData.district, formData.city]
      .filter((item) => item && item.trim().length > 0)
      .join(', ') || 'No address provided'

  // Nhãn hiển thị cho gói giao hàng
  const shippingLabel =
    shippingMethod === 0
      ? 'Standard Delivery (Complimentary)'
      : 'Express Priority Courier (50,000₫)'

  // Nhãn hiển thị cho phương thức thanh toán
  const paymentLabel =
    paymentMethod === 'cod'
      ? 'Cash on Delivery (COD)'
      : 'Direct Bank Transfer'

  return (
    <section className="p-6 bg-neutral-50/80 border border-neutral-200">
      {/* Tiêu đề mục Review */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          <span>Review Your Order</span>
        </h2>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VERIFIED</span>
        </span>
      </div>

      <p className="text-[11px] text-neutral-500 mb-6">
        Please verify all recipient credentials before submitting your order.
      </p>

      {/* Lưới 2 cột tóm tắt thông tin giao hàng & thanh toán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-6 mb-6">
        {/* Cột 1: Thông tin người nhận */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
            Shipping Recipient
          </span>
          <p className="font-semibold text-[#111111]">{formData.fullName || '—'}</p>
          <p className="text-neutral-600 font-mono mt-0.5">
            {formData.phone || '—'}
          </p>
          <p className="text-neutral-600 mt-1.5 text-[11px] leading-relaxed break-words">
            {fullAddress}
          </p>
        </div>

        {/* Cột 2: Phương thức gửi hàng & thanh toán */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
            Dispatch & Payment
          </span>
          <p className="text-neutral-800">
            <span className="text-neutral-400">Method: </span>
            <span className="font-medium text-[#111111]">{shippingLabel}</span>
          </p>
          <p className="text-neutral-800 mt-1">
            <span className="text-neutral-400">Payment: </span>
            <span className="font-medium text-[#111111]">{paymentLabel}</span>
          </p>
          <p className="text-neutral-800 mt-1">
            <span className="text-neutral-400">Atelier: </span>
            <span className="font-medium text-[#111111]">M STUDIO Certified</span>
          </p>
        </div>
      </div>

      {/* Nút bấm ĐẶT HÀNG */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>PROCESSING ATELIER ORDER...</span>
          </>
        ) : (
          <span>PLACE ORDER</span>
        )}
      </button>

      {/* Cam kết & điều khoản */}
      <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest mt-3">
        By placing order, you agree to Fashora Commission & Atelier Terms.
      </p>
    </section>
  )
}

