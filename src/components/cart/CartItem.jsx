import { useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { Checkbox } from '../common'
import { FALLBACK_IMAGE, handleImageError, formatVND } from '../../constants'

/**
 * Component CartItem: Hiển thị 1 dòng sản phẩm trong danh sách giỏ hàng.
 * Tái sử dụng Checkbox từ src/components/common.
 * Sử dụng FALLBACK_IMAGE, handleImageError, formatVND dùng chung từ src/constants.
 * Bao gồm: Checkbox chọn món, ảnh thu nhỏ 3:4, tên, phân loại, đơn giá,
 * bộ tăng giảm số lượng (-/+), tính thành tiền dòng và các nút thao tác (wishlist, xóa).
 */
export default function CartItem({
  item,
  isSelected = true,      // Trạng thái checkbox có đang được chọn hay không
  onToggleSelect,         // Hàm gọi khi bấm vào checkbox của món này
  onUpdateQuantity,       // Hàm gọi khi bấm tăng hoặc giảm số lượng
  onRemove,               // Hàm gọi khi bấm nút xóa món hàng khỏi giỏ
}) {
  // State lưu trạng thái món đồ này có được người dùng lưu yêu thích hay không
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Tính thành tiền của dòng: Đơn giá nhân với số lượng
  const lineTotal = (item.price || 0) * (item.quantity || 1)

  return (
    <div className="py-5 sm:py-6 flex gap-3 sm:gap-6 items-start border-b border-neutral-200 last:border-b-0">
      {/* ------------------------------------------------------------- */}
      {/* PHẦN 1: CHECKBOX CHỌN MÓN ĐỂ THANH TOÁN (TÁI SỬ DỤNG COMMON)  */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 shrink-0">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect?.(item)}
          aria-label={`Select ${item.name}`}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 2: ẢNH SẢN PHẨM (TỈ LỆ CHUẨN THỜI TRANG ATELIER 3:4)     */}
      {/* ------------------------------------------------------------- */}
      <div className="w-20 sm:w-28 shrink-0 bg-neutral-100 aspect-[3/4] rounded-[2px] overflow-hidden relative border border-neutral-200">
        <img
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          onError={handleImageError}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
        {/* Nhãn đặc biệt nếu có (Ví dụ: LIMITED, SIGNATURE) */}
        {item.badge && (
          <span className="absolute top-1 left-1 bg-[#111111] text-white text-[8px] font-mono px-1 py-0.5 uppercase tracking-wider">
            {item.badge}
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 3: THÔNG TIN CHI TIẾT & BỘ TĂNG GIẢM SỐ LƯỢNG            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        {/* Hàng 1: Tên sản phẩm, Danh mục, Biến thể và Đơn giá */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
          <div className="min-w-0 pr-2">
            {/* Phân loại danh mục */}
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              {item.category || 'ATELIER COLLECTION'}
            </span>
            {/* Tên sản phẩm */}
            <h3 className="font-semibold text-xs sm:text-base text-[#111111] uppercase tracking-tight mt-0.5 line-clamp-2">
              {item.name}
            </h3>
            {/* Size và Màu sắc đã chọn */}
            <p className="text-xs text-neutral-500 mt-1 font-mono">
              Size: {item.selectedSize || 'Freesize'} • Color: {item.selectedColor || 'Standard'}
            </p>
          </div>

          {/* Đơn giá một sản phẩm */}
          <div className="mt-1 sm:mt-0 text-left sm:text-right shrink-0">
            <span className="font-semibold text-xs sm:text-base text-[#111111] block font-mono">
              {formatVND(item.price)}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 hidden sm:block">
              Unit Price
            </span>
          </div>
        </div>

        {/* Hàng 2: Bộ tăng giảm số lượng (- / +), Thành tiền dòng và Nút Xóa */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 mt-2">
          {/* Bộ điều khiển tăng giảm số lượng */}
          <div className="inline-flex items-center border border-neutral-200 rounded-[2px] bg-neutral-50">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onUpdateQuantity?.(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center font-mono text-sm text-[#111111] hover:bg-neutral-200 transition-colors select-none cursor-pointer"
            >
              −
            </button>
            <span className="w-8 text-center font-mono text-xs font-semibold text-[#111111]">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => onUpdateQuantity?.(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center font-mono text-sm text-[#111111] hover:bg-neutral-200 transition-colors select-none cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Thành tiền dòng & Các nút tương tác */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <span className="font-mono font-bold text-xs sm:text-base text-[#111111]">
                {formatVND(lineTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút lưu vào danh sách yêu thích (Wishlist) */}
              <button
                type="button"
                title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-1 transition-colors cursor-pointer ${
                  isWishlisted ? 'text-red-500' : 'text-neutral-400 hover:text-[#111111]'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />
              </button>

              {/* Nút xóa sản phẩm này khỏi giỏ hàng */}
              <button
                type="button"
                title="Remove item"
                onClick={() => onRemove?.(item)}
                className="text-neutral-400 hover:text-red-600 transition-colors p-1 flex items-center gap-1 text-xs font-mono uppercase cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">REMOVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
