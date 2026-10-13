import { Info, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { Button } from '../common'

/**
 * Component CartOrderSummary: Bảng tóm tắt chi phí đơn hàng và nút thanh toán (Cột phải).
 * Tái sử dụng component Button từ src/components/common để đồng bộ toàn dự án.
 *
 * Tính năng:
 * 1. Hiển thị Tạm tính (Subtotal) cho các món đồ đang được tick chọn.
 * 2. Hiển thị chính sách vận chuyển miễn phí (Complimentary Shipping).
 * 3. Hiển thị Tổng cộng cuối cùng (Total).
 * 4. Nút bấm "PROCEED TO CHECKOUT" kích hoạt chuyển hướng sang trang thanh toán.
 * 5. Ba huy hiệu cam kết bảo chứng chất lượng dịch vụ chính hãng.
 */
export default function CartOrderSummary({
  subtotal = 0,             // Số tiền tạm tính cho các sản phẩm đã chọn
  selectedCount = 0,        // Số lượng sản phẩm đang được chọn
  onProceedCheckout,        // Hàm gọi khi nhấn nút tiến hành thanh toán
}) {
  // Hàm định dạng số tiền sang chuẩn Việt Nam Đồng (VD: 5,300,000₫)
  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN').format(val) + '₫'

  // Vô hiệu hóa nút thanh toán nếu người dùng chưa chọn bất kỳ món hàng nào
  const isCheckoutDisabled = selectedCount === 0

  return (
    <div className="lg:sticky lg:top-24 bg-white border border-neutral-200 rounded-[2px] p-5 sm:p-6 space-y-5 shadow-xs">
      {/* ------------------------------------------------------------- */}
      {/* PHẦN 1: TIÊU ĐỀ TỔNG QUAN ĐƠN HÀNG (ORDER SUMMARY)             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h2 className="font-bold text-sm tracking-widest uppercase text-[#111111]">
          ORDER SUMMARY
        </h2>
        <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
          ATELIER DIRECT
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 2: CHI TIẾT TÍNH TOÁN TIỀN HÀNG & PHÍ VẬN CHUYỂN          */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 text-xs sm:text-sm">
        {/* Tiền hàng tạm tính */}
        <div className="flex justify-between items-center text-neutral-600">
          <span>Subtotal ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})</span>
          <span className="font-mono font-semibold text-[#111111]">
            {formatVND(subtotal)}
          </span>
        </div>

        {/* Phí vận chuyển: Miễn phí toàn quốc */}
        <div className="flex justify-between items-center text-neutral-600">
          <span className="flex items-center gap-1.5">
            Shipping
            <span
              className="cursor-help text-neutral-400 hover:text-neutral-600 inline-flex items-center"
              title="Complimentary express courier service worldwide."
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </span>
          <span className="text-[10px] font-mono font-semibold tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[2px] uppercase">
            COMPLIMENTARY
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 3: TỔNG SỐ TIỀN THANH TOÁN CUỐI CÙNG                      */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-4 border-t border-neutral-200">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-bold text-base tracking-tight text-[#111111]">
              TOTAL
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              INCL. VAT &amp; IMPORT FEES
            </p>
          </div>
          <div className="text-right">
            <span className="font-bold text-xl sm:text-2xl text-[#111111] font-mono">
              {formatVND(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 4: NÚT TIẾN HÀNH THANH TOÁN (PROCEED TO CHECKOUT)        */}
      {/* Tái sử dụng Button từ src/components/common                     */}
      {/* ------------------------------------------------------------- */}
      <Button
        variant="primary"
        size="lg"
        disabled={isCheckoutDisabled}
        onClick={onProceedCheckout}
        className="w-full tracking-[0.2em] text-xs h-12 flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>PROCEED TO CHECKOUT</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 5: BA HUY HIỆU CAM KẾT DỊCH VỤ CHÍNH HÃNG                */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-xs text-neutral-600 font-sans">
        {/* 1. Cam kết chính hãng */}
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0" />
          <span>Direct Atelier Provenance &amp; Serialization</span>
        </div>
        {/* 2. Vận chuyển có bảo hiểm */}
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#111111] shrink-0" />
          <span>Complimentary Insured Courier Worldwide</span>
        </div>
        {/* 3. Đổi trả trong 14 ngày */}
        <div className="flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 text-[#111111] shrink-0" />
          <span>14-Day Vault Return &amp; Archive Exchange</span>
        </div>
      </div>
    </div>
  )
}
