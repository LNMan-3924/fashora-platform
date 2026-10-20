import { Check, Truck, Package, ShoppingBag } from 'lucide-react'
import { formatDate } from '../../constants/commerce'

/**
 * Component OrderTimeline: Lịch sử và mốc thời gian hoàn tất đơn hàng (Fulfillment Timeline)
 * - Tự động hiển thị các mốc sự kiện tùy theo trạng thái đơn:
 *   + Đặt hàng thành công (Order Placed)
 *   + Xác nhận & Đóng gói (Confirmed & Packaged)
 *   + Bàn giao vận chuyển (Express Courier Dispatch)
 *   + Giao hàng thành công (Order Delivered)
 *
 * Props:
 * - status: Trạng thái đơn hàng
 * - createdAt: Thời gian tạo đơn
 * - waybill: Mã vận đơn (tracking number)
 */
export default function OrderTimeline({
  status = 'PENDING',
  createdAt = '',
  waybill = 'VN-EXP-884928',
}) {
  const normalized = String(status || 'PENDING').toUpperCase()
  const isCompleted = normalized === 'COMPLETED'
  const isShippingOrMore = normalized === 'SHIPPING' || isCompleted
  const isConfirmedOrMore = normalized === 'CONFIRMED' || isShippingOrMore

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs">
      {/* Tiêu đề mốc thời gian */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-5">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
          FULFILLMENT TIMELINE
        </h4>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          TRACKING: {waybill || 'VN-EXP-884928'}
        </span>
      </div>

      {/* Dòng sự kiện kết nối dọc */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {/* Sự kiện 1: Đã giao hàng thành công (chỉ hiện khi COMPLETED) */}
        {isCompleted && (
          <div className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-[2px] bg-black text-white flex items-center justify-center text-[10px]">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-black">
                Order Delivered
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Package handover complete. Recipient signed delivery voucher at residential address.
              </p>
              <span className="text-[9px] font-mono text-neutral-400 block mt-1">
                Completed • Delivery Verified
              </span>
            </div>
          </div>
        )}

        {/* Sự kiện 2: Đang giao hàng / Bàn giao đơn vị vận chuyển */}
        <div
          className={`relative flex items-start gap-3 ${
            !isShippingOrMore ? 'opacity-40' : ''
          }`}
        >
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-[2px] bg-black text-white flex items-center justify-center text-[10px]">
            <Truck className="w-3 h-3" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              Handed to Express Courier
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Package in transit to Ho Chi Minh City Distribution Center (District 1 Hub).
            </p>
            <span className="text-[9px] font-mono text-neutral-400 block mt-1">
              Logistics Hub • SPX Express
            </span>
          </div>
        </div>

        {/* Sự kiện 3: Đã xác nhận & Đóng gói */}
        <div
          className={`relative flex items-start gap-3 ${
            !isConfirmedOrMore ? 'opacity-40' : ''
          }`}
        >
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-[2px] bg-black text-white flex items-center justify-center text-[10px]">
            <Package className="w-3 h-3" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              Order Confirmed &amp; Packaged
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Quality inspection completed by M STUDIO Atelier Vietnam team.
            </p>
            <span className="text-[9px] font-mono text-neutral-400 block mt-1">
              Atelier Saigon • Ready for dispatch
            </span>
          </div>
        </div>

        {/* Sự kiện 4: Khách đặt hàng thành công */}
        <div className="relative flex items-start gap-3">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-[2px] bg-black text-white flex items-center justify-center text-[10px]">
            <ShoppingBag className="w-3 h-3" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              Order Placed
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Client placed order through FASHORA Curated Storefront.
            </p>
            <span className="text-[9px] font-mono text-neutral-400 block mt-1">
              {formatDate(createdAt)} • Online Checkout
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

