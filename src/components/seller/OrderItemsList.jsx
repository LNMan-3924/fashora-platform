import { formatVND, handleImageError, FALLBACK_IMAGE } from '../../constants/commerce'

/**
 * Component OrderItemsList: Khối danh sách các mặt hàng trong đơn hàng của Seller
 * - Hiển thị ảnh đại diện sản phẩm với cơ chế bắt lỗi ảnh tự động (onError={handleImageError}).
 * - Cung cấp đầy đủ: Tên, Mã SKU, Phân loại kích cỡ / màu sắc, Số lượng và Đơn giá.
 * - Thiết kế dạng bảng sắc sảo, tối giản, đồng bộ với phong cách atelier Fashora.
 *
 * Props:
 * - items: Mảng các mặt hàng trong đơn hàng
 */
export default function OrderItemsList({ items = [] }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs">
      {/* Tiêu đề khối sản phẩm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 mb-5 gap-2">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
          PRODUCTS IN THIS ORDER
        </h4>
        <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
          <span className="px-2 py-0.5 bg-neutral-100 rounded-[2px]">
            {safeItems.length} ITEMS
          </span>
          <span className="px-2 py-0.5 bg-neutral-100 rounded-[2px]">
            STANDARD ATELIER PACKAGING
          </span>
        </div>
      </div>

      {/* Tiêu đề cột trên Desktop */}
      <div className="hidden sm:grid grid-cols-12 text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-400 pb-3 border-b border-neutral-100">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-2 text-center">VARIANT</div>
        <div className="col-span-1 text-center">QTY</div>
        <div className="col-span-3 text-right">UNIT PRICE</div>
      </div>

      {/* Danh sách các sản phẩm */}
      <div className="divide-y divide-neutral-100">
        {safeItems.length > 0 ? (
          safeItems.map((item, index) => {
            const itemImage =
              item.image || item.images?.[0] || FALLBACK_IMAGE

            return (
              <div
                key={`order-item-${item.id || index}`}
                className="py-4 flex flex-col sm:grid sm:grid-cols-12 gap-3 items-center"
              >
                {/* Cột 1: Ảnh + Tên + SKU */}
                <div className="col-span-6 w-full flex items-center gap-3.5">
                  <div className="w-16 h-20 bg-neutral-100 border border-neutral-200 rounded-[2px] overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={itemImage}
                      alt={item.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-black uppercase tracking-wide truncate">
                      {item.name}
                    </h5>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      SKU: {item.id || 'N/A'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono font-medium mt-1">
                      In Stock (Atelier)
                    </div>
                  </div>
                </div>

                {/* Cột 2: Phân loại Variant (Size / Color) */}
                <div className="col-span-2 w-full sm:w-auto text-left sm:text-center text-xs text-neutral-600 font-mono">
                  <span className="sm:hidden text-[10px] text-neutral-400 uppercase font-semibold">
                    Variant:{' '}
                  </span>
                  <span>{item.selectedSize || 'OS'}</span>
                  {item.selectedColor && (
                    <span className="text-neutral-400"> • {item.selectedColor}</span>
                  )}
                </div>

                {/* Cột 3: Số lượng (Qty) */}
                <div className="col-span-1 w-full sm:w-auto text-left sm:text-center font-mono text-xs font-bold text-black">
                  <span className="sm:hidden text-[10px] text-neutral-400 uppercase font-semibold">
                    Qty:{' '}
                  </span>
                  {item.quantity || 1}
                </div>

                {/* Cột 4: Đơn giá (Price) */}
                <div className="col-span-3 w-full sm:w-auto text-left sm:text-right font-mono text-xs font-bold text-black">
                  <span className="sm:hidden text-[10px] text-neutral-400 uppercase font-semibold">
                    Price:{' '}
                  </span>
                  {formatVND(item.price || 0)}
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-8 text-center text-xs text-neutral-400 uppercase font-mono">
            No items in this order.
          </div>
        )}
      </div>
    </section>
  )
}

