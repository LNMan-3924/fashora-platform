import { useState, useEffect } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { safeBack } from '../../utils'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { fetchOrderByIdOrNumber, updateOrderStatus, getProductById, patchProduct } from '../../services/api'
import { formatDate } from '../../constants/commerce'
import {
  OrderStatusBadge,
  OrderProgressTracker,
  OrderItemsList,
  OrderTotalSummary,
  OrderTimeline,
  OrderCustomerInfo,
  OrderStatusController,
} from '../../components/seller'

/**
 * Trang Quản lý Chi tiết Đơn hàng (Seller Order Detail Page):
 * - Hiển thị riêng biệt trên URL /seller/orders/:id thay vì dùng Modal.
 * - Khớp 100% bố cục và phong cách thiết kế atelier của Fashora:
 *   + Thanh điều hướng: Trở về danh sách đơn (Back to All Orders).
 *   + Thanh mã đơn: Mã đơn hàng (#ORD-...), Trạng thái (OrderStatusBadge), Ngày giờ đặt hàng.
 *   + Thanh tiến trình: FULFILLMENT PROGRESSION (PENDING -> CONFIRMED -> SHIPPING -> COMPLETED).
 *   + Khối cập nhật trạng thái nghiêm ngặt (OrderStatusController):
 *     * Không cho phép tự chọn trạng thái từ dropdown.
 *     * Nút tiến tới chỉ hiển thị tên trạng thái mục tiêu (CONFIRMED, SHIPPING, COMPLETED).
 *     * Chỉ cho phép HỦY (CANCEL) khi đơn ở PENDING hoặc CONFIRMED (trước shipping).
 *     * Khi hủy đơn: Tự động hoàn lại số lượng tồn kho (restock inventory) cho các sản phẩm trong đơn.
 *   + Cột trái (7/12): Danh sách sản phẩm (OrderItemsList), Tổng tiền (OrderTotalSummary), Mốc sự kiện (OrderTimeline).
 *   + Cột phải (5/12): Khách hàng, Địa chỉ giao hàng, Chi tiết thanh toán (OrderCustomerInfo).
 * - Toàn bộ giao diện người dùng hiển thị bằng tiếng Anh.
 * - Tương tác trực tiếp API PATCH /orders/:id khi đổi trạng thái đơn hàng.
 */
