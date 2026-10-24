import { Link } from 'react-router-dom'
import { formatVND } from '../../constants/commerce'
import OrderStatusBadge from './OrderStatusBadge'

/**
 * Component RecentOrdersTable: Bảng hiển thị danh sách đơn hàng mới nhất của Seller
 * Hiển thị 5 đơn hàng gần nhất với các cột: Mã đơn (ORDER ID), Tên khách (CUSTOMER), Tổng tiền (TOTAL), Trạng thái (STATUS).
 *
 * Props:
 * - orders: Mảng các đơn hàng tải từ API (GET /orders)
 * - loading: Trạng thái đang tải dữ liệu
 * - maxDisplay: Số lượng đơn tối đa hiển thị (mặc định 5 đơn)
 */
export default function RecentOrdersTable({
  orders = [],
  loading = false,
  maxDisplay = 5,
  shopName = '',
}) {
  // Lấy danh sách giới hạn theo maxDisplay
  const displayOrders = orders.slice(0, maxDisplay)

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs mt-8">
      {/* 1. Tiêu đề khối đơn hàng gần đây */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-neutral-100">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black">
            RECENT ORDERS
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Latest purchase requests for {shopName} collection garments
          </p>
        </div>

        {/* Số lượng đơn hàng hiển thị */}
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          {loading ? 'LOADING...' : `${displayOrders.length} ORDERS LISTED`}
        </span>
      </div>

      {/* 2. Bảng dữ liệu đơn hàng (Hỗ trợ cuộn ngang trên điện thoại) */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-400">
              <th className="py-3 px-2 font-semibold">ORDER ID</th>
              <th className="py-3 px-2 font-semibold">CUSTOMER</th>
              <th className="py-3 px-2 font-semibold">TOTAL</th>
              <th className="py-3 px-2 font-semibold text-right">STATUS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
            {loading ? (
              // Trạng thái Skeleton khi đang tải API
              [...Array(maxDisplay)].map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-4 px-2">
                    <div className="h-4 w-20 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-2">
                    <div className="h-4 w-32 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-2">
                    <div className="h-4 w-24 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="h-6 w-24 bg-neutral-100 rounded-[2px] ml-auto" />
                  </td>
                </tr>
              ))
            ) : displayOrders.length > 0 ? (
              // Danh sách đơn hàng thực tế
              displayOrders.map((order) => {
                // Xác định tên khách hàng
                const customerName =
                  order.recipient?.fullName ||
                  order.customerName ||
                  order.customerEmail?.split('@')[0] ||
                  'Customer'

                // Tính tổng tiền đơn hàng
                const orderTotal = order.total ?? order.totalAmount ?? 0

                return (
                  <tr
                    key={order.id || order.orderNumber}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    {/* Cột Mã đơn hàng */}
                    <td className="py-3.5 px-2 font-mono font-bold text-xs text-black whitespace-nowrap">
                      <Link
                        to={`/seller/orders/${order.id || order.orderNumber}`}
                        className="hover:underline"
                        title="View order details"
                      >
                        {order.orderNumber || `#ORD-${order.id}`}
                      </Link>
                    </td>

                    {/* Cột Tên khách hàng */}
                    <td className="py-3.5 px-2 text-neutral-800 font-medium whitespace-nowrap">
                      {customerName}
                    </td>

                    {/* Cột Tổng tiền */}
                    <td className="py-3.5 px-2 font-mono font-semibold text-black whitespace-nowrap">
                      {formatVND(orderTotal)}
                    </td>

                    {/* Cột Trạng thái đơn hàng */}
                    <td className="py-3.5 px-2 text-right whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                )
              })
            ) : (
              // Trạng thái khi chưa có đơn hàng nào
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-xs text-neutral-400 uppercase tracking-wider font-mono"
                >
                  No orders found for this shop.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

