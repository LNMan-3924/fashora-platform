import { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getShopById, getShops } from '../services/api'
import SellerSidebar from '../components/layout/SellerSidebar'
import SellerHeader from '../components/layout/SellerHeader'
import SellerFooter from '../components/layout/SellerFooter'

/**
 * Layout Kênh Người Bán (Seller Layout):
 * - Bảo vệ đa tầng: Nghiêm cấm tuyệt đối người chưa đăng nhập truy cập vào trang người bán
 *   bằng URL hay bất kỳ đường dẫn nào.
 * - Khi chưa đăng nhập -> Lập tức chuyển hướng về trang /login.
 * - Đa shop độc lập (Multi-Tenant Seller): Tự động nạp đúng thông tin shop của tài khoản đang đăng nhập
 *   (Ví dụ: an@gmail.com -> M STUDIO, leman200x@gmail.com -> L'OBSCUR ATELIER).
 * - Truyền dữ liệu sellerInfo và currentShopId thông qua Outlet context cho toàn bộ các trang con.
 */
export default function SellerLayout() {
  const { currentUser, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Khởi tạo thông tin seller mặc định
  const [sellerInfo, setSellerInfo] = useState(() => {
    try {
      const savedShop = localStorage.getItem('fashora_current_shop')
      if (savedShop) {
        const parsed = JSON.parse(savedShop)
        return parsed
      }
    } catch {
      // ignore
    }
    return {
      id: 'shop_m_studio',
      shopId: 'shop_m_studio',
      shopName: 'M STUDIO',
      sellerCode: 'SELLER #MS-8021',
      currency: 'VND (₫)'
    }
  })

  // Tự động tải dữ liệu Shop theo tài khoản người dùng đang đăng nhập
  useEffect(() => {
    let isMounted = true

    const resolveSellerShop = async () => {
      if (!currentUser) return

      try {
        let targetShop = null
        const targetShopId = currentUser.shopId

        // 1. Thử lấy thông tin shop theo shopId của tài khoản
        if (targetShopId) {
          try {
            const res = await getShopById(targetShopId)
            if (res?.data && (res.data.id === targetShopId || res.data._id === targetShopId || res.data.slug)) {
              targetShop = res.data
            }
          } catch (err) {
            console.warn('SellerLayout: getShopById fallback:', err)
          }
        }

        // 2. Nếu chưa tìm thấy, duyệt danh sách /shops theo ownerId hoặc ownerEmail
        if (!targetShop) {
          try {
            const shopsRes = await getShops()
            const shopsList = Array.isArray(shopsRes?.data) ? shopsRes.data : []
            targetShop = shopsList.find(
              (s) =>
                (currentUser.id && s.ownerId === currentUser.id) ||
                (currentUser.email && s.ownerEmail === currentUser.email) ||
                (targetShopId && s.id === targetShopId)
            )
          } catch (err) {
            console.warn('SellerLayout: getShops fallback:', err)
          }
        }

        // 3. Fallback định danh theo tài khoản thực nghiệm
        if (!targetShop) {
          if (currentUser.email === 'leman200x@gmail.com' || targetShopId === 'shop_l-obscur-atelier_8158') {
            targetShop = {
              id: 'shop_l-obscur-atelier_8158',
              name: "L'OBSCUR ATELIER",
              slug: 'l-obscur-atelier',
              sellerCode: 'SELLER #LOB-8158',
              currency: 'VND (₫)'
            }
          } else if (currentUser.email === 'an@gmail.com' || targetShopId === 'shop_m_studio') {
            targetShop = {
              id: 'shop_m_studio',
              name: 'M STUDIO',
              slug: 'm-studio',
              sellerCode: 'SELLER #MS-8021',
              currency: 'VND (₫)'
            }
          }
        }

        if (targetShop && isMounted) {
          const resolvedShopId = targetShop.id || targetShopId || 'shop_m_studio'
          const resolvedName = targetShop.name || 'YOUR ATELIER'
          const resolvedCode =
            targetShop.sellerCode ||
            `SELLER #${(targetShop.slug || resolvedName)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .slice(0, 3)}-${String(resolvedShopId).replace(/[^0-9]/g, '').slice(-4) || '8021'}`

          const newSellerInfo = {
            id: resolvedShopId,
            shopId: resolvedShopId,
            shopName: resolvedName,
            sellerCode: resolvedCode,
            currency: targetShop.currency || 'VND (₫)',
            logo: targetShop.logo || '/assets/logo.png',
            slug: targetShop.slug
          }

          setSellerInfo(newSellerInfo)
          localStorage.setItem('fashora_current_shop', JSON.stringify(newSellerInfo))
          return
        }
      } catch (error) {
        console.error('SellerLayout: Lỗi xác định thông tin shop:', error)
      }

      // 4. Nếu không gọi được API, kiểm tra dữ liệu lưu tạm trong localStorage
      try {
        const savedShop = localStorage.getItem('fashora_current_shop')
        if (savedShop && isMounted) {
          const parsed = JSON.parse(savedShop)
          setSellerInfo(parsed)
        }
      } catch {
        // Giữ nguyên sellerInfo
      }
    }

    resolveSellerShop()

    const handleStorageChange = () => {
      try {
        const savedShop = localStorage.getItem('fashora_current_shop')
        if (savedShop) {
          setSellerInfo(JSON.parse(savedShop))
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [currentUser])

  // Đổi tiêu đề Dashboard / Products / Orders tùy theo URL
  const getPageTitle = () => {
    if (location.pathname.includes('/seller/products')) return 'PRODUCTS'
    if (location.pathname.includes('/seller/orders')) return 'ORDERS'
    return 'DASHBOARD'
  }

  // 1. Kiểm tra trạng thái xác thực: Nếu đang tải dữ liệu phiên đăng nhập
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-[2px] animate-spin" />
      </div>
    )
  }

  // 2. Chặn tuyệt đối người chưa đăng nhập: Chuyển hướng ngay về /login kèm vị trí URL muốn truy cập
  if (!currentUser || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const activeShopId = sellerInfo?.shopId || sellerInfo?.id || currentUser?.shopId || 'shop_m_studio'

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      {/* Drawer menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <SellerSidebar
              sellerInfo={sellerInfo}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Khung chính chia 2 cột */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 overflow-y-auto">
          <SellerSidebar sellerInfo={sellerInfo} />
        </aside>

        {/* Nội dung bên phải */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Header đen của Seller */}
            <SellerHeader
              shopName={sellerInfo.shopName}
              pageTitle={getPageTitle()}
              onOpenMobile={() => setIsMobileMenuOpen(true)}
            />

            {/* Ruột trang thay đổi theo từng trang - truyền context sellerInfo & currentShopId */}
            <main className="p-6 sm:p-10">
              <Outlet context={{ sellerInfo, currentShopId: activeShopId }} />
            </main>
          </div>

          {/* Footer đen dưới cùng */}
          <SellerFooter
            shopName={sellerInfo.shopName}
            currency={sellerInfo.currency}
          />
        </div>
      </div>
    </div>
  )
}
