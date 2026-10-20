import { Link } from 'react-router-dom'
import { formatVND, formatDate } from '../../constants/commerce'
import OrderStatusBadge from './OrderStatusBadge'

/**
 * Component OrderTable: Bảng danh sách đơn hàng của Seller
 * - Hiển thị danh sách đơn hàng chi tiết: Mã đơn, Khách hàng, Ngày đặt, Tổng tiền, Hình thức thanh toán, Trạng thái và Nút xem chi tiết.
 * - Tái sử dụng component OrderStatusBadge (cố định độ rộng w-24, không dùng chấm tròn).
 * - Tái sử dụng các tiện ích định dạng có sẵn (formatVND, formatDate).
 * - Hỗ trợ cả giao diện Bảng (Desktop) và Thẻ Card trực quan (Mobile).
 * - Tích hợp trạng thái khung chờ (Skeleton Loading) khi đang tải dữ liệu từ API.
 *
 * Props:
 * - orders: Mảng các đơn hàng sau khi lọc và phân trang (10 đơn/trang)
 * - loading: Trạng thái đang tải API
 * - onViewDetails: Callback khi người bán nhấn nút "VIEW DETAILS" để xem chi tiết
 */
export default function OrderTable({
  orders = [],
  loading = false,
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] shadow-xs overflow-hidden">
      {/* 1. GIAO DIỆN BẢNG TRÊN DESKTOP & TABLET (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              <th className="py-3.5 px-4 font-semibold">ORDER ID</th>
              <th className="py-3.5 px-4 font-semibold">CUSTOMER</th>
              <th className="py-3.5 px-4 font-semibold">DATE</th>
              <th className="py-3.5 px-4 font-semibold">TOTAL</th>
              <th className="py-3.5 px-4 font-semibold">PAYMENT</th>
              <th className="py-3.5 px-4 font-semibold text-center">STATUS</th>
              <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 text-xs">
            {loading ? (
              // Trạng thái Skeleton Loading khi tải dữ liệu từ API
              [...Array(6)].map((_, idx) => (
                <tr key={`skel-order-${idx}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-neutral-100 rounded-[2px]" />
                    <div className="h-3 w-44 bg-neutral-100 rounded-[2px] mt-1.5" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-6 w-24 bg-neutral-100 rounded-[2px] mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-7 w-24 bg-neutral-100 rounded-[2px] ml-auto" />
                  </td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              // Danh sách đơn hàng thực tế lấy từ API
              orders.map((order) => {
                // Xác định thông tin khách hàng
                const customerName =
                  order.recipient?.fullName ||
                  order.customerName ||
                  order.customer ||
                  'Customer'

                const customerEmail =
                  order.customerEmail || order.email || 'N/A'

                // Ngày tạo đơn
                const orderDate =
                  order.createdAt || order.date || order.orderDate

                // Tổng tiền đơn hàng
                const orderTotal = order.total ?? order.totalAmount ?? 0

                // Hình thức thanh toán
                const paymentMethod =
                  order.paymentMethod || order.payment || 'Cash on Delivery (COD)'

                // Mã hiển thị đơn hàng
                const displayId =
                  order.orderNumber || (order.id ? (String(order.id).startsWith('#') ? order.id : `#ORD-${order.id}`) : '#ORD-000')

                return (
                  <tr
                    key={order.id || order.orderNumber}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    {/* Cột 1: Mã đơn hàng */}
                    <td className="py-4 px-4 font-mono font-bold text-black uppercase tracking-wider whitespace-nowrap">
                      {displayId}
                    </td>

                    {/* Cột 2: Khách hàng */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-black block truncate max-w-[200px]">
                        {customerName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono tracking-tight block truncate max-w-[200px]">
                        {customerEmail}
                      </span>
                    </td>

                    {/* Cột 3: Ngày đặt hàng */}
                    <td className="py-4 px-4 font-mono text-neutral-600 text-[11px] whitespace-nowrap">
                      {formatDate(orderDate)}
                    </td>

                    {/* Cột 4: Tổng tiền */}
                    <td className="py-4 px-4 font-mono font-bold text-black whitespace-nowrap">
                      {formatVND(orderTotal)}
                    </td>

                    {/* Cột 5: Hình thức thanh toán (Không dùng chấm tròn) */}
                    <td className="py-4 px-4 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                      {paymentMethod}
                    </td>

                    {/* Cột 6: Trạng thái đơn hàng (Tái sử dụng OrderStatusBadge) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Cột 7: Nút xem chi tiết đơn hàng */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/seller/orders/${order.id || order.orderNumber}`}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white rounded-[2px] text-[10px] font-mono uppercase font-bold tracking-wider transition-all duration-150 active:scale-95 shadow-xs inline-block"
                        title="View and manage order details"
                      >
                        VIEW DETAILS
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              // Trạng thái trống không tìm thấy đơn hàng
              <tr>
                <td
                  colSpan={7}
                  className="py-14 text-center text-xs text-neutral-400 uppercase tracking-widest font-mono"
                >
                  No orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2. GIAO DIỆN THẺ CARD TRÊN THIẾT BỊ DI ĐỘNG (< md) */}
      <div className="md:hidden divide-y divide-neutral-100">
        {loading ? (
          [...Array(4)].map((_, idx) => (
            <div key={`skel-mob-order-${idx}`} className="p-4.5 animate-pulse space-y-3">
              <div className="h-4 w-1/3 bg-neutral-100 rounded-[2px]" />
              <div className="h-3.5 w-1/2 bg-neutral-100 rounded-[2px]" />
              <div className="h-4 w-1/4 bg-neutral-100 rounded-[2px]" />
            </div>
          ))
        ) : orders.length > 0 ? (
          orders.map((order) => {
            const customerName =
              order.recipient?.fullName ||
              order.customerName ||
              order.customer ||
              'Customer'

            const orderDate =
              order.createdAt || order.date || order.orderDate

            const orderTotal = order.total ?? order.totalAmount ?? 0

            const paymentMethod =
              order.paymentMethod || order.payment || 'Cash on Delivery'

            const displayId =
              order.orderNumber || (order.id ? (String(order.id).startsWith('#') ? order.id : `#ORD-${order.id}`) : '#ORD-000')

            const firstItem = order.items?.[0]

            return (
              <div key={`mob-${order.id || order.orderNumber}`} className="p-4.5 space-y-3">
                {/* Hàng đầu: Mã đơn + Badge trạng thái */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-black uppercase tracking-wider">
                      {displayId}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      / M STUDIO
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Thông tin khách hàng và ngày đặt */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-black">
                    {customerName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>Date: {formatDate(orderDate)}</span>
                    <span>{paymentMethod}</span>
                  </div>
                  {firstItem && (
                    <div className="text-[11px] text-neutral-600 line-clamp-1">
                      Item: {firstItem.name} {order.items.length > 1 ? `(+${order.items.length - 1} more)` : ''}
                    </div>
                  )}
                </div>

                {/* Hàng dưới: Tổng tiền và nút xem chi tiết */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">
                      Total
                    </span>
                    <span className="font-mono text-sm font-extrabold text-black">
                      {formatVND(orderTotal)}
                    </span>
                  </div>
                  <Link
                    to={`/seller/orders/${order.id || order.orderNumber}`}
                    className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-[2px] text-[10px] font-mono uppercase font-bold tracking-wider transition-colors active:scale-95 shadow-xs inline-block"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 uppercase tracking-widest font-mono">
            No orders found.
          </div>
        )}
      </div>
    </div>
  )
}

