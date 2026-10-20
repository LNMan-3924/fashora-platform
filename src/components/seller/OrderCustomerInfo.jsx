/**
 * Component OrderCustomerInfo: Cột bên phải hiển thị thông tin Khách hàng, Địa chỉ giao hàng và Chi tiết thanh toán
 * - Thể hiện đầy đủ tên khách, số điện thoại liên hệ, email và ghi chú giao hàng.
 * - Khối địa chỉ phân tách rõ ràng tuyến đường, Phường/Xã và Tỉnh/Thành phố.
 * - Khối thanh toán tự động cập nhật trạng thái thu tiền (Chờ thu hộ hoặc Đã thu tiền) theo tiến trình đơn hàng.
 * - Không sử dụng bất kỳ dấu chấm tròn nào trên giao diện.
 *
 * Props:
 * - recipient: Đối tượng thông tin người nhận hàng (fullName, phone, address, ward, district, city)
 * - customerEmail: Email khách hàng
 * - customerNote: Ghi chú giao hàng của khách
 * - paymentMethod: Hình thức thanh toán (COD, Thẻ, VNPay...)
 * - orderStatus: Trạng thái hiện tại của đơn hàng
 */
export default function OrderCustomerInfo({
  recipient = {},
  customerEmail = '',
  customerNote = '',
  paymentMethod = 'Cash on Delivery (COD)',
  orderStatus = 'PENDING',
}) {
  const normalizedStatus = String(orderStatus || 'PENDING').toUpperCase()
  const isCompleted = normalizedStatus === 'COMPLETED'
  const isCancelled = normalizedStatus === 'CANCELLED'

  const customerName = recipient.fullName || 'Valued Customer'
  const customerPhone = recipient.phone || '+84 90 000 0000'

  // Phân tích trạng thái thanh toán
  let paymentBadgeText = 'UNPAID (COD)'
  let paymentBadgeStyle = 'bg-amber-50 text-amber-800 border-amber-200'
  let paymentStatusText = 'Pending Collection upon Delivery'
  let dispatchText = 'In Transit'

  if (isCompleted) {
    paymentBadgeText = 'PAID (COLLECTED)'
    paymentBadgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200'
    paymentStatusText = 'Payment Collected by Courier'
    dispatchText = 'Delivered & Handed Over'
  } else if (isCancelled) {
    paymentBadgeText = 'CANCELLED'
    paymentBadgeStyle = 'bg-neutral-100 text-neutral-600 border-neutral-200'
    paymentStatusText = 'Order Cancelled — No Collection'
    dispatchText = 'Cancelled'
  }

  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN KHÁCH HÀNG (CUSTOMER) */}
      <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
            CUSTOMER
          </h4>
          <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-[2px] bg-black text-white">
            VIP CLIENT
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block mb-0.5">
              FULL NAME
            </span>
            <span className="font-bold text-black text-sm">{customerName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block mb-0.5">
                PHONE NUMBER
              </span>
              <a
                href={`tel:${customerPhone}`}
                className="font-mono text-neutral-700 hover:text-black hover:underline"
              >
                {customerPhone}
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block mb-0.5">
                EMAIL
              </span>
              <a
                href={`mailto:${customerEmail}`}
                className="text-neutral-700 hover:text-black hover:underline truncate block font-mono text-[11px]"
              >
                {customerEmail || 'customer@atelier.io'}
              </a>
            </div>
          </div>

          {/* Ghi chú giao hàng của khách */}
          <div className="mt-3 pt-3 border-t border-neutral-100 bg-neutral-50 p-3 rounded-[2px] border border-neutral-200/80">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-neutral-500 block mb-1">
              CLIENT DELIVERY NOTE
            </span>
            <p className="text-xs italic text-neutral-700 font-sans">
              "{customerNote || 'Please call before delivering. Handle with care.'}"
            </p>
          </div>
        </div>
      </section>

      {/* 2. ĐỊA CHỈ GIAO HÀNG (SHIPPING ADDRESS) */}
      <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
            SHIPPING ADDRESS
          </h4>
          <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-[2px] bg-neutral-100 text-neutral-700">
            DOMESTIC
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block mb-0.5">
              DELIVERY RECIPIENT &amp; STREET
            </span>
            <p className="text-neutral-800 font-medium leading-relaxed">
              {customerName}
              <br />
              {recipient.address || '128 Le Duan Boulevard, Floor 4'}
              <br />
              {recipient.ward || 'Ben Nghe Ward'}, {recipient.district || 'District 1'}
              <br />
              {recipient.city || 'Ho Chi Minh City, Vietnam'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-neutral-50 p-2.5 rounded-[2px] border border-neutral-200">
              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-neutral-400 block">
                DISTRICT / WARD
              </span>
              <span className="font-bold text-black text-[11px] mt-0.5 block truncate">
                {recipient.district || 'District 1'} / {recipient.ward || 'Ben Nghe'}
              </span>
            </div>

            <div className="bg-neutral-50 p-2.5 rounded-[2px] border border-neutral-200">
              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-neutral-400 block">
                PROVINCE / CITY
              </span>
              <span className="font-bold text-black text-[11px] mt-0.5 block truncate">
                {recipient.city || 'Ho Chi Minh City'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHI TIẾT THANH TOÁN (PAYMENT DETAILS) */}
      <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
            PAYMENT DETAILS
          </h4>
          <span
            className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-[2px] border ${paymentBadgeStyle}`}
          >
            {paymentBadgeText}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
              PAYMENT METHOD
            </span>
            <span className="font-bold text-black">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
              STATUS
            </span>
            <span className="font-semibold text-black">{paymentStatusText}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
              DELIVERY DISPATCH
            </span>
            <span className="font-semibold text-black">{dispatchText}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
              REMITTANCE CYCLE
            </span>
            <span className="font-mono text-neutral-600">T+2 Post Delivery</span>
          </div>

          {/* Hộp thông báo quyết toán */}
          <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-[2px] border border-neutral-200/80">
            {isCompleted
              ? 'Cash payment was received and verified by courier at delivery. Settlement funds are scheduled for payout to M STUDIO seller account on T+2 cycle.'
              : isCancelled
              ? 'Order is cancelled. No collection or payout will occur.'
              : 'Payment to be collected in cash by courier upon package handover. The funds will be credited to M STUDIO seller account balance following delivery reconciliation.'}
          </div>
        </div>
      </section>
    </div>
  )
}

