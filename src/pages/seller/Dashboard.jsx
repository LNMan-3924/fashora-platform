import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CreditCard, Package, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatVND } from '../../constants/commerce'
import { getOrders, getProductsByShop } from '../../services/api'
import {
  MetricCard,
  RecentOrdersTable,
  BestSellingProducts,
} from '../../components/seller'

/**
 * Trang Tổng quan Kênh Người bán (Seller Dashboard Page):
 * - Được chia thành các component nhỏ, độc lập trong src/components/seller:
 *   + MetricCard: Khung hiển thị từng chỉ số hiệu suất bán hàng (Revenue, Orders, Products Sold).
 *   + RecentOrdersTable: Bảng danh sách các đơn hàng gần đây với badge trạng thái chuẩn màu.
 *   + BestSellingProducts: Lưới hiển thị top 4 sản phẩm bán chạy kèm cơ chế kiểm tra lỗi ảnh (onError).
 * - Tự động nhận diện Shop ID và Shop Name từ SellerLayout / AuthContext (Hỗ trợ đa shop độc lập).
 * - Sử dụng dữ liệu thực tế 100% từ API backend theo ID shop (GET /products?shopId=...), KHÔNG dùng mockData tĩnh.
 * - Tính toán trực tiếp không lạm dụng useMemo gây tốn bộ nhớ RAM.
 */
