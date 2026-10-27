import { useState, useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Package, Clock, Truck, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getOrders, getOrdersByShop } from '../../services/api'
import { formatVND, filterOrdersByShop } from '../../constants/commerce'
import { Pagination } from '../../components/common'
import {
  MetricCard,
  OrderFilters,
  OrderTable,
} from '../../components/seller'

// Số lượng đơn hàng hiển thị trên mỗi trang theo quy chuẩn chung (10 đơn/trang)
const ITEMS_PER_PAGE = 10

/**
 * Trang Quản lý Đơn hàng Kênh Người bán (Seller Order Management Page):
 * - Được chia thành các component nhỏ, tái sử dụng độc lập trong src/components/seller:
 *   + MetricCard: Khung hiển thị 4 chỉ số hiệu suất đơn hàng (Total Orders, Pending, In Shipping, Settled Revenue).
 *   + OrderFilters: Thanh tìm kiếm từ khóa, bộ lọc trạng thái và thống kê số lượng đơn.
 *   + OrderTable: Bảng danh sách đơn hàng chi tiết, bấm "VIEW DETAILS" chuyển sang trang chi tiết riêng (/seller/orders/:id).
 * - Tự động nhận diện Shop ID và Shop Name từ SellerLayout / AuthContext (Đa shop độc lập).
 * - Tái sử dụng component phân trang Pagination (PREVIOUS [1] 2 3 ... 8 NEXT).
 * - Sử dụng dữ liệu thực tế 100% từ API JSON-Server (GET /orders), KHÔNG dùng mockData.
 * - Tính toán trực tiếp, đồng bộ 100% logic tính doanh thu với Dashboard (chỉ tính các item của shop).
 */
