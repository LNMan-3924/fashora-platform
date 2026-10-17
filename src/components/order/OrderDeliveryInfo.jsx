import { formatFullAddress } from './orderConstants'

/**
 * Component OrderDeliveryInfo: Hiển thị thông tin giao nhận và vận chuyển đơn hàng
 * Tái sử dụng hàm formatFullAddress từ src/constants/commerce.js
 *
 * Tính năng:
 * - Cột 1: Thông tin người nhận và địa chỉ giao hàng chi tiết 3 cấp.
 * - Cột 2: Đối tác giao hàng (SPX Express), mã vận đơn theo dõi, phương thức thanh toán.
 * - Bố cục responsive: 1 cột trên Mobile, 2 cột trên Tablet và Desktop.
 *
 * Props:
 * - recipient: Thông tin người nhận { fullName, phone, address, ward, district, city }
 * - logistics: Thông tin vận chuyển { courier, waybill }
 * - shippingMethod: Tên phương thức vận chuyển
 * - paymentMethod: Phương thức thanh toán (COD)
 */
export default function OrderDeliveryInfo({
  recipient = {},
  logistics = {},
  shippingMethod,
  paymentMethod = 'Cash On Delivery (COD)',
}) {
  const recipientName = recipient.fullName || recipient.name || 'Recipient'
  const recipientPhone = recipient.phone || 'N/A'
  const formattedAddress = formatFullAddress(recipient)
  const courier = logistics.courier || 'SPX Express Logistics'
  const waybill = logistics.waybill || 'Pending Assignment'

  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-8">
      <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900 font-mono pb-4 border-b border-neutral-200 mb-6">
        DELIVERY &amp; LOGISTICS SPECIFICATION
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-xs sm:text-sm">
        {/* Địa chỉ người nhận hàng */}
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
            SHIPPING ADDRESS
          </h3>
          <div className="space-y-1 text-neutral-700 leading-relaxed font-sans">
            <p className="font-semibold text-neutral-900 text-sm">
              {recipientName}
            </p>
            <p className="text-neutral-700">{formattedAddress}</p>
            <p className="font-mono text-neutral-900 font-medium pt-1">
              Phone: {recipientPhone}
            </p>
          </div>
        </div>

        {/* Thông tin điều phối vận chuyển */}
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
            DISPATCH LOGISTICS
          </h3>
          <div className="space-y-2 text-neutral-700 leading-relaxed font-sans">
            <div>
              <span className="text-neutral-500">Shipping Partner:</span>
              <p className="font-semibold text-neutral-900">{courier}</p>
            </div>

            <div>
              <span className="text-neutral-500">Tracking Waybill:</span>
              <p className="font-mono font-bold text-neutral-900 tracking-wider">
                {waybill}
              </p>
            </div>

            {shippingMethod && (
              <div>
                <span className="text-neutral-500">Service:</span>
                <p className="font-medium text-neutral-900">{shippingMethod}</p>
              </div>
            )}

            <div>
              <span className="text-neutral-500">Payment Protocol:</span>
              <p className="font-medium text-neutral-900">{paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
