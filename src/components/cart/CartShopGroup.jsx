import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import CartItem from './CartItem'

/**
 * Component CartShopGroup: Gom nhóm các sản phẩm trong giỏ hàng theo từng Gian hàng (Shop).
 * Cung cấp:
 * 1. Tiêu đề gian hàng kèm checkbox chọn/bỏ chọn tất cả sản phẩm của shop đó.
 * 2. Huy hiệu xác thực "ATELIER VERIFIED" và liên kết ghé thăm gian hàng.
 * 3. Danh sách các sản phẩm (CartItem) thuộc quyền quản lý của shop.
 */
export default function CartShopGroup({
  shopName = 'M STUDIO',         // Tên gian hàng (VD: 'M STUDIO')
  shopSlug = 'm-studio',         // Đường dẫn slug URL gian hàng (VD: 'm-studio')
  items = [],                    // Danh sách các món hàng thuộc shop này
  selectedItemIds = [],          // Danh sách key các món đang được chọn để thanh toán
  onToggleShopSelect,            // Hàm gọi khi tick chọn / bỏ chọn ở cấp độ Shop
  onToggleItemSelect,            // Hàm gọi khi tick chọn / bỏ chọn từng món bên trong
  onUpdateQuantity,              // Hàm gọi khi thay đổi số lượng món hàng
  onRemoveItem,                  // Hàm gọi khi xóa một món hàng
}) {
  // Kiểm tra xem TOÀN BỘ sản phẩm của shop này có đang được chọn hay không
  const allShopItemsSelected =
    items.length > 0 &&
    items.every((item) =>
      selectedItemIds.includes(
        `${item.id}_${item.selectedSize}_${item.selectedColor}`
      )
    )

  return (
    <div className="border border-neutral-200 rounded-[2px] p-4 sm:p-6 bg-white mb-6 shadow-xs">
      {/* ------------------------------------------------------------- */}
      {/* PHẦN 1: HEADER GIAN HÀNG (TÊN SHOP & CHECKBOX CHỌN TOÀN BỘ)   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Checkbox gom nhóm: Tick vào đây sẽ chọn hoặc bỏ chọn toàn bộ sản phẩm của shop */}
          <input
            type="checkbox"
            checked={allShopItemsSelected}
            onChange={() => onToggleShopSelect?.(items, !allShopItemsSelected)}
            className="w-4 h-4 accent-[#111111] cursor-pointer rounded-none"
            aria-label={`Select all items from ${shopName}`}
          />

          <div className="flex items-center gap-2">
            {/* Tên thương hiệu/Shop (đã bỏ icon storefront phía trước để tối giản) */}
            <span className="font-bold text-sm sm:text-base tracking-wider uppercase text-[#111111]">
              {shopName}
            </span>

            {/* Huy hiệu xác nhận chính hãng Atelier Verified */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-[#111111] border border-neutral-200">
              <Check className="w-3 h-3 text-[#111111] stroke-[2.5]" />
              ATELIER VERIFIED
            </span>
          </div>
        </div>

        {/* Liên kết dẫn người dùng sang xem toàn bộ gian hàng của shop */}
        <Link
          to={`/store/${shopSlug}`}
          className="text-xs font-mono font-medium tracking-wider text-neutral-500 hover:text-[#111111] transition-colors"
        >
          [ VISIT SHOP → ]
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 2: DANH SÁCH TỪNG SẢN PHẨM (CART ITEM) CỦA GIAN HÀNG     */}
      {/* ------------------------------------------------------------- */}
      <div className="divide-y divide-neutral-100">
        {items.map((item) => {
          // Tạo định danh duy nhất cho từng sản phẩm theo ID + Size + Màu
          const itemKey = `${item.id}_${item.selectedSize}_${item.selectedColor}`
          const isSelected = selectedItemIds.includes(itemKey)

          return (
            <CartItem
              key={itemKey}
              item={item}
              isSelected={isSelected}
              onToggleSelect={() => onToggleItemSelect?.(itemKey)}
              onUpdateQuantity={(newQty) =>
                onUpdateQuantity?.(
                  item.id,
                  item.selectedSize,
                  item.selectedColor,
                  newQty
                )
              }
              onRemove={() =>
                onRemoveItem?.(item.id, item.selectedSize, item.selectedColor)
              }
            />
          )
        })}
      </div>
    </div>
  )
}