export default function Orders() {
  const outletContext = useOutletContext() || {}
  const { currentUser } = useAuth()

  // 1. Xác định Shop ID và Shop Name từ SellerLayout (Single Source of Truth suy từ currentUser)
  const sellerInfo = outletContext.sellerInfo || {}
  const currentShopId = outletContext.currentShopId || sellerInfo.shopId || sellerInfo.id || currentUser?.shopId || ''
  const shopName = sellerInfo.shopName || currentUser?.shopName || currentUser?.fullName || ''

  // 2. State lưu danh sách đơn hàng và trạng thái API
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 3. Đồng bộ bộ lọc, tìm kiếm & phân trang với URL Search Params (Dynamic Navigation)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const selectedStatus = searchParams.get('status') || 'ALL'
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateFilters = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(newParams).forEach(([key, val]) => {
          if (
            val === undefined ||
            val === null ||
            val === '' ||
            val === 'ALL' ||
            (key === 'page' && Number(val) <= 1)
          ) {
            next.delete(key)
          } else {
            next.set(key, String(val))
          }
        })
        return next
      },
      { replace: true }
    )
  }

  // 4. Tải danh sách đơn hàng từ API khi vào trang hoặc khi thay đổi shop
  useEffect(() => {
    let isMounted = true

    // Tối ưu hiệu năng: Tải trực tiếp đơn hàng theo shopId (/orders?shopId=...)
    const fetchOrdersPromise = currentShopId ? getOrdersByShop(currentShopId) : getOrders()
    fetchOrdersPromise
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res || []
        // Lọc các đơn hàng thuộc về shop hiện tại (Tái sử dụng filterOrdersByShop SSOT)
        const shopOrders = filterOrdersByShop(data, currentShopId, shopName)
        setOrders(shopOrders)
      })
      .catch((err) => {
        console.error('Error fetching orders list from API:', err)
        if (isMounted) {
          setError('Unable to load order data from API server. Please check the backend connection.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentShopId, shopName])

  // 5. Tính toán 4 chỉ số thống kê đơn hàng (KPI Bento Cards)
  const stats = {
    total: orders.length,
    pendingCount: 0,
    inShippingCount: 0,
    settledRevenue: 0,
  }

  orders.forEach((o) => {
    const statusUpper = (o.status || '').toUpperCase()

    // Đơn chờ xác nhận
    if (statusUpper === 'PENDING') {
      stats.pendingCount++
    }

    // Đơn đang giao hàng hoặc đã xác nhận
    if (statusUpper === 'SHIPPING' || statusUpper === 'CONFIRMED') {
      stats.inShippingCount++
    }

    // Doanh thu chỉ tính các mặt hàng thuộc về shop trong các đơn không bị HỦY (đồng bộ chuẩn xác với Dashboard)
    if (statusUpper !== 'CANCELLED') {
      const items = Array.isArray(o.items) ? o.items : []
      const shopItems = items.filter(
        (item) =>
          !item.shopId ||
          item.shopId === currentShopId ||
          (item.shopName && shopName && item.shopName.trim().toLowerCase() === shopName.trim().toLowerCase()) ||
          o.shopId === currentShopId
      )
      if (shopItems.length > 0) {
        const shopSubtotal = shopItems.reduce(
          (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
          0
        )
        stats.settledRevenue += shopSubtotal
      } else {
        stats.settledRevenue += Number(o.total ?? o.totalAmount ?? 0)
      }
    }
  })

  // 6. Lọc danh sách đơn hàng theo từ khóa tìm kiếm và trạng thái
  const filteredOrders = orders.filter((order) => {
    // Lọc theo từ khóa tìm kiếm (Mã đơn, Tên khách hàng, Email, Tên sản phẩm)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchId = String(order.id || '').toLowerCase().includes(query)
      const matchOrderNumber = String(order.orderNumber || '').toLowerCase().includes(query)
      const matchCustomer = String(
        order.recipient?.fullName || order.customerName || order.customer || ''
      ).toLowerCase().includes(query)
      const matchEmail = String(order.customerEmail || order.email || '').toLowerCase().includes(query)
      const matchItem =
        Array.isArray(order.items) &&
        order.items.some((it) => (it.name || '').toLowerCase().includes(query))

      if (!matchId && !matchOrderNumber && !matchCustomer && !matchEmail && !matchItem) {
        return false
      }
    }

    // Lọc theo Trạng thái đơn hàng
    if (selectedStatus !== 'ALL') {
      const statusUpper = (order.status || '').toUpperCase()
      if (statusUpper !== selectedStatus) {
        return false
      }
    }

    return true
  })

  // 7. Cập nhật bộ lọc qua URL SearchParams -> tự động quay về trang 1
  const handleSearchChange = (query) => {
    updateFilters({ q: query, page: 1 })
  }

  const handleStatusChange = (status) => {
    updateFilters({ status, page: 1 })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handlePageChange = (page) => {
    updateFilters({ page })
  }

  // 8. Tính toán phân trang: Chỉ hiển thị 10 đơn hàng trên mỗi trang
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] font-mono">
          {error}
        </div>
      )}

      {/* 1. HÀNG 4 THẺ CHỈ SỐ KPI ĐƠN HÀNG (TÁI SỬ DỤNG METRIC CARD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="TOTAL ORDERS"
          value={stats.total}
          subtext="Processed store requests"
          icon={Package}
          loading={isLoading}
        />

        <MetricCard
          label="PENDING CONFIRMATION"
          value={stats.pendingCount}
          subtext="Orders awaiting approval"
          icon={Clock}
          loading={isLoading}
        />

        <MetricCard
          label="IN SHIPPING"
          value={stats.inShippingCount}
          subtext="Fulfillment pipeline active"
          icon={Truck}
          loading={isLoading}
        />

        <MetricCard
          label="SETTLED REVENUE"
          value={formatVND(stats.settledRevenue)}
          subtext="Revenue from valid shop items"
          icon={CreditCard}
          loading={isLoading}
        />
      </div>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC ĐƠN HÀNG */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        totalCount={orders.length}
        filteredCount={filteredOrders.length}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onResetFilters={handleResetFilters}
        shopName={shopName}
      />

      {/* 3. BẢNG DANH SÁCH ĐƠN HÀNG (10 ĐƠN / TRANG) */}
      <OrderTable
        orders={paginatedOrders}
        loading={isLoading}
        shopName={shopName}
      />

      {/* 4. THÀNH PHẦN PHÂN TRANG (TÁI SỬ DỤNG PAGINATION) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          handlePageChange(page)
          window.scrollTo({ top: 250, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