export default function OrderDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const outletContext = useOutletContext() || {}

  // 1. Xác định Shop ID và Shop Name từ SellerLayout (Single Source of Truth suy từ currentUser)
  const sellerInfo = outletContext.sellerInfo || {}
  const shopName = sellerInfo.shopName || ''

  // 2. State lưu trữ đơn hàng & trạng thái xử lý
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 3. Tải dữ liệu đơn hàng từ API JSON-Server khi vào trang
  useEffect(() => {
    let isMounted = true

    const fetchOrder = async () => {
      try {
        const foundOrder = await fetchOrderByIdOrNumber(id)

        if (!isMounted) return

        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          setError(`Order "${id}" could not be found in shop records.`)
        }
      } catch (err) {
        console.error('Error fetching order detail data:', err)
        if (isMounted) {
          setError('Unable to load order data from API server. Please check the backend connection.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchOrder()

    return () => {
      isMounted = false
    }
  }, [id])

  // Tự động tắt thông báo Toast sau 4 giây
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // 4. Xử lý cập nhật trạng thái đơn hàng qua API (chỉ tiến tới hoặc hủy trước shipping kèm lý do)
  const handleStatusUpdate = async (nextStatus, extraData = {}) => {
    if (!order || !order.id || isUpdating) return

    try {
      setIsUpdating(true)
      await updateOrderStatus(order.id, nextStatus, extraData)

      // Nếu trạng thái mới là CANCELLED (hủy đơn), tự động hoàn trả lại số lượng tồn kho (restock items)
      if (nextStatus === 'CANCELLED' && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.id) {
            try {
              const prdRes = await getProductById(item.id)
              const prd = prdRes?.data || prdRes
              if (prd) {
                const currentStock = Number(prd.stock || 0)
                const restoredStock = currentStock + (Number(item.quantity) || 1)
                await patchProduct(item.id, {
                  stock: restoredStock,
                  isSoldOut: restoredStock <= 0,
                })
              }
            } catch (stockErr) {
              console.warn('Could not restore stock for item:', item.id, stockErr)
            }
          }
        }
      }

      setOrder((prev) => ({
        ...prev,
        status: nextStatus,
        ...extraData,
      }))

      setToastMessage(
        nextStatus === 'CANCELLED'
          ? t('seller.orders.detail.toastCancelled', { id: order.orderNumber || order.id, defaultValue: `Order ${order.orderNumber || order.id} was cancelled and product inventory has been restored.` })
          : t('seller.orders.detail.toastUpdated', {
              id: order.orderNumber || order.id,
              status: t(`seller.status.${nextStatus.toLowerCase()}`, nextStatus),
              defaultValue: `Order ${order.orderNumber || order.id} status successfully transitioned to "${nextStatus}".`
            })
      )
    } catch (err) {
      console.error('Error updating order status in API:', err)
      alert(t('seller.orders.detail.updateError', 'Failed to update order status. Please check your backend connection.'))
    } finally {
      setIsUpdating(false)
    }
  }

  // 5. Trạng thái tải dữ liệu
  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-neutral-400 space-y-3">
        <div className="inline-block w-6 h-6 border-2 border-black border-t-transparent rounded-[2px] animate-spin" />
        <p>{t('orderDetail.loading', 'RETRIEVING ORDER RECORD FROM ATELIER DATABASE...')}</p>
      </div>
    )
  }

  // 6. Trạng thái lỗi không tìm thấy đơn hàng
  if (error || !order) {
    return (
      <div className="p-10 bg-white border border-neutral-200 rounded-[2px] space-y-4 font-mono text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-black uppercase tracking-wider">
          {error || t('orderDetail.orderNotFound', 'ORDER NOT FOUND')}
        </h3>
        <p className="text-xs text-neutral-400">
          {t('orderDetail.orderNotFoundDesc', { id, defaultValue: `The requested order does not exist or has been removed from ${shopName} records.` })}
        </p>
        <button
          type="button"
          onClick={() => safeBack(navigate, '/seller/orders')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-[2px] hover:bg-neutral-800 transition-colors mt-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('seller.orders.detail.back', 'Back to All Orders')}</span>
        </button>
      </div>
    )
  }

  // Chuẩn bị dữ liệu hiển thị
  const displayId =
    order.orderNumber ||
    (order.id
      ? String(order.id).startsWith('#')
        ? order.id
        : `#ORD-${order.id}`
      : '#ORD-000')

  const recipient = order.recipient || {}
  const items = Array.isArray(order.items) ? order.items : []
  const orderTotal = Number(order.total ?? order.totalAmount ?? 0)
  const shippingFee = Number(order.shippingFee || 0)
  const subtotal = Number(order.subtotal || orderTotal - shippingFee)
  const paymentMethod = order.paymentMethod || order.payment || 'Cash on Delivery (COD)'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Thông báo Toast thông điệp hoàn tất */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 bg-neutral-900 text-white text-xs rounded-[2px] font-mono tracking-wide shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-neutral-400 hover:text-white text-xs uppercase px-2 py-0.5 ml-4 cursor-pointer"
          >
            {t('searchOverlay.close', 'Close')}
          </button>
        </div>
      )}

      {/* 1. THANH ĐIỀU HƯỚNG QUAY LẠI */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => safeBack(navigate, '/seller/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t('seller.orders.detail.back', 'Back to All Orders')}</span>
        </button>
      </div>

      {/* 2. KHỐI ĐỊNH DANH ĐƠN HÀNG (ORDER IDENTIFICATION BAR) */}
      <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-black font-mono">
              {displayId}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 tracking-wide font-sans">
            {t('seller.orders.detail.placedOn', { date: formatDate(order.createdAt || order.date), defaultValue: `Placed on ${formatDate(order.createdAt || order.date)} • Standard Atelier Delivery` })}
          </p>
        </div>
      </section>

      {/* 3. THANH TIẾN TRÌNH HOÀN TẤT ĐƠN HÀNG (FULFILLMENT PROGRESSION) */}
      <OrderProgressTracker status={order.status} />

      {/* Hiển thị thông báo lý do hủy đơn nếu đơn đã bị hủy */}
      {order.status === 'CANCELLED' && order.cancelReason && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 rounded-[2px] space-y-1">
          <p className="font-semibold uppercase tracking-wider font-mono">
            {t('seller.orders.detail.cancellationReason', '[!] CANCELLATION REASON:')}
          </p>
          <p className="text-neutral-800">
            {order.cancelReason}
          </p>
          {order.cancelledBy && (
            <p className="text-[11px] text-neutral-500 font-mono">
              {t('seller.orders.detail.cancelledBy', {
                by: order.cancelledBy === 'seller' ? t('seller.orders.detail.bySeller', 'Seller (Atelier)') : t('seller.orders.detail.byBuyer', 'Customer'),
                defaultValue: `(Cancelled by: ${order.cancelledBy === 'seller' ? 'Seller (Atelier)' : 'Customer'})`
              })}
            </p>
          )}
        </div>
      )}

      {/* 4. KHỐI ĐIỀU KHIỂN CẬP NHẬT TRẠNG THÁI NGHIÊM NGẶT (CHỈ TIẾN TỚI HOẶC HỦY TRƯỚC SHIPPING) */}
      <OrderStatusController
        currentStatus={order.status}
        displayId={displayId}
        onUpdateStatus={handleStatusUpdate}
        isUpdating={isUpdating}
      />

      {/* 5. BỐ CỤC 2 CỘT CHÍNH (TWO-COLUMN ORDER CONTENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7/12): Danh sách sản phẩm, Tóm tắt tổng tiền, Mốc sự kiện */}
        <div className="lg:col-span-7 space-y-6">
          {/* Danh sách mặt hàng */}
          <OrderItemsList items={items} />

          {/* Tóm tắt tài chính */}
          <OrderTotalSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={orderTotal}
            itemCount={items.length}
            paymentMethod={paymentMethod}
          />

          {/* Mốc thời gian hoàn tất đơn */}
          <OrderTimeline
            status={order.status}
            createdAt={order.createdAt || order.date}
            waybill={order.logistics?.waybill || 'VN-EXP-884928'}
            shopName={shopName}
          />
        </div>

        {/* CỘT PHẢI (5/12): Khách hàng, Địa chỉ giao hàng, Chi tiết thanh toán */}
        <div className="lg:col-span-5 space-y-6">
          <OrderCustomerInfo
            recipient={recipient}
            customerEmail={order.customerEmail || order.email}
            customerNote={order.customerNote || order.note}
            paymentMethod={paymentMethod}
            orderStatus={order.status}
            shopName={shopName}
          />
        </div>
      </div>
    </div>
  )
}
