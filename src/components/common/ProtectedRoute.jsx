import { Navigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'

/**
 * 1. AuthGuard: Bảo vệ các trang yêu cầu tài khoản (như /profile, /orders)
 * Chưa đăng nhập -> Đá về /login
 */
export function AuthGuard({ children }) {
  const location = useLocation()
  const currentUserId = localStorage.getItem('currentUserId')

  if (!currentUserId) {
    // Lưu lại vị trí trang hiện tại để sau khi login thành công có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * 2. CheckoutGuard: Bảo vệ trang thanh toán /checkout
 * - Chưa có sản phẩm trong giỏ hoặc chưa tick chọn sản phẩm -> Đá về /cart
 * - (Tùy chọn) Chưa đăng nhập -> Đá về /login
 */
export function CheckoutGuard({ children }) {
  const location = useLocation()
  const currentUserId = localStorage.getItem('currentUserId')
  const cartItems = useCartStore((state) => state.cartItems)

  // Kiểm tra 1: Phải đăng nhập mới được checkout
  if (!currentUserId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kiểm tra 2: Giỏ hàng phải có hàng mới cho vào checkout (tránh gõ tay link khi giỏ rỗng)
  const selectedItems = location.state?.selectedItems || []
  let savedItems = []
  try {
    savedItems = JSON.parse(sessionStorage.getItem('fashora_checkout_items') || '[]')
  } catch {
    // ignore
  }
  const hasItems = cartItems.length > 0 || selectedItems.length > 0 || (Array.isArray(savedItems) && savedItems.length > 0)

  if (!hasItems) {
    return <Navigate to="/cart" replace />
  }

  return children
}