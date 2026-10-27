import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { safeBack } from '../../utils'
import { ArrowLeft, Copy } from 'lucide-react'
import { Badge, Toast, Button } from '../../components/common'
import { fetchOrderByIdOrNumber, updateOrderStatus } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  STATUS_CONFIG,
  formatDate,
  canCancelOrder,
  isOrderOwnedByUser,
  OrderTimeline,
  OrderStatusNotice,
  OrderItemsList,
  OrderDeliveryInfo,
  OrderPriceSummary,
  CancelOrderModal,
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
  const { currentUser } = useAuth()

  // State lưu trữ dữ liệu chi tiết của đơn hàng
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // State quản lý Modal xác nhận hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // State quản lý thông báo Toast
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Tự động cuộn lên đầu trang khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // 1. TẢI CHI TIẾT ĐƠN HÀNG TỪ API DB.JSON VÀ XÁC THỰC QUYỀN SỞ HỮU (Tái sử dụng fetchOrderByIdOrNumber)
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    const loadOrder = async () => {
      try {
        const foundOrder = await fetchOrderByIdOrNumber(id)
        if (!isMounted) return

        if (foundOrder && isOrderOwnedByUser(foundOrder, currentUser)) {
          setOrder(foundOrder)
          setNotFound(false)
        } else {
          setOrder(null)
          setNotFound(true)
        }
      } catch (err) {
        console.error('OrderDetail: Lỗi tải đơn hàng từ API:', err)
        if (isMounted) {
          setOrder(null)
          setNotFound(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // 1. Gọi API lấy đơn hàng theo ID
    getOrderById(id)
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        if (handleOrderData(data)) {
          return
        }
        return getOrders()
      })
      .then((res) => {
        if (!isMounted || !res) return
        const list = res?.data || res
        if (Array.isArray(list)) {
          const found = list.find((o) => o.id === id || o.orderNumber === id)
          if (handleOrderData(found)) {
            return
          }
        }
        setOrder(null)
        setNotFound(true)
        setLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        // Khi getOrderById lỗi (ví dụ id là mã đơn #SPXVN...), fallback tìm qua getOrders()
        getOrders()
          .then((res) => {
            if (!isMounted) return
            const list = res?.data || res
            if (Array.isArray(list)) {
              const found = list.find((o) => o.id === id || o.orderNumber === id)
              if (handleOrderData(found)) {
                return
              }
            }
            setOrder(null)
            setNotFound(true)
            setLoading(false)
          })
          .catch((finalErr) => {
            console.error('OrderDetail: Error loading order from API:', finalErr)
            if (isMounted) {
              setOrder(null)
              setNotFound(true)
              setLoading(false)
            }
          })
      })
    loadOrder()

    return () => {
      isMounted = false
    }
  }, [id, currentUser])

  // =========================================================================
  // 2. CÁC HÀM XỬ LÝ SỰ KIỆN (COPY MÃ ĐƠN, HỦY ĐƠN QUA API)
  // =========================================================================
  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  // Sao chép mã đơn hàng vào clipboard
  const handleCopyOrderNumber = () => {
    const code = order?.orderNumber || id
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => { })
    }
    showToast(`Order code ${code} copied to clipboard`)
  }

  // Xác nhận hủy đơn hàng qua API kèm lý do
  const handleConfirmCancel = async ({ reason }) => {
    if (!order) return

    const targetId = order.id
    const targetOrderNumber = order.orderNumber

    try {
      setIsCancelling(true)
      const extraData = {
        cancelReason: reason,
        cancelledBy: 'customer',
        cancelledAt: new Date().toISOString(),
      }

      if (order.id) {
        await updateOrderStatus(order.id, 'CANCELLED', extraData)
      }
      setOrder((prev) => ({ ...prev, status: 'CANCELLED', ...extraData }))
      setIsCancelModalOpen(false)
      showToast(`Đơn hàng ${targetOrderNumber || targetId} đã được hủy thành công.`)
    } catch (err) {
      console.error('OrderDetail: Error cancelling order via API:', err)
      showToast('Không thể hủy đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsCancelling(false)
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
              onClick={() => safeBack(navigate, '/orders')}
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
            <button
              type="button"
              onClick={() => safeBack(navigate, '/orders')}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-3 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to My Orders</span>
            </button>

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
      {/* 5. MODAL CHỌN LÝ DO HỦY ĐƠN HÀNG (TÁI SỬ DỤNG CancelOrderModal) */}
      {/* ============================================================= */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={order}
        role="customer"
        loading={isCancelling}
        onConfirm={handleConfirmCancel}
      />

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