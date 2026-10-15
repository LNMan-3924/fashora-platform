import { FALLBACK_IMAGE, handleImageError, formatVND } from './orderConstants'

/**
 * Component OrderItemsList: Danh sách sản phẩm trong đơn hàng (Manifest Content)
 *
 * Tính năng nổi bật:
 * - Hiển thị từng mặt hàng với ảnh sản phẩm chất lượng cao, tên, size, màu sắc và số lượng.
 * - Xử lý chống vỡ layout khi ảnh lỗi (tự động chuyển sang FALLBACK_IMAGE: /assets/fallback.png).
 * - Bố cục responsive:
 *   + Mobile (<640px): Ảnh thu nhỏ 80x112px, font chữ vừa vặn, hiển thị dạng flex gọn gàng.
 *   + Tablet & Desktop (>=640px): Ảnh 96x128px, khoảng cách rộng rãi, căn lề giá tiền rõ ràng.
 *
 * Props:
 * - items: Mảng danh sách sản phẩm [{ id, name, price, quantity, selectedSize, selectedColor, image }]
 */
export default function OrderItemsList({ items = [] }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <section className="bg-white border border-neutral-200 p-5 sm:p-8">
      {/* Tiêu đề mục danh sách sản phẩm */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
        <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900 font-mono">
          MANIFEST CONTENT ({safeItems.length} ITEMS)
        </h2>
        <span className="text-[11px] font-mono text-neutral-400 tracking-wider">
          ATELIER VERIFIED
        </span>
      </div>

      {/* Danh sách các mặt hàng */}
      <div className="divide-y divide-neutral-100">
        {safeItems.map((item, idx) => {
          const itemKey = item.id ? `${item.id}-${idx}` : idx
          const itemPrice = Number(item.price || 0)
          const itemQty = Number(item.quantity || 1)
          const lineTotal = itemPrice * itemQty

          return (
            <div
              key={itemKey}
              className="py-5 sm:py-6 flex items-start justify-between gap-3 sm:gap-6 first:pt-0 last:pb-0"
            >
              {/* Cột trái: Ảnh sản phẩm + Chi tiết thông số (Size, Màu, Số lượng) */}
              <div className="flex items-start gap-3.5 sm:gap-5 min-w-0">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt={item.name || 'Product'}
                  onError={handleImageError}
                  className="w-20 h-28 sm:w-24 sm:h-32 object-cover border border-neutral-200 shrink-0 bg-stone-100"
                />
                <div className="py-0.5 sm:py-1 min-w-0">
                  <h3 className="text-xs sm:text-base font-semibold text-neutral-900 tracking-tight leading-snug line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 font-sans">
                    Size: <strong className="text-neutral-800">{item.selectedSize || 'Standard'}</strong> • Color:{' '}
                    <strong className="text-neutral-800">{item.selectedColor || 'Standard'}</strong>
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 font-mono">
                    Quantity: {itemQty}
                  </p>
                </div>
              </div>

              {/* Cột phải: Thành tiền và đơn giá */}
              <div className="text-right py-0.5 sm:py-1 shrink-0 font-mono">
                <p className="text-xs sm:text-base font-bold text-neutral-900">
                  {formatVND(lineTotal)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                  {formatVND(itemPrice)} each
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

