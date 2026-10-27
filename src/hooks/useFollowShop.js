import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateUser } from '../services/api'

// Mảng rỗng tĩnh để giữ nguyên tham chiếu ổn định khi người dùng chưa follow shop nào
const EMPTY_FOLLOWING_LIST = []

/**
 * Custom Hook: useFollowShop
 * Quản lý trạng thái theo dõi (Follow/Unfollow) các Gian hàng (Atelier Shops).
 * Dữ liệu lưu trữ tập trung vào currentUser trong AuthContext và database API, không dùng localStorage.
 *
 * @returns {object} { followingShopIds, isFollowing, toggleFollow, unfollowShop, isUpdating }
 */
export function useFollowShop() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, updateCurrentUser, isAuthenticated } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  // 1. Danh sách ID shop đang theo dõi lấy trực tiếp từ currentUser (AuthContext & API).
  // Dùng useMemo để giữ tham chiếu ổn định, tránh tạo mảng mới gây re-render các hàm useCallback bên dưới.
  const followingShopIds = useMemo(() => {
    return Array.isArray(currentUser?.followingShops)
      ? currentUser.followingShops
      : EMPTY_FOLLOWING_LIST
  }, [currentUser?.followingShops])

  // 2. Kiểm tra xem một shop có đang được người dùng theo dõi hay không
  const isFollowing = useCallback(
    (shopIdOrSlug) => {
      if (!shopIdOrSlug) return false
      const target = String(shopIdOrSlug).trim().toLowerCase()
      return followingShopIds.some((id) => String(id).trim().toLowerCase() === target)
    },
    [followingShopIds]
  )

  // 3. Xử lý Bật/Tắt theo dõi một shop (Toggle Follow)
  const toggleFollow = useCallback(
    async (shop) => {
      if (!shop) return { success: false }

      // Nếu chưa đăng nhập, chuyển hướng người dùng đến trang Login
      if (!isAuthenticated || !currentUser?.id) {
        navigate('/login', {
          state: {
            from: location,
            message: 'Vui lòng đăng nhập để theo dõi gian hàng này.',
          },
        })
        return { success: false, requireAuth: true }
      }

      const shopId = shop.id || shop.shopId || shop.slug
      if (!shopId) return { success: false }

      // Không cho phép người bán tự theo dõi chính shop của mình
      if (currentUser?.shopId && (currentUser.shopId === shopId || currentUser.shopId === shop.id)) {
        return { success: false, isOwner: true }
      }

      const currentlyFollowed = isFollowing(shopId)
      const nextList = currentlyFollowed
        ? followingShopIds.filter((id) => String(id).toLowerCase() !== String(shopId).toLowerCase())
        : [...followingShopIds, shopId]

      setIsUpdating(true)
      try {
        // Cập nhật trực tiếp lên API db.json
        const res = await updateUser(currentUser.id, { followingShops: nextList })
        const updatedUser = res?.data || { ...currentUser, followingShops: nextList }

        // Đồng bộ AuthContext toàn cục
        updateCurrentUser(updatedUser)

        return {
          success: true,
          isNowFollowing: !currentlyFollowed,
          shopName: shop.name || shop.shopName || 'Shop',
        }
      } catch (err) {
        console.error('Lỗi cập nhật theo dõi shop:', err)
        return { success: false, error: err }
      } finally {
        setIsUpdating(false)
      }
    },
    [currentUser, isAuthenticated, followingShopIds, isFollowing, location, navigate, updateCurrentUser]
  )

  // 4. Hàm hủy theo dõi trực tiếp (Dùng cho nút Unfollow trên danh sách)
  const unfollowShop = useCallback(
    async (shopId) => {
      if (!shopId || !currentUser?.id) return false
      const nextList = followingShopIds.filter(
        (id) => String(id).toLowerCase() !== String(shopId).toLowerCase()
      )

      setIsUpdating(true)
      try {
        const res = await updateUser(currentUser.id, { followingShops: nextList })
        const updatedUser = res?.data || { ...currentUser, followingShops: nextList }
        updateCurrentUser(updatedUser)
        return true
      } catch (err) {
        console.error('Lỗi khi hủy theo dõi shop:', err)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [currentUser, followingShopIds, updateCurrentUser]
  )

  return {
    followingShopIds,
    isFollowing,
    toggleFollow,
    unfollowShop,
    isUpdating,
  }
}

export default useFollowShop
