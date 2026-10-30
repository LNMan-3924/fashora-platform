import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState, Toast } from '../../components/common'
import { FollowingShopCard } from '../../components/shop'
import { getShops, getProducts } from '../../services/api'
import { toShopSlug } from '../../constants/commerce'
import { useFollowShop } from '../../hooks/useFollowShop'

/**
 * Trang Quản lý Các Gian Hàng Đang Theo Dõi (Following Shops Page)
 * - Truy cập từ menu thả xuống (Dropdown) của Profile trên thanh Header hoặc trang Profile cá nhân.
 * - Giao diện tối giản, phong cách Atelier quốc tế (English UI).
 * - Nửa trên thẻ shop dùng ảnh bìa (coverImage) làm background, tên shop và category đóng khung nền trắng sắc nét.
 * - Nút hành động mang tên "FOLLOWING".
 * - Hiệu năng cao: Sử dụng Set/Map O(1) tra cứu, gom tối đa 5 sản phẩm/shop bằng 1 vòng lặp O(N) duy nhất,
 *   kết hợp memoization ngăn chặn re-render không cần thiết.
 */
export default function FollowingShops() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { followingShopIds, unfollowShop } = useFollowShop()

  // 1. Quản lý trạng thái dữ liệu từ API
  const [allShops, setAllShops] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [unfollowingId, setUnfollowingId] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Tự động cuộn lên đầu trang khi vào trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // 2. Tải danh mục shops và products từ API db.json (gọi song song qua Promise.all)
  useEffect(() => {
    let isMounted = true

    Promise.all([getShops(), getProducts()])
      .then(([shopsRes, productsRes]) => {
        if (!isMounted) return
        const shopsData = Array.isArray(shopsRes?.data) ? shopsRes.data : []
        const productsData = Array.isArray(productsRes?.data) ? productsRes.data : []

        setAllShops(shopsData)
        setAllProducts(productsData)
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách gian hàng theo dõi:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 3. Tối ưu hiệu năng: Lọc danh sách shop theo dõi bằng Set O(1)
  const followedShops = useMemo(() => {
    if (!allShops.length || !followingShopIds.length) return []
    const idSet = new Set(followingShopIds.map((id) => String(id).trim().toLowerCase()))

    return allShops.filter((s) => {
      const sId = String(s.id || '').trim().toLowerCase()
      const sSlug = String(s.slug || '').trim().toLowerCase()
      const sNameSlug = toShopSlug(s.name)

      return (
        idSet.has(sId) ||
        idSet.has(sSlug) ||
        idSet.has(sNameSlug) ||
        idSet.has(`shop_${sSlug}`) ||
        idSet.has(sId.replace(/^shop_/, ''))
      )
    })
  }, [allShops, followingShopIds])

  // 4. Tối ưu hiệu năng: Thu thập sản phẩm bằng 1 vòng lặp O(N) duy nhất,
  // chỉ gom tối đa 5 sản phẩm cho mỗi shop đang theo dõi (thay vì lặp lồng O(N*M)).
  const productsByShopMap = useMemo(() => {
    if (!followedShops.length || !allProducts.length) return {}

    // Bảng tra cứu Map O(1)
    const shopLookup = new Map()
    const map = {}

    followedShops.forEach((s) => {
      map[s.id] = []
      if (s.id) shopLookup.set(String(s.id).trim().toLowerCase(), s.id)
      if (s.name) shopLookup.set(String(s.name).trim().toLowerCase(), s.id)
    })

    // Duyệt 1 vòng lặp duy nhất qua allProducts
    for (let i = 0; i < allProducts.length; i++) {
      const p = allProducts[i]
      const targetShopId =
        (p.shopId && shopLookup.get(String(p.shopId).trim().toLowerCase())) ||
        (p.shopName && shopLookup.get(String(p.shopName).trim().toLowerCase()))

      if (targetShopId && map[targetShopId] && map[targetShopId].length < 5) {
        map[targetShopId].push(p)
      }
    }

    return map
  }, [followedShops, allProducts])

  // 5. Xử lý Hủy theo dõi một shop (bọc useCallback giữ hàm ổn định)
  const handleUnfollow = useCallback(
    async (shopId, shopName) => {
      setUnfollowingId(shopId)
      const success = await unfollowShop(shopId)
      setUnfollowingId(null)

      if (success) {
        setToastMessage(t('following.unfollowedToast', { name: shopName || 'atelier', defaultValue: `Unfollowed ${shopName || 'atelier'} successfully.` }))
        setTimeout(() => setToastMessage(''), 3000)
      }
    },
    [unfollowShop, t]
  )

  return (
    <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
      {/* 1. THANH ĐIỀU HƯỚNG BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 mb-4 text-xs font-mono tracking-widest text-neutral-400 uppercase"
      >
        <Link to="/home" className="hover:text-black transition-colors">
          {t('nav.home', 'HOME')}
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-black font-semibold">{t('following.pageTitle', 'FOLLOWING SHOPS')}</span>
      </nav>

      {/* 2. TIÊU ĐỀ TRANG TỐI GIẢN (ĐỒNG BỘ INTER & THU NHỎ ĐỀ MỤC) */}
      <div className="pb-5 border-b border-[#E5E5E5] mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] uppercase font-sans">
          {t('following.pageTitle', 'FOLLOWING SHOPS')}
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#666666] font-sans leading-relaxed tracking-wide">
          {t('following.subtitle', 'Ateliers and brands you are following.')}
        </p>
      </div>

      {/* 3. KHUNG HIỂN THỊ DANH SÁCH SHOP THEO DÕI THEO CHIỀU DỌC */}
      {isLoading ? (
        // Khung chờ Skeleton khi đang tải từ API
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white border border-neutral-200 rounded-[2px] animate-pulse overflow-hidden"
            >
              {/* Skeleton Cover Banner */}
              <div className="h-36 sm:h-40 bg-neutral-200" />
              {/* Skeleton Products Row */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-[2px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : followedShops.length > 0 ? (
        // Hiển thị danh sách các thẻ hàng dọc
        <div className="space-y-6">
          {followedShops.map((shop) => (
            <FollowingShopCard
              key={shop.id || shop.slug}
              shop={shop}
              products={productsByShopMap[shop.id] || []}
              onUnfollow={handleUnfollow}
              isUnfollowing={unfollowingId === (shop.id || shop.slug)}
            />
          ))}
        </div>
      ) : (
        // Hiển thị trạng thái EMPTY tối giản chuẩn quốc tế kèm CTA
        <EmptyState
          title={t('following.emptyTitle', 'NO ATELIERS FOLLOWED')}
          description={t('following.emptyDesc', 'You are not following any ateliers yet. Explore our curated independent brands and ateliers.')}
          actionText={t('following.exploreAteliers', 'DISCOVER ATELIERS')}
          onAction={() => navigate('/shop')}
        />
      )}

      {/* 4. TOAST THÔNG BÁO DÙNG CHUNG */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  )
}
