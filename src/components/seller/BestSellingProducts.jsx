import { formatVND, FALLBACK_IMAGE, handleImageError } from '../../constants/commerce'

/**
 * Component BestSellingProducts: Lưới hiển thị các sản phẩm bán chạy nhất của Shop (Top 4)
 * Tích hợp huy hiệu thứ hạng (#1 TOP, #2 TOP...) và cơ chế kiểm tra bắt lỗi ảnh tự động (onError).
 *
 * Props:
 * - products: Mảng 4 sản phẩm bán chạy nhất lấy từ API (/products)
 * - loading: Trạng thái đang tải dữ liệu
 */
export default function BestSellingProducts({
  products = [],
  loading = false,
  shopName = '',
}) {
  const displayProducts = products.slice(0, 4)

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs mt-8">
      {/* 1. Tiêu đề khối sản phẩm bán chạy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-neutral-100">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black">
            BEST SELLING PRODUCTS
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Top performing garments in {shopName} atelier catalog
          </p>
        </div>

        {/* Số lượng sản phẩm */}
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          {loading ? 'LOADING...' : `TOP ${displayProducts.length} ENSEMBLES`}
        </span>
      </div>

      {/* 2. Lưới 4 sản phẩm (Grid 4 cột trên Desktop, 2 cột Tablet, 1 cột Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {loading ? (
          // Trạng thái Skeleton khi đang tải dữ liệu
          [...Array(4)].map((_, idx) => (
            <div key={`skel-product-${idx}`} className="animate-pulse flex flex-col gap-2">
              <div className="w-full aspect-[3/4] bg-neutral-100 rounded-[2px]" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded-[2px] mt-1" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded-[2px]" />
            </div>
          ))
        ) : displayProducts.length > 0 ? (
          displayProducts.map((product, index) => {
            // Xác định đường dẫn ảnh sản phẩm
            const productImage =
              product.images?.[0] || product.image || FALLBACK_IMAGE

            // Thứ hạng sản phẩm (#1 TOP, #2 TOP, #3 TOP, #4 TOP)
            const rankLabel = `#${index + 1} TOP`

            return (
              <article
                key={product.id || index}
                className="group flex flex-col bg-white border border-neutral-200/80 rounded-[2px] overflow-hidden transition-all hover:border-black hover:shadow-xs"
              >
                {/* Khung chứa ảnh tỉ lệ chuẩn 3:4 */}
                <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                  {/* Huy hiệu thứ hạng đen góc trên trái (cố định kích thước) */}
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center justify-center w-16 py-0.5 bg-black text-white text-[9px] font-mono font-bold tracking-wider rounded-[2px] shadow-xs uppercase text-center">
                    {rankLabel}
                  </span>

                  {/* Ảnh sản phẩm kèm cơ chế kiểm tra lỗi ảnh (onError) */}
                  <img
                    src={productImage}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Thông tin sản phẩm phía dưới */}
                <div className="p-3.5 flex flex-col justify-between flex-grow">
                  <div>
                    <h4
                      className="text-xs sm:text-sm font-semibold text-black tracking-tight line-clamp-1 group-hover:underline"
                      title={product.name}
                    >
                      {product.name}
                    </h4>

                    {/* Phân loại hoặc danh mục */}
                    <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider mt-0.5">
                      {product.category || 'Atelier Garment'}
                    </p>
                  </div>

                  {/* Giá tiền và số lượng bán (nếu có) */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                    <span className="font-mono font-semibold text-xs text-black">
                      {formatVND(product.price)}
                    </span>

                    {product.soldCount !== undefined && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        {product.soldCount} sold
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          // Trạng thái khi chưa có sản phẩm
          <div className="col-span-full py-8 text-center text-xs text-neutral-400 uppercase tracking-wider font-mono">
            No products available.
          </div>
        )}
      </div>
    </section>
  )
}

