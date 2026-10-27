import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatVND, handleImageError, FALLBACK_IMAGE, toShopSlug } from '../../constants/commerce'

/**
 * Component FollowingShopCard: Minimal, high-end atelier row for followed shops
 * - Nửa trên (Cover Banner): Sử dụng ảnh bìa của shop (coverImage) làm background.
 *   + Lớp gradient tối mờ nhẹ (dark gradient overlay) ở chân banner.
 *   + Tên shop màu trắng thanh lịch, category màu trắng sáng/xám mờ (không còn khối trắng đục).
 *   + Logo/Avatar bọc viền kính mờ (frosted glass / backdrop-blur).
 *   + Nút "FOLLOWING" dạng ghost pill button (bo tròn, viền mỏng trong suốt / kính mờ).
 * - Nửa dưới (Sản phẩm):
 *   + Nền thẻ sản phẩm giữ màu nguyên bản (#FAFAFA).
 *   + Khoảng đệm (padding) bên dưới và xung quanh thoáng đãng để chữ dễ đọc.
 *   + Tên sản phẩm hiển thị tối đa 2 dòng (line-clamp-2), font-size 12px - 13px, không bị cắt cụt dấu 3 chấm.
 *   + Giá tiền to, sắc nét và nổi bật.
 */
function FollowingShopCard({
  shop = {},
  products = [],
  onUnfollow,
  isUnfollowing = false,
}) {
  const shopSlug = shop.slug || toShopSlug(shop.name) || (shop.id ? String(shop.id).replace(/^shop_/, '') : 'fashora')
  const shopAvatar = shop.logo || shop.avatar || shop.image || FALLBACK_IMAGE
  const coverSrc = shop.coverImage || shop.cover || shop.banner || null
  const displayProducts = Array.isArray(products) ? products.slice(0, 5) : []

  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] mb-6 overflow-hidden hover:border-neutral-300 transition-colors shadow-xs">
      {/* ------------------------------------------------------------------ */}
      {/* PHẦN 1: NỬA TRÊN - COVER BANNER, DARK GRADIENT & FROSTED PILL BTN */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative min-h-[150px] sm:min-h-[175px] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-neutral-900 overflow-hidden">
        {/* Ảnh bìa cover làm background */}
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}

        {/* Lớp chuyển màu tối mờ nhẹ (Dark Gradient Overlay) chân banner */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 pointer-events-none" />

        {/* Cụm Avatar viền kính mờ & Tên thương hiệu màu trắng */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar Shop bọc viền kính mờ (frosted glass) */}
          <Link
            to={`/store/${shopSlug}`}
            className="shrink-0 group block"
            title={`Visit ${shop.name}`}
          >
            <div className="p-0.5 rounded-full backdrop-blur-md bg-white/15 border border-white/30 shadow-lg group-hover:border-white/70 transition-colors">
              <img
                src={shopAvatar}
                alt={shop.name}
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full object-cover bg-neutral-900"
              />
            </div>
          </Link>

          {/* Tên thương hiệu và Category màu trắng hiển thị tự nhiên trên nền gradient */}
          <div className="space-y-0.5">
            <Link
              to={`/store/${shopSlug}`}
              className="font-bold text-lg sm:text-xl tracking-wider text-white hover:text-neutral-200 uppercase font-mono transition-colors block leading-tight drop-shadow-md"
            >
              {shop.name}
            </Link>

            {shop.category && (
              <p className="text-[11px] sm:text-xs text-neutral-300 font-mono uppercase tracking-widest font-medium drop-shadow-sm">
                {shop.category}
              </p>
            )}
          </div>
        </div>

        {/* Nút FOLLOWING dạng Pill trong suốt / Kính mờ (Ghost Pill Button) */}
        <button
          type="button"
          onClick={() => onUnfollow?.(shop.id || shop.slug)}
          disabled={isUnfollowing}
          className="relative z-10 px-5 py-2 rounded-full border border-white/40 bg-white/15 backdrop-blur-md text-white hover:bg-white hover:text-black hover:border-white text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer self-start sm:self-end disabled:opacity-50 shadow-md"
          title="Click to unfollow this atelier"
        >
          {isUnfollowing ? 'FOLLOWING...' : 'FOLLOWING'}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PHẦN 2: NỬA DƯỚI - 5 SẢN PHẨM (NỀN #FAFAFA NHƯ CŨ, PADDING THOÁNG) */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-5 sm:p-6 bg-white">
        <div className="flex items-center justify-end mb-3.5">
          <Link
            to={`/store/${shopSlug}`}
            className="text-xs font-mono text-neutral-500 hover:text-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
          >
            <span>VIEW STORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {displayProducts.map((item) => {
              const itemImage =
                item.image ||
                (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ||
                FALLBACK_IMAGE

              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group flex flex-col justify-between border border-neutral-200 hover:border-black rounded-[2px] p-3 sm:p-3.5 pb-4 sm:pb-5 bg-[#FAFAFA] transition-all duration-200"
                >
                  {/* Top: Ảnh và Tên sản phẩm */}
                  <div>
                    {/* Khung ảnh tỷ lệ 3:4 chuẩn Atelier */}
                    <div className="aspect-[3/4] bg-neutral-100 overflow-hidden rounded-[2px] mb-3 relative">
                      <img
                        src={itemImage}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Tên sản phẩm hiển thị 2 dòng, font 12px - 13px không bị cắt cụt */}
                    <h4 className="text-[12px] sm:text-[13px] leading-snug font-medium text-black uppercase font-sans line-clamp-2 min-h-[2.4rem] group-hover:underline">
                      {item.name}
                    </h4>
                  </div>

                  {/* Bottom: Giá tiền to, rõ ràng với khoảng đệm thoáng đãng */}
                  <p className="text-sm sm:text-[15px] font-mono font-bold text-neutral-900 mt-2.5">
                    {formatVND(item.price)}
                  </p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-400 font-mono uppercase bg-neutral-50 border border-neutral-100 rounded-[2px]">
            No products available
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(FollowingShopCard)
