import { Navigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import { useAuth } from '../../contexts/AuthContext'

/**
 * 1. AuthGuard: Bảo vệ các trang yêu cầu tài khoản (như /profile, /orders)
 * Chưa đăng nhập -> Chuyển hướng về /login kèm ghi nhớ location
 */
export function AuthGuard({ children }) {
  const location = useLocation()
  const { currentUser, loading } = useAuth()
  const currentUserId = localStorage.getItem('currentUserId')

  if (loading) {
    return (
      <div className="w-full py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser && !currentUserId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * 2. CheckoutGuard: Bảo vệ trang thanh toán /checkout
 * - Bắt buộc đăng nhập: Chưa login -> Chuyển hướng ngay sang /login
 * - Chưa có sản phẩm trong giỏ -> Chuyển về /cart
 */
export function CheckoutGuard({ children }) {
  const location = useLocation()
  const { currentUser, loading } = useAuth()
  const currentUserId = localStorage.getItem('currentUserId')
  const cartItems = useCartStore((state) => state.cartItems)

  if (loading) {
    return (
      <div className="w-full py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Kiểm tra 1: Phải đăng nhập mới được checkout -> Chưa login thì đá về /login
  if (!currentUser && !currentUserId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kiểm tra 2: Giỏ hàng phải có hàng mới cho vào checkout (tránh gõ tay link khi giỏ rỗng)
  const selectedItems = location.state?.selectedItems || []
  const hasItems = cartItems.length > 0 || selectedItems.length > 0

  if (!hasItems) {
    return <Navigate to="/cart" replace />
  }

  return children
}