import { useState, useEffect, useMemo } from 'react'
import { Package, Clock, Truck, CreditCard } from 'lucide-react'
import { getOrders } from '../../services/api'
import { formatVND } from '../../constants/commerce'
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
 * - Tái sử dụng component phân trang Pagination (PREVIOUS [1] 2 3 ... 8 NEXT).
 * - Sử dụng dữ liệu thực tế 100% từ API JSON-Server (GET /orders), KHÔNG dùng mockData.
 * - Không sử dụng bất kỳ dấu chấm tròn nào trên giao diện, giữ kích thước badge đồng bộ và sắc sảo.
 */
export default function Orders() {
  // 1. State lưu danh sách đơn hàng và trạng thái API
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 2. State điều khiển bộ lọc & phân trang
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // 3. Tải danh sách đơn hàng từ API khi vào trang
  useEffect(() => {
    let isMounted = true

    getOrders()
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res || []
        // Lọc các đơn hàng thuộc về shop M STUDIO
        const shopOrders = Array.isArray(data)
          ? data.filter(
              (o) => !o.shopName || o.shopName === 'M STUDIO' || o.shopId === 'shop_m_studio'
            )
          : []
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
  }, [])

  // 4. Tính toán 4 chỉ số thống kê đơn hàng (KPI Bento Cards)
  const stats = useMemo(() => {
    const total = orders.length
    let pendingCount = 0
    let inShippingCount = 0
    let settledRevenue = 0

    orders.forEach((o) => {
      const statusUpper = (o.status || '').toUpperCase()

      // Đơn chờ xác nhận
      if (statusUpper === 'PENDING') {
        pendingCount++
      }

      // Đơn đang giao hàng hoặc đã xác nhận
      if (statusUpper === 'SHIPPING' || statusUpper === 'CONFIRMED') {
        inShippingCount++
      }

      // Doanh thu chỉ tính các đơn hàng không bị hủy
      if (statusUpper !== 'CANCELLED') {
        settledRevenue += Number(o.total ?? o.totalAmount ?? 0)
      }
    })

    return { total, pendingCount, inShippingCount, settledRevenue }
  }, [orders])

  // 5. Lọc danh sách đơn hàng theo từ khóa tìm kiếm và trạng thái
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Lọc theo từ khóa tìm kiếm (Mã đơn, Tên khách hàng, Email, Tên sản phẩm)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchId = String(order.id || '').toLowerCase().includes(query)
        const matchOrderNumber = String(order.orderNumber || '').toLowerCase().includes(query)
        const matchCustomer = String(order.recipient?.fullName || order.customerName || order.customer || '').toLowerCase().includes(query)
        const matchEmail = String(order.customerEmail || order.email || '').toLowerCase().includes(query)
        const matchItem = Array.isArray(order.items) && order.items.some((it) => (it.name || '').toLowerCase().includes(query))

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
  }, [orders, searchQuery, selectedStatus])

  // 6. Xử lý khi thay đổi bộ lọc -> tự động quay về trang 1
  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('ALL')
    setCurrentPage(1)
  }

  // 7. Tính toán phân trang: Chỉ hiển thị 10 đơn hàng trên mỗi trang
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

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
          subtext="Revenue from valid orders"
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
      />

      {/* 3. BẢNG DANH SÁCH ĐƠN HÀNG (10 ĐƠN / TRANG) */}
      <OrderTable
        orders={paginatedOrders}
        loading={isLoading}
      />

      {/* 4. THÀNH PHẦN PHÂN TRANG (TÁI SỬ DỤNG PAGINATION) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page)
          window.scrollTo({ top: 250, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
