import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { Badge, Toast, Modal, Button } from '../../components/common'
import { getOrderById, updateOrderStatus } from '../../services/api'
import {
  STATUS_CONFIG,
  formatDate,
  canCancelOrder,
  findStoredOrder,
  updateStoredOrderStatus,
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
 * - Tra cứu và hiển thị chi tiết đơn hàng thực tế theo id/orderNumber trên URL (:id).
 * - Tự động tải từ API db.json (GET /orders/:id) hoặc tra cứu từ danh sách đơn hàng thực tế trong LocalStorage.
 * - Không sử dụng đơn hàng giả định (mock data) làm dự phòng.
 * - Giao diện chia nhỏ theo các component chuyên biệt trong src/components/order/:
 *   + OrderTimeline: Stepper 4 bước tiến độ giao hàng trực quan.
 *   + OrderStatusNotice: Banner thông báo tiến độ theo màu sắc và icon.
 *   + OrderItemsList: Danh sách sản phẩm chi tiết kèm fallback xử lý ảnh lỗi.
 *   + OrderDeliveryInfo: Thông tin người nhận và điều phối vận chuyển SPX Express.
 *   + OrderPriceSummary: Bảng tóm tắt tài chính và các nút hành động (Hủy đơn, Mua sắm).
 * - Bố cục responsive hoàn hảo cho Mobile, Tablet và Desktop.
 */
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // State lưu trữ dữ liệu chi tiết của đơn hàng
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // State quản lý Modal xác nhận hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  // State quản lý thông báo Toast
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Tự động cuộn lên đầu trang khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // 1. TẢI CHI TIẾT ĐƠN HÀNG TỪ API DB.JSON HOẶC TỪ LOCALSTORAGE
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    // 1. Gọi API lấy đơn hàng theo ID
    getOrderById(id)
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        if (data && (data.id || data.orderNumber)) {
          setOrder(data)
          setLoading(false)
          return
        }

        // Nếu API trả về rỗng, tra cứu trong LocalStorage bằng hàm dùng chung
        const localFound = findStoredOrder(id)
        if (localFound) {
          setOrder(localFound)
          setLoading(false)
        } else {
          setOrder(null)
          setNotFound(true)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!isMounted) return
        // Khi không kết nối được server, tra cứu LocalStorage
        const localFound = findStoredOrder(id)
        if (localFound) {
          setOrder(localFound)
          setLoading(false)
        } else {
          setOrder(null)
          setNotFound(true)
          setLoading(false)
        }
      })

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
    showToast(`Order code ${code} copied to clipboard`)
  }

  // Xác nhận hủy đơn hàng
  const handleConfirmCancel = async () => {
    if (!order) return

    const targetId = order.id
    const targetOrderNumber = order.orderNumber

    // Cập nhật trạng thái CANCELLED vào LocalStorage bằng hàm dùng chung
    updateStoredOrderStatus(targetId || targetOrderNumber, 'CANCELLED')

    setOrder((prev) => ({ ...prev, status: 'CANCELLED' }))
    setIsCancelModalOpen(false)
    showToast(`Order ${targetOrderNumber || targetId} has been cancelled.`)

    try {
      if (order.id) {
        await updateOrderStatus(order.id, 'CANCELLED')
      }
    } catch (err) {
      console.warn('OrderDetail: Khong the cap nhat trang thai len db.json:', err?.message)
    }
  }

  // Trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs tracking-widest uppercase font-mono text-neutral-500">
          RETRIEVING ORDER SPECIFICATION...
        </p>
      </div>
    )
  }

  // Trạng thái không tìm thấy đơn hàng
  if (notFound || !order) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 sm:p-12 border border-neutral-200 bg-[#FAFAFA] rounded-[2px]">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-[#111111] mb-2">
            ORDER NOT FOUND
          </h2>
          <p className="text-xs text-neutral-500 mb-8 leading-relaxed font-mono">
            Could not locate any order record for identifier "{id}".
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/orders')}
              className="w-full sm:w-auto tracking-widest text-xs px-6"
            >
              BACK TO MY ORDERS
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto tracking-widest text-xs px-6"
            >
              EXPLORE SHOP
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Phân tích trạng thái đơn
  const rawStatus = (order.status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const isCancelled = rawStatus === 'CANCELLED'
  const canCancel = canCancelOrder(rawStatus)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to My Orders</span>
            </Link>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-mono">
                {order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                aria-label="Copy order code"
                title="Copy order code"
                className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <Badge variant="outline" size="sm" className={config.badgeClass}>
                {config.label}
              </Badge>
            </div>

            <p className="text-xs text-neutral-500 mt-1 font-mono">
              Placed on {formatDate(order.createdAt)} • Handled by {order.shopName || 'M STUDIO'}
            </p>
          </div>

          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:underline self-start sm:self-auto"
          >
            CONTINUE SHOPPING →
          </Link>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. THANH TIẾN ĐỘ GIAO HÀNG (TIMELINE STEPPER)                 */}
      {/* ============================================================= */}
      <OrderTimeline
        currentStep={config.stepIndex}
        isCancelled={isCancelled}
      />

      {/* ============================================================= */}
      {/* 3. BANNER THÔNG BÁO TIẾN ĐỘ ĐƠN HÀNG                          */}
      {/* ============================================================= */}
      <OrderStatusNotice
        config={config}
        isCancelled={isCancelled}
      />

      {/* ============================================================= */}
      {/* 4. NỘI DUNG CHÍNH (LƯỚI 2 CỘT: SẢN PHẨM & THANH TOÁN)        */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* CỘT TRÁI (8 cột): Danh sách sản phẩm & Thông tin vận chuyển */}
        <div className="lg:col-span-8 space-y-8">
          {/* A. Danh sách sản phẩm */}
          <OrderItemsList items={order.items || []} />

          {/* B. Thông tin người nhận và vận chuyển */}
          <OrderDeliveryInfo
            recipient={order.recipient}
            logistics={order.logistics}
            shippingMethod={order.shippingMethod}
            paymentMethod={order.paymentMethod}
          />
        </div>

        {/* CỘT PHẢI (4 cột): Bảng tóm tắt tài chính và các nút hành động */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <OrderPriceSummary
            subtotal={order.subtotal}
            shippingFee={order.shippingFee}
            total={order.total}
            canCancel={canCancel}
            onCancelClick={() => setIsCancelModalOpen(true)}
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
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
      >
        <div className="text-xs text-neutral-600 space-y-3 leading-relaxed">
          <p>
            Are you sure you want to cancel order{' '}
            <strong className="text-black font-mono">{order.orderNumber}</strong>?
          </p>
          <p className="text-[11px] text-neutral-500 bg-neutral-50 p-3 border border-neutral-200">
            Once cancelled, the reservation for your garments will be released back to the archive and this action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* 6. TOAST THÔNG BÁO TÁI SỬ DỤNG TỪ COMMON                     */}
      {/* ============================================================= */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}