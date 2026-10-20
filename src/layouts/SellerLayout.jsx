import { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SellerSidebar from '../components/layout/SellerSidebar'
import SellerHeader from '../components/layout/SellerHeader'
import SellerFooter from '../components/layout/SellerFooter'

/**
 * Layout Kênh Người Bán (Seller Layout):
 * - Bảo vệ đa tầng: Nghiêm cấm tuyệt đối người chưa đăng nhập truy cập vào trang người bán
 *   bằng URL hay bất kỳ đường dẫn nào.
 * - Khi chưa đăng nhập -> Lập tức chuyển hướng về trang /login.
 * - Khung giao diện chia 2 cột: Sidebar trái (Desktop), Drawer menu (Mobile), Header và Footer.
 */
export default function SellerLayout() {
  const { currentUser, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mặc định là M STUDIO nếu chưa có ai đăng ký mới
  const [sellerInfo, setSellerInfo] = useState({
    shopName: 'M STUDIO',
    sellerCode: 'SELLER #MS-8021',
    currency: 'VND (₫)'
  })

  // Tự động lắng nghe nếu có shop mới được đăng ký từ BECOME A SELLER
  useEffect(() => {
    const loadShopInfo = () => {
      try {
        const savedShop = localStorage.getItem('fashora_current_shop')
        if (savedShop) {
          setSellerInfo(JSON.parse(savedShop))
        }
      } catch {
        // Giữ mặc định M STUDIO
      }
    }

    loadShopInfo()
    window.addEventListener('storage', loadShopInfo)
    return () => window.removeEventListener('storage', loadShopInfo)
  }, [])

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

            {/* Ruột trang thay đổi theo từng trang */}
            <main className="p-6 sm:p-10">
              <Outlet />
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
