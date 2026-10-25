import { COMMERCE_STORAGE_KEYS } from '../../constants'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import { useAuth } from '../../contexts/AuthContext'

/**
 * 1. AuthGuard: Bảo vệ các trang yêu cầu tài khoản người dùng (như /profile, /orders, /become-seller)
 * - Khi đang kiểm tra phiên đăng nhập: Hiển thị spinner tải trang
 * - Nếu chưa đăng nhập: Chuyển hướng ngay lập tức về /login kèm lưu trữ vị trí muốn truy cập
 */
export function AuthGuard({ children }) {
  const location = useLocation()
  const { currentUser, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-[2px] animate-spin" />
      </div>
    )
  }

  if (!currentUser || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children || <Outlet />
}

/**
 * 2. SellerGuard: Bảo vệ nghiêm ngặt toàn bộ Kênh Người Bán (/seller/*)
 * - Nghiêm cấm tuyệt đối người chưa đăng nhập truy cập vào trang người bán bằng đường dẫn trực tiếp (URL).
 * - Khi chưa đăng nhập (hoặc phiên đăng nhập không hợp lệ), lập tức chuyển hướng về trang /login.
 * - Sau khi đăng nhập: Chỉ người dùng có vai trò Người Bán (role: 'seller' hoặc có shopId) mới được phép vào Kênh Người Bán.
 * - Nếu là khách hàng thông thường (role: 'customer', chưa có shop) -> Chuyển hướng sang trang /become-seller.
 */
export function SellerGuard({ children }) {
  const location = useLocation()
  const { currentUser, isAuthenticated, loading } = useAuth()

  // 1. Đang tải phiên xác thực
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-[2px] animate-spin" />
      </div>
    )
  }

  // 2. Kiểm tra đăng nhập: Chưa đăng nhập -> Chuyển về /login
  if (!currentUser || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Kiểm tra vai trò: Phải là SELLER hoặc tài khoản đã liên kết shopId
  const userRole = String(currentUser.role || '').toLowerCase()
  const hasSellerRole =
    userRole === 'seller' ||
    (Array.isArray(currentUser.roles) &&
      currentUser.roles.map((r) => String(r).toLowerCase()).includes('seller'))
  const hasShopId = Boolean(currentUser.shopId && String(currentUser.shopId).trim() !== '')

  const isSeller = hasSellerRole || hasShopId

  // Nếu không phải người bán -> Chuyển hướng sang trang mở shop /become-seller
  if (!isSeller) {
    return <Navigate to="/become-seller" replace />
  }

  return children || <Outlet />
}

/**
 * 3. CheckoutGuard: Bảo vệ trang thanh toán /checkout
 * - Bắt buộc đăng nhập: Chưa login -> Chuyển hướng ngay sang /login
 * - Chưa có sản phẩm trong giỏ -> Chuyển về /cart
 */
export function CheckoutGuard({ children }) {
  const location = useLocation()
  const { currentUser, isAuthenticated, loading } = useAuth()
  const cartItems = useCartStore((state) => state.cartItems)

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-[2px] animate-spin" />
      </div>
    )
  }

  // Kiểm tra 1: Phải đăng nhập mới được checkout -> Chưa login thì chuyển về /login
  if (!currentUser || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kiểm tra 2: Giỏ hàng phải có hàng mới cho vào checkout (tránh gõ tay link khi giỏ rỗng)
  const selectedItems = location.state?.selectedItems || []
  let savedItems = []
  try {
    savedItems = JSON.parse(sessionStorage.getItem(COMMERCE_STORAGE_KEYS.CHECKOUT_ITEMS) || '[]')
  } catch {
    // ignore
  }
  const hasItems =
    cartItems.length > 0 ||
    selectedItems.length > 0 ||
    (Array.isArray(savedItems) && savedItems.length > 0)

  if (!hasItems) {
    return <Navigate to="/cart" replace />
  }

  return children || <Outlet />
}
