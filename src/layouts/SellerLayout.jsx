import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SellerSidebar from '../components/layout/SellerSidebar'
import SellerHeader from '../components/layout/SellerHeader'
import SellerFooter from '../components/layout/SellerFooter'

export default function SellerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

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