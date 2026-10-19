import { useState, useEffect, useMemo } from 'react'
import { CreditCard, Package, CheckCircle2 } from 'lucide-react'
import { formatVND } from '../../constants/commerce'
import { getOrders, getProducts } from '../../services/api'
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
 * - Sử dụng dữ liệu thực tế 100% từ API backend (GET /orders, GET /products), KHÔNG dùng mockData tĩnh.
 * - Tự động tính toán các chỉ số doanh thu, đơn hàng, sản phẩm bán ra theo thời gian thực.
 * - Tối ưu tái sử dụng các hàm định dạng có sẵn (formatVND, handleImageError, FALLBACK_IMAGE).
 */
export default function Dashboard() {
  // 1. State lưu danh sách đơn hàng và sản phẩm từ API
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 2. Tự động tải dữ liệu từ API khi vào trang Dashboard
  useEffect(() => {
    let isMounted = true

    // Gọi đồng thời 2 API lấy danh sách đơn hàng và sản phẩm từ json-server (port 5000)
    Promise.all([getOrders(), getProducts()])
      .then(([ordersRes, productsRes]) => {
        if (!isMounted) return

        const ordersData = ordersRes?.data || ordersRes || []
        const productsData = productsRes?.data || productsRes || []

        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
      })
      .catch((err) => {
        console.error('Seller Dashboard: Lỗi tải dữ liệu từ API:', err)
        if (isMounted) {
          setError('Không thể tải dữ liệu từ máy chủ API. Vui lòng kiểm tra kết nối.')
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

  // =========================================================================
  // BƯỚC 1: LỌC ĐƠN HÀNG THUỘC VỀ SHOP HIỆN TẠI (M STUDIO)
  // =========================================================================
  const shopOrders = useMemo(() => {
    return orders.filter(
      (o) => !o.shopName || o.shopName === 'M STUDIO' || o.shopId === 'shop_m_studio'
    )
  }, [orders])

  // =========================================================================
  // BƯỚC 2: TÍNH TOÁN CÁC CHỈ SỐ KPI CHÍNH
  // =========================================================================

  // 1. Tổng doanh thu (Chỉ tính các đơn hàng hợp lệ, không cộng các đơn đã bị HỦY - CANCELLED)
  const totalRevenue = useMemo(() => {
    return shopOrders
      .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.total ?? o.totalAmount ?? 0), 0)
  }, [shopOrders])

  // 2. Tổng số lượng đơn hàng của Shop
  const totalOrdersCount = shopOrders.length

  // 3. Tổng số lượng sản phẩm đã bán ra (Tổng quantity của tất cả món đồ trong các đơn hợp lệ)
  const totalProductsSoldCount = useMemo(() => {
    return shopOrders
      .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
      .reduce((sum, o) => {
        const items = o.items || []
        return sum + items.reduce((itemSum, item) => itemSum + Number(item.quantity || 1), 0)
      }, 0)
  }, [shopOrders])

  // =========================================================================
  // BƯỚC 3: THỐNG KÊ TOP 4 SẢN PHẨM BÁN CHẠY NHẤT (BEST SELLING PRODUCTS)
  // =========================================================================
  const bestSellingProducts = useMemo(() => {
    // Đếm số lượng bán thực tế của từng sản phẩm từ các đơn hàng
    const salesMap = {}
    shopOrders.forEach((o) => {
      if ((o.status || '').toUpperCase() !== 'CANCELLED') {
        (o.items || []).forEach((item) => {
          if (item.id) {
            salesMap[item.id] = (salesMap[item.id] || 0) + Number(item.quantity || 1)
          }
        })
      }
    })

    // Bổ sung thuộc tính soldCount vào danh sách sản phẩm lấy từ API
    const enrichedProducts = products.map((p) => ({
      ...p,
      soldCount: salesMap[p.id] || 0,
    }))

    // Sắp xếp: Ưu tiên sản phẩm bán nhiều nhất -> Lấy 4 sản phẩm đứng đầu
    return enrichedProducts
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 4)
  }, [products, shopOrders])

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

      {/* 2. BẢNG 5 ĐƠN HÀNG MỚI NHẤT (RECENT ORDERS) */}
      <RecentOrdersTable
        orders={shopOrders}
        loading={isLoading}
        maxDisplay={5}
      />

      {/* 3. LƯỚI TOP 4 SẢN PHẨM BÁN CHẠY NHẤT (BEST SELLING PRODUCTS) */}
      <BestSellingProducts
        products={bestSellingProducts}
        loading={isLoading}
      />
    </div>
  )
}