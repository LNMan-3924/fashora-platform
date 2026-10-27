import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateUser } from '../services/api'

// Khóa lưu tạm danh sách shop theo dõi trong LocalStorage làm bộ đệm
const STORAGE_KEY = 'fashora_following_shops'

/**
 * Custom Hook: useFollowShop
 * Quản lý trạng thái theo dõi (Follow/Unfollow) các Gian hàng (Atelier Shops).
 * Tái sử dụng đồng bộ giữa Storefront (Trang xem shop) và trang Quản lý Shop Đang Theo Dõi.
 *
 * @returns {object} { followingShopIds, isFollowing, toggleFollow, unfollowShop, isLoading }
 */
export function useFollowShop() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, updateCurrentUser, isAuthenticated } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  // 1. Lấy danh sách ID các shop đang theo dõi
  // Ưu tiên từ currentUser.followingShops trong database, nếu chưa có thì đọc từ LocalStorage
  const followingShopIds = useMemo(() => {
    if (Array.isArray(currentUser?.followingShops)) {
      return currentUser.followingShops
    }
    try {
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(local) ? local : []
    } catch {
      return []
    }
  }, [currentUser?.followingShops])

  // Đồng bộ vào localStorage mỗi khi danh sách thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(followingShopIds))
    } catch {
      // ignore
    }
  }, [followingShopIds])

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
        // Cập nhật lên API db.json
        const res = await updateUser(currentUser.id, { followingShops: nextList })
        const updatedUser = res?.data || { ...currentUser, followingShops: nextList }

        // Đồng bộ AuthContext
        updateCurrentUser(updatedUser)

        // Cập nhật LocalStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
        } catch {
          // ignore
        }

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
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

