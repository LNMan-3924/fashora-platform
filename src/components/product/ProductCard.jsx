import { Link } from 'react-router-dom'
import { Badge } from '../common'

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  shopName = 'M STUDIO',
  badge,
  isSoldOut = false,
  className = '',
}) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(originalPrice)
    : null

  return (
    <div className={`group flex flex-col bg-white ${className}`}>
      {/* Khung ảnh sản phẩm */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F8F8F8] border border-[#E5E5E5]">
        <Link to={`/product/${id}`} className="block w-full h-full">
          {image ? (
            <img
              src={image}
              alt={name}
              onError={(e) => {
                e.currentTarget.src = '/assets/fallback.png'
              }}
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#666666] text-xs uppercase tracking-wider">
              No Image
            </div>
          )}
        </Link>

        {/* Badge trạng thái ở góc trên bên trái */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          {isSoldOut ? (
            <Badge variant="soldout">SOLD OUT</Badge>
          ) : badge ? (
            <Badge variant={badge.toLowerCase()}>{badge}</Badge>
          ) : null}
        </div>

        {/* Nút xem nhanh/chi tiết hiển thị khi hover trên Desktop */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
          <Link
            to={`/product/${id}`}
            className="w-full py-2 bg-white text-[#111111] text-[11px] font-medium tracking-widest uppercase text-center block hover:bg-[#111111] hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="pt-3 flex flex-col gap-1">
        {shopName && (
          <span className="text-[11px] uppercase tracking-wider text-[#666666]">
            {shopName}
          </span>
        )}
        <Link
          to={`/product/${id}`}
          className="text-[13px] md:text-[14px] font-medium text-[#111111] hover:underline line-clamp-1 transition-all"
        >
          {name}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[13px] md:text-[14px] font-semibold text-[#111111]">
            {formattedPrice}
          </span>
          {formattedOriginalPrice && (
            <span className="text-[12px] text-[#666666] line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}