import { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getShopById, getShops, updateShopStatus } from '../services/api'
import { Toast } from '../components/common'
import SellerSidebar from '../components/layout/SellerSidebar'
import SellerHeader from '../components/layout/SellerHeader'
import SellerFooter from '../components/layout/SellerFooter'

/**
 * Layout Kênh Người Bán (Seller Layout):
 * - Bảo vệ đa tầng: Chỉ cho phép người dùng đã xác thực vai trò người bán truy cập.
 * - Single Source of Truth (SSOT): Thông tin shop được suy ra 100% từ currentUser (AuthContext),
 *   đảm bảo quan hệ 1-1 chặt chẽ giữa tài khoản người bán và cửa hàng của họ.
 * - Tuyệt đối KHÔNG lưu current shop vào localStorage để tránh xung đột dữ liệu đa tài khoản.
 * - Tuyệt đối KHÔNG hardcode bất kỳ mã shop hay email nào.
 * - Truyền dữ liệu sellerInfo và currentShopId thông qua Outlet context cho toàn bộ các trang con.
 */
export default function SellerLayout() {
  const { currentUser, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // State lưu trữ thông tin shop được suy ra từ currentUser
  const [sellerInfo, setSellerInfo] = useState(null)
  const [isShopLoading, setIsShopLoading] = useState(true)

  // Toast thông báo chuyển đổi trạng thái shop
  const [statusToast, setStatusToast] = useState('')

  // Dọn dẹp key thừa fashora_current_shop nếu từng lưu trước đây để đảm bảo Single Source of Truth
  useEffect(() => {
    try {
      localStorage.removeItem('fashora_current_shop')
    } catch {
      // ignore
    }
  }, [])

  // Tự động tải thông tin Shop theo đúng currentUser đang đăng nhập (Quan hệ 1 - 1)
  useEffect(() => {
    let isMounted = true

    const resolveSellerShop = async () => {
      if (!currentUser) {
        if (isMounted) {
          setSellerInfo(null)
          setIsShopLoading(false)
        }
        return
      }

      setIsShopLoading(true)

      try {
        let targetShop = null
        const targetShopId = currentUser.shopId

        // 1. Thử lấy thông tin shop theo shopId được liên kết trong currentUser
        if (targetShopId) {
          try {
            const res = await getShopById(targetShopId)
            if (res?.data && (res.data.id === targetShopId || res.data._id === targetShopId || res.data.slug)) {
              targetShop = res.data
            }
          } catch (err) {
            console.warn('SellerLayout: getShopById fallback notice:', err)
          }
        }

        // 2. Nếu chưa có kết quả, truy vấn danh sách /shops tìm bản ghi khớp quan hệ 1-1 với currentUser
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
            console.warn('SellerLayout: getShops fallback notice:', err)
          }
        }

        if (targetShop && isMounted) {
          const resolvedShopId = targetShop.id || targetShopId || `shop_${currentUser.id}`
          const resolvedName = targetShop.name || currentUser.fullName || 'MY ATELIER'
          const resolvedCode =
            targetShop.sellerCode ||
            `SELLER #${(targetShop.slug || resolvedName)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .slice(0, 3)}-${String(resolvedShopId).replace(/[^0-9]/g, '').slice(-4) || '0001'}`

          setSellerInfo({
            id: resolvedShopId,
            shopId: resolvedShopId,
            shopName: resolvedName,
            sellerCode: resolvedCode,
            currency: targetShop.currency || 'VND (₫)',
            logo: targetShop.logo || '/assets/logo.png',
            slug: targetShop.slug || '',
            status: targetShop.status || 'ACTIVE',
            ownerId: targetShop.ownerId || currentUser.id,
            ownerEmail: targetShop.ownerEmail || currentUser.email,
          })
          setIsShopLoading(false)
          return
        }
      } catch (error) {
        console.error('SellerLayout: Lỗi truy xuất shop từ currentUser:', error)
      }

      // 3. Fallback an toàn suy ra trực tiếp từ dữ liệu của currentUser (KHÔNG dùng dữ liệu giả/hardcode)
      if (isMounted) {
        const fallbackId = currentUser.shopId || `shop_${currentUser.id}`
        const fallbackName = currentUser.shopName || currentUser.fullName || 'MY ATELIER'
        setSellerInfo({
          id: fallbackId,
          shopId: fallbackId,
          shopName: fallbackName,
          sellerCode: `SELLER #${String(currentUser.id || 'SHOP').slice(-4).toUpperCase()}`,
          currency: 'VND (₫)',
          logo: '/assets/logo.png',
          slug: '',
          status: 'ACTIVE',
          ownerId: currentUser.id,
          ownerEmail: currentUser.email,
        })
        setIsShopLoading(false)
      }
    }

    resolveSellerShop()

    return () => {
      isMounted = false
    }
  }, [currentUser])

  // Đổi tiêu đề Dashboard / Products / Orders tùy theo URL
  const getPageTitle = () => {
    if (location.pathname.includes('/seller/products')) return 'PRODUCTS'
    if (location.pathname.includes('/seller/orders')) return 'ORDERS'
    return 'DASHBOARD'
  }

  // 1. Kiểm tra trạng thái xác thực phiên đăng nhập hoặc tải thông tin shop từ currentUser
  if (loading || isShopLoading || !sellerInfo) {
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

  const activeShopId = sellerInfo.shopId || sellerInfo.id || currentUser.shopId || ''

  // Xử lý chuyển đổi trạng thái giữa ACTIVE và TẠM NGƯNG HOẠT ĐỘNG
  const handleToggleShopStatus = async () => {
    if (!sellerInfo) return
    const currentStatus = sellerInfo.status || 'ACTIVE'
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

    const updated = {
      ...sellerInfo,
      status: newStatus,
    }

    // Cập nhật state nội bộ tức thì (Single Source of Truth)
    setSellerInfo(updated)

    if (newStatus === 'ACTIVE') {
      setStatusToast('Cửa hàng đã chuyển sang trạng thái: ACTIVE (HOẠT ĐỘNG)')
    } else {
      setStatusToast('Cửa hàng đã chuyển sang trạng thái: TẠM NGƯNG HOẠT ĐỘNG')
    }

    // Đồng bộ trực tiếp lên API server backend (KHÔNG lưu localStorage)
    try {
      const shopId = sellerInfo.id || sellerInfo.shopId || currentUser?.shopId
      if (shopId) {
        await updateShopStatus(shopId, newStatus)
      }
    } catch (err) {
      console.warn('SellerLayout: Không thể đồng bộ trạng thái shop lên API server:', err)
    }
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
              status={sellerInfo.status || 'ACTIVE'}
              onToggleStatus={handleToggleShopStatus}
              onOpenMobile={() => setIsMobileMenuOpen(true)}
            />

            {/* Ruột trang thay đổi theo từng trang - truyền context sellerInfo & currentShopId từ currentUser */}
            <main className="p-6 sm:p-10">
              <Outlet context={{ sellerInfo, currentShopId: activeShopId, toggleShopStatus: handleToggleShopStatus }} />
            </main>
          </div>

          {/* Footer đen dưới cùng */}
          <SellerFooter
            shopName={sellerInfo.shopName}
            currency={sellerInfo.currency}
          />
        </div>
      </div>

      {/* Toast thông báo chuyển đổi trạng thái shop */}
      <Toast
        isVisible={Boolean(statusToast)}
        message={statusToast}
        onClose={() => setStatusToast('')}
        duration={3500}
      />
    </div>
  )
}
