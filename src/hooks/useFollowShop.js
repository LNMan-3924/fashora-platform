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

  // 2. Kiểm tra xem một shop có đang được người dùng theo dõi hay không (hỗ trợ cả id, slug và object shop)
  const isFollowing = useCallback(
    (shopIdOrSlug, shopObj = null) => {
      if (!shopIdOrSlug && !shopObj) return false
      const targets = new Set()

      const addTarget = (val) => {
        if (!val) return
        const str = String(val).trim().toLowerCase()
        if (!str) return
        targets.add(str)
        targets.add(str.replace(/^shop_/, ''))
        targets.add(`shop_${str.replace(/^shop_/, '')}`)
      }

      if (typeof shopIdOrSlug === 'object' && shopIdOrSlug !== null) {
        addTarget(shopIdOrSlug.id)
        addTarget(shopIdOrSlug.shopId)
        addTarget(shopIdOrSlug.slug)
      } else {
        addTarget(shopIdOrSlug)
      }

      if (shopObj) {
        addTarget(shopObj.id)
        addTarget(shopObj.shopId)
        addTarget(shopObj.slug)
      }

      return followingShopIds.some((id) => {
        const cleanId = String(id).trim().toLowerCase()
        return (
          targets.has(cleanId) ||
          targets.has(cleanId.replace(/^shop_/, '')) ||
          targets.has(`shop_${cleanId.replace(/^shop_/, '')}`)
        )
      })
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
            message: 'Please log in to follow this atelier.',
          },
        })
        return { success: false, requireAuth: true }
      }

      const canonicalId = shop.id || shop.shopId || shop.slug
      if (!canonicalId) return { success: false }

      // Không cho phép người bán tự theo dõi chính shop của mình
      if (
        currentUser?.shopId &&
        (currentUser.shopId === canonicalId ||
          currentUser.shopId === shop.id ||
          String(currentUser.shopId).toLowerCase() === String(canonicalId).toLowerCase())
      ) {
        return { success: false, isOwner: true }
      }

      const currentlyFollowed = isFollowing(canonicalId, shop)
      
      // Tập hợp các định danh cần loại bỏ nếu đang unfollow
      const removeSet = new Set([
        String(canonicalId).trim().toLowerCase(),
        String(canonicalId).replace(/^shop_/, '').trim().toLowerCase(),
        shop.slug ? String(shop.slug).trim().toLowerCase() : '',
        shop.id ? String(shop.id).trim().toLowerCase() : '',
      ].filter(Boolean))

      const nextList = currentlyFollowed
        ? followingShopIds.filter((id) => {
            const cleanId = String(id).trim().toLowerCase()
            return !removeSet.has(cleanId) && !removeSet.has(cleanId.replace(/^shop_/, ''))
          })
        : [...followingShopIds.filter((id) => {
            const cleanId = String(id).trim().toLowerCase()
            return !removeSet.has(cleanId) && !removeSet.has(cleanId.replace(/^shop_/, ''))
          }), canonicalId]

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
    async (shopOrId) => {
      if (!shopOrId || !currentUser?.id) return false

      const removeSet = new Set()
      const addIdentifier = (val) => {
        if (!val) return
        const str = String(val).trim().toLowerCase()
        if (!str) return
        removeSet.add(str)
        removeSet.add(str.replace(/^shop_/, ''))
      }

      if (typeof shopOrId === 'object' && shopOrId !== null) {
        addIdentifier(shopOrId.id)
        addIdentifier(shopOrId.shopId)
        addIdentifier(shopOrId.slug)
      } else {
        addIdentifier(shopOrId)
      }

      const nextList = followingShopIds.filter((id) => {
        const cleanId = String(id).trim().toLowerCase()
        return !removeSet.has(cleanId) && !removeSet.has(cleanId.replace(/^shop_/, ''))
      })

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