export default function Dashboard() {
  const outletContext = useOutletContext() || {}
  const { currentUser } = useAuth()

  // 1. Xác định Shop ID và Shop Name từ SellerLayout (Single Source of Truth suy từ currentUser)
  const sellerInfo = outletContext.sellerInfo || {}
  const currentShopId = outletContext.currentShopId || sellerInfo.shopId || sellerInfo.id || currentUser?.shopId || ''
  const shopName = sellerInfo.shopName || currentUser?.shopName || currentUser?.fullName || ''

  // 2. State lưu danh sách đơn hàng và sản phẩm từ API
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 3. Tự động tải dữ liệu từ API khi vào trang Dashboard hoặc khi chuyển đổi shop
  useEffect(() => {
    let isMounted = true

    // Gọi đồng thời 2 API lấy danh sách đơn hàng và sản phẩm theo ID Shop từ json-server (port 5000)
    Promise.all([getOrders(), getProductsByShop(currentShopId)])
      .then(([ordersRes, productsRes]) => {
        if (!isMounted) return

        const ordersData = ordersRes?.data || ordersRes || []
        const productsData = productsRes?.data || productsRes || []

        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
      })
      .catch((err) => {
        console.error('Seller Dashboard: Error loading data from API:', err)
        if (isMounted) {
          setError('Unable to load data from API server. Please check connection.')
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
  }, [currentShopId])

  // =========================================================================
  // BƯỚC 1: LỌC ĐƠN HÀNG THUỘC VỀ SHOP HIỆN TẠI (ĐA SHOP ĐỘC LẬP)
  // =========================================================================
  const shopOrders = orders.filter((o) => {
    // 1. Khớp chính xác shopId của đơn
    if (o.shopId && currentShopId && o.shopId === currentShopId) return true
    // 2. Khớp theo từng sản phẩm trong đơn nếu có shopId
    if (Array.isArray(o.items) && currentShopId && o.items.some((item) => item.shopId === currentShopId)) return true
    // 3. Khớp theo shopName nếu có
    if (o.shopName && shopName && o.shopName.trim().toLowerCase() === shopName.trim().toLowerCase()) return true
    return false
  })

  // Sắp xếp đơn hàng theo thứ tự mới nhất giảm dần theo thời gian tạo
  const sortedShopOrders = [...shopOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0).getTime()
    const dateB = new Date(b.createdAt || b.date || 0).getTime()
    return dateB - dateA
  })

  // =========================================================================
  // BƯỚC 2: TÍNH TOÁN CÁC CHỈ SỐ KPI CHÍNH
  // Tính toán trực tiếp, chuẩn xác cho từng shop (không bị cộng gộp đơn đa shop)
  // =========================================================================

  // 1. Tổng doanh thu (Chỉ tính các món đồ thuộc quyền quản lý của shop trong các đơn không bị HỦY)
  const totalRevenue = shopOrders
    .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
    .reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : []
      const shopItems = items.filter(
        (item) =>
          !item.shopId ||
          item.shopId === currentShopId ||
          (item.shopName && shopName && item.shopName.trim().toLowerCase() === shopName.trim().toLowerCase()) ||
          o.shopId === currentShopId
      )
      if (shopItems.length === 0) return sum
      const shopSubtotal = shopItems.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      )
      return sum + shopSubtotal
    }, 0)

  // 2. Tổng số lượng đơn hàng của Shop
  const totalOrdersCount = shopOrders.length

  // 3. Tổng số lượng sản phẩm đã bán ra (Chỉ tính số lượng các món của shop trong các đơn hợp lệ)
  const totalProductsSoldCount = shopOrders
    .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
    .reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : []
      const shopItems = items.filter(
        (item) =>
          !item.shopId ||
          item.shopId === currentShopId ||
          (item.shopName && shopName && item.shopName.trim().toLowerCase() === shopName.trim().toLowerCase()) ||
          o.shopId === currentShopId
      )
      return sum + shopItems.reduce((itemSum, item) => itemSum + Number(item.quantity || 1), 0)
    }, 0)

  // =========================================================================
  // BƯỚC 3: THỐNG KÊ TOP 4 SẢN PHẨM BÁN CHẠY NHẤT (BEST SELLING PRODUCTS)
  // =========================================================================
  const salesMap = {}
  shopOrders.forEach((o) => {
    if ((o.status || '').toUpperCase() !== 'CANCELLED') {
      (o.items || []).forEach((item) => {
        if (
          item.id &&
          (!item.shopId || item.shopId === currentShopId || o.shopId === currentShopId)
        ) {
          salesMap[item.id] = (salesMap[item.id] || 0) + Number(item.quantity || 1)
        }
      })
    }
  })

  // Bổ sung thuộc tính soldCount và lấy top 4 sản phẩm
  const bestSellingProducts = products
    .map((p) => ({
      ...p,
      soldCount: salesMap[p.id] || 0,
    }))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 4)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Thông báo lỗi nếu không kết nối được API */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] font-mono">
          {error}
        </div>
      )}



      {/* 1. HÀNG 3 THẺ CHỈ SỐ HIỆU SUẤT (KPI METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doanh thu (REVENUE) */}
        <MetricCard
          label="REVENUE"
          value={formatVND(totalRevenue)}
          subtext="Total settled revenue"
          icon={CreditCard}
          loading={isLoading}
        />

        {/* Tổng số đơn hàng (ORDERS) */}
        <MetricCard
          label="ORDERS"
          value={totalOrdersCount}
          subtext="Processed store orders"
          icon={Package}
          loading={isLoading}
        />

        {/* Sản phẩm đã bán (PRODUCTS SOLD) */}
        <MetricCard
          label="PRODUCTS SOLD"
          value={totalProductsSoldCount}
          subtext="Garments & items dispatched"
          icon={CheckCircle2}
          loading={isLoading}
        />
      </div>

      {/* 2. BẢNG 5 ĐƠN HÀNG MỚI NHẤT (RECENT ORDERS - Đã sắp xếp theo thời gian mới nhất) */}
      <RecentOrdersTable
        orders={sortedShopOrders}
        loading={isLoading}
        maxDisplay={5}
        shopName={shopName}
      />

      {/* 3. LƯỚI TOP 4 SẢN PHẨM BÁN CHẠY NHẤT (BEST SELLING PRODUCTS) */}
      <BestSellingProducts
        products={bestSellingProducts}
        loading={isLoading}
        shopName={shopName}
      />
    </div>
  )
}
