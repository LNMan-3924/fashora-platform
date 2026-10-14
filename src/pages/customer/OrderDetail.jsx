import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { Badge, Toast, Modal } from '../../components/common'
import { getOrderById, updateOrderStatus } from '../../services/api'
import {
  DEFAULT_MOCK_ORDERS,
  STATUS_CONFIG,
  formatDate,
  OrderTimeline,
  OrderStatusNotice,
  OrderItemsList,
  OrderDeliveryInfo,
  OrderPriceSummary,
} from '../../components/order'

/**
 * Trang Chi tiết Đơn hàng (Customer Order Detail Page)
 *
 * Tính năng chính:
 * - Tra cứu và hiển thị chi tiết đơn hàng theo id trên URL (:id).
 * - Tự động tải từ API db.json (GET /orders/:id) hoặc fallback về danh sách mẫu dự phòng.
 * - Giao diện chia nhỏ theo các component chuyên biệt trong src/components/order/:
 *   + OrderTimeline: Stepper 4 bước tiến độ giao hàng trực quan.
 *   + OrderStatusNotice: Banner thông báo tiến độ theo màu sắc và icon.
 *   + OrderItemsList: Danh sách sản phẩm chi tiết kèm fallback xử lý ảnh lỗi.
 *   + OrderDeliveryInfo: Thông tin người nhận và điều phối vận chuyển SPX Express.
 *   + OrderPriceSummary: Bảng tóm tắt tài chính và các nút hành động (Hủy đơn, Mua sắm).
 * - Bố cục responsive hoàn hảo:
 *   + Mobile (<768px): 1 cột liền mạch, nút bấm và cỡ chữ tối ưu cho cảm ứng.
 *   + Tablet (768px - 1024px): Bố cục cân đối, thẻ thông tin chia 2 cột.
 *   + PC (>=1024px): Grid 12 cột (8 cột nội dung chính + 4 cột thanh toán cố định).
 */
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // State lưu trữ dữ liệu chi tiết của đơn hàng
  const [order, setOrder] = useState(null)

  // State quản lý Modal xác nhận hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  // State quản lý thông báo Toast
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Tự động cuộn lên đầu trang khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // 1. TẢI CHI TIẾT ĐƠN HÀNG TỪ API DB.JSON HOẶC MOCK DATA DỰ PHÒNG
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    // Gọi API lấy đơn hàng theo ID
    getOrderById(id)
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        if (data && (data.id || data.orderNumber)) {
          setOrder(data)
          return
        }
        fallbackToMock()
      })
      .catch(() => {
        if (isMounted) {
          fallbackToMock()
        }
      })

    // Hàm dự phòng tra cứu đơn hàng mẫu
    function fallbackToMock() {
      const normalizedParam = String(id || '').trim().toLowerCase()

      const found = DEFAULT_MOCK_ORDERS.find(
        (o) =>
          o.id.toLowerCase() === normalizedParam ||
          o.orderNumber.toLowerCase() === normalizedParam ||
          o.orderNumber.toLowerCase() === `#${normalizedParam}`
      )

      if (found) {
        setOrder(found)
      } else {
        // Nếu không tìm thấy, lấy đơn đầu tiên làm minh họa
        setOrder(DEFAULT_MOCK_ORDERS[0])
      }
    }

    return () => {
      isMounted = false
    }
  }, [id])

  // =========================================================================
  // 2. CÁC HÀM XỬ LÝ SỰ KIỆN (COPY MÃ ĐƠN, HỦY ĐƠN)
  // =========================================================================
  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  // Sao chép mã đơn hàng vào clipboard
  const handleCopyOrderNumber = () => {
    const code = order?.orderNumber || id
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {})
    }
    showToast(`Order number ${code} copied`)
  }

  // Xác nhận hủy đơn hàng
  const handleConfirmCancel = async () => {
    if (!order) return

    setOrder((prev) => ({ ...prev, status: 'CANCELLED' }))
    setIsCancelModalOpen(false)
    showToast(`Order ${order.orderNumber} has been cancelled.`)

    try {
      if (order.id) {
        await updateOrderStatus(order.id, 'CANCELLED')
      }
    } catch (err) {
      console.warn('OrderDetail: Khong the cap nhat trang thai len db.json:', err?.message)
    }
  }

  // Trạng thái đang tải dữ liệu
  if (!order) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs tracking-widest uppercase font-mono text-neutral-500">
          RETRIEVING ATELIER SPECIFICATION...
        </p>
      </div>
    )
  }

  // Phân tích trạng thái đơn
  const rawStatus = (order.status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const isCancelled = rawStatus === 'CANCELLED'
  const canCancel = rawStatus === 'PENDING' || rawStatus === 'CONFIRMED' || rawStatus === 'PROCESSING'

  return (
    <div className="w-full">
      {/* ============================================================= */}
      {/* 1. THANH TIÊU ĐỀ & BREADCRUMB QUAY LẠI                        */}
      {/* ============================================================= */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>BACK TO MY ORDERS</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 uppercase font-mono">
                {order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                title="Copy order number"
                className="p-1.5 text-neutral-400 hover:text-black transition-colors cursor-pointer border border-neutral-200 hover:border-black"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <Badge
                variant={rawStatus.toLowerCase() === 'processing' ? 'confirmed' : rawStatus.toLowerCase()}
                className={config.badgeClass}
              >
                {config.label}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
              Placed on {formatDate(order.createdAt)} • Shop: {order.shopName || 'M STUDIO'} • Payment: {order.paymentMethod || 'COD'}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block py-1.5 px-3 border border-neutral-300 text-[10px] tracking-[0.25em] font-medium text-neutral-700 uppercase bg-white">
              DISPATCH SPECIFICATION
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. THANH TIẾN TRÌNH ĐƠN HÀNG (STEPPER / TIMELINE)             */}
      {/* ============================================================= */}
      <OrderTimeline status={rawStatus} />

      {/* ============================================================= */}
      {/* 3. KHUNG THÔNG BÁO TIẾN ĐỘ THEO TRẠNG THÁI                    */}
      {/* ============================================================= */}
      <OrderStatusNotice status={rawStatus} className="mb-8" />

      {/* ============================================================= */}
      {/* 4. BỐ CỤC CHÍNH 2 CỘT (CỘT TRÁI 8 PHẦN, CỘT PHẢI 4 PHẦN)      */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* CỘT TRÁI (8 CỘT): Danh sách món đồ & Thông tin người nhận */}
        <div className="lg:col-span-8 space-y-8">
          {/* 4.1 Danh sách sản phẩm trong đơn */}
          <OrderItemsList items={order.items} />

          {/* 4.2 Thông tin giao hàng & đối tác vận chuyển */}
          <OrderDeliveryInfo
            recipient={order.recipient}
            logistics={order.logistics}
            paymentMethod={order.paymentMethod}
          />
        </div>

        {/* CỘT PHẢI (4 CỘT): Bảng tổng kết chi phí & Các nút thao tác */}
        <div className="lg:col-span-4">
          <OrderPriceSummary
            subtotal={order.subtotal}
            shippingFee={order.shippingFee}
            total={order.total}
            isCancelled={isCancelled}
            canCancel={canCancel}
            onCancel={() => setIsCancelModalOpen(true)}
            onContinueShopping={() => navigate('/shop')}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* 5. MODAL XÁC NHẬN HỦY ĐƠN HÀNG                                */}
      {/* ============================================================= */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="CANCEL ORDER CONFIRMATION"
        confirmText="YES, CANCEL ORDER"
        cancelText="KEEP ORDER"
        onConfirm={handleConfirmCancel}
        confirmVariant="danger"
      >
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600">
          <p>
            Are you sure you want to cancel order{' '}
            <strong className="text-black font-mono">{order.orderNumber}</strong>?
          </p>
          <p className="text-xs text-neutral-500 bg-neutral-100 p-3 border border-neutral-200">
            Note: Once cancelled, the atelier reservation for these items will be released back to public archive inventory immediately.
          </p>
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* 6. THÔNG BÁO TOAST DÙNG CHUNG                                  */}
      {/* ============================================================= */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}