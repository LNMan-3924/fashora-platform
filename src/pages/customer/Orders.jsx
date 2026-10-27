import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Toast, EmptyState } from '../../components/common'
import {
  OrderStatusTabs,
  OrderCard,
  OrderQuickModal,
  CancelOrderModal,
} from '../../components/order'
import { getOrders, getOrdersByUserId, updateOrderStatus } from '../../services/api'
import { isOrderOwnedByUser } from '../../constants'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Trang Quản lý Đơn hàng (My Orders Page):
 * - Được chia nhỏ thành các component độc lập trong src/components/order:
 *   + OrderStatusTabs: Thanh chuyển tab bộ lọc 6 trạng thái kèm số lượng.
 *   + OrderCard: Thẻ hiển thị từng đơn hàng, danh sách sản phẩm, giá tiền và nút thao tác.
 *   + OrderQuickModal: Modal xem nhanh đặc tả chi tiết đơn hàng (Atelier Specification).
 * - Kết nối API GET /orders (db.json) và đồng bộ với đơn hàng lưu tại LocalStorage (fashora_user_orders).
 * - Tối ưu bố cục responsive mượt mà trên Mobile, Tablet và PC.
 * - Xử lý an toàn ảnh lỗi bằng ảnh dự phòng fallback.png.
 */
export default function Orders() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // 1. State lưu trữ danh sách đơn hàng thực tế từ API
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(() => Boolean(currentUser?.id))

  // 2. State quản lý tab lọc trạng thái hiện tại (mặc định 'all')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'

  const handleTabChange = (newTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (!newTab || newTab === 'all') {
          next.delete('tab')
        } else {
          next.set('tab', newTab)
        }
        return next
      },
      { replace: true }
    )
  }

  // 3. State quản lý đơn hàng đang mở trong Modal xem nhanh (null = đóng modal)
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null)

  // 4. State quản lý đơn hàng đang yêu cầu xác nhận hủy (null = đóng modal hủy)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // 5. State quản lý thông báo Toast nổi
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Tự động cuộn lên đầu trang khi vào trang My Orders
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // =========================================================================
  // BƯỚC 1: TẢI ĐƠN HÀNG THỰC TẾ TRỰC TIẾP TỪ API DB.JSON
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    // Tối ưu hiệu năng: Gọi trực tiếp /orders?userId=... thay vì tải toàn bộ đơn hàng của sàn
    const fetchPromise = currentUser?.id ? getOrdersByUserId(currentUser.id) : getOrders()
    fetchPromise
      .then((res) => {
        if (!isMounted) return
        const apiData = res?.data || res
        const apiList = Array.isArray(apiData) ? apiData : []

        // Nếu chưa đăng nhập hoặc không có ID người dùng, danh sách đơn hàng để rỗng
        if (!currentUser?.id) {
          setOrders([])
          setIsLoading(false)
          return
        }

        // Lọc nghiêm ngặt đơn hàng thuộc tài khoản đang đăng nhập (Tái sử dụng isOrderOwnedByUser SSOT)
        const userOrders = apiList.filter((o) => isOrderOwnedByUser(o, currentUser))

        // Sắp xếp đơn mới nhất lên đầu
        const sorted = [...userOrders].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        setOrders(sorted)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Orders: Error loading orders from API:', err)
        if (isMounted) {
          setOrders([])
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentUser])

  // =========================================================================
  // BƯỚC 2: TÍNH TOÁN SỐ LƯỢNG ĐƠN HÀNG THEO TỪNG TAB TRẠNG THÁI
  // Tính trực tiếp, tránh lạm dụng useMemo gây tốn bộ nhớ RAM không cần thiết
  // =========================================================================
  const statusCounts = {
    all: orders.length,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  }

  orders.forEach((order) => {
    const statusKey = (order.status || 'PENDING').toLowerCase()
    if (statusKey === 'pending') statusCounts.pending += 1
    else if (statusKey === 'confirmed' || statusKey === 'processing') statusCounts.confirmed += 1
    else if (statusKey === 'shipping') statusCounts.shipping += 1
    else if (statusKey === 'completed') statusCounts.completed += 1
    else if (statusKey === 'cancelled') statusCounts.cancelled += 1
  })

  // =========================================================================
  // BƯỚC 3: LỌC DANH SÁCH ĐƠN HÀNG THEO TAB ĐANG CHỌN
  // =========================================================================
  const filteredOrders =
    activeTab === 'all'
      ? orders
      : orders.filter((order) => {
        const statusKey = (order.status || 'PENDING').toLowerCase()
        if (activeTab === 'confirmed') {
          return statusKey === 'confirmed' || statusKey === 'processing'
        }
        return statusKey === activeTab
      })

  // =========================================================================
  // BƯỚC 4: CÁC HÀM XỬ LÝ TIỆN ÍCH & TƯƠNG TÁC
  // =========================================================================
  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  // Xử lý sao chép mã đơn hàng
  const handleCopyOrderNumber = (orderNum) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNum).catch(() => { })
    }
    showToast(`Order ${orderNum} copied to clipboard`)
  }

  // Xử lý xác nhận HỦY đơn hàng qua API kèm lý do
  const handleConfirmCancelOrder = async ({ reason }) => {
    if (!orderToCancel) return
    const targetId = orderToCancel.id
    const targetOrderNumber = orderToCancel.orderNumber

    try {
      setIsCancelling(true)
      const extraData = {
        cancelReason: reason,
        cancelledBy: 'customer',
        cancelledAt: new Date().toISOString(),
      }

      if (targetId) {
        await updateOrderStatus(targetId, 'CANCELLED', extraData)
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === targetId || o.orderNumber === targetOrderNumber
            ? { ...o, status: 'CANCELLED', ...extraData }
            : o
        )
      )

      setOrderToCancel(null)
      showToast(`Đơn hàng ${targetOrderNumber} đã được hủy thành công.`)
    } catch (err) {
      console.error('Orders: Error cancelling order via API:', err)
      showToast('Không thể hủy đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. THANH BREADCRUMB & TIÊU ĐỀ TRANG */}
      <section className="border-b border-neutral-200 pb-6 sm:pb-8 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center space-x-2 text-xs tracking-widest text-neutral-400 uppercase mb-3 font-mono"
            >
              <Link to="/home" className="hover:text-black transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">MY ORDERS</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 uppercase">
              MY ORDERS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal tracking-wide">
              View your order history and track your purchases.
            </p>
          </div>

        </div>
      </section>

      {/* 2. CÁC TAB LỌC TRẠNG THÁI ĐƠN HÀNG (TÁCH THÀNH COMPONENT NHỎ) */}
      <OrderStatusTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={statusCounts}
      />

      {/* 3. DANH SÁCH THẺ ĐƠN HÀNG (TÁCH THÀNH COMPONENT OrderCard) */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono tracking-widest uppercase text-neutral-400">
            Loading your orders...
          </p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id || order.orderNumber}
              order={order}
              onCancel={(o) => setOrderToCancel(o)}
              onViewDetails={(o) => setSelectedOrderForModal(o)}
              onCopyOrderNumber={handleCopyOrderNumber}
            />
          ))}
        </div>
      ) : (
        /* HIỂN THỊ KHI KHÔNG CÓ ĐƠN HÀNG TRONG TAB HIỆN TẠI */
        <EmptyState
          title="No Orders Found"
          description={`You do not have any orders currently in the ${activeTab.toUpperCase()} tab.`}
          actionText="START SHOPPING"
          onAction={() => navigate('/shop')}
        />
      )}

      {/* 4. MODAL XEM NHANH ĐẶC TẢ ĐƠN HÀNG (TÁCH THÀNH COMPONENT OrderQuickModal) */}
      <OrderQuickModal
        order={selectedOrderForModal}
        onClose={() => setSelectedOrderForModal(null)}
        onOpenFullDetail={(order) => {
          const targetId = order.id || order.orderNumber
          setSelectedOrderForModal(null)
          navigate(`/orders/${targetId}`)
        }}
      />

      {/* 5. MODAL CHỌN LÝ DO HỦY ĐƠN HÀNG (TÁI SỬ DỤNG CancelOrderModal) */}
      <CancelOrderModal
        isOpen={Boolean(orderToCancel)}
        onClose={() => setOrderToCancel(null)}
        order={orderToCancel}
        role="customer"
        loading={isCancelling}
        onConfirm={handleConfirmCancelOrder}
      />

      {/* 6. THÔNG BÁO TOAST DÙNG CHUNG */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}
