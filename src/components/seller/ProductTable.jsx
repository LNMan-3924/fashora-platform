import { Link } from 'react-router-dom'
import { Edit3, Trash2 } from 'lucide-react'
import { formatVND, handleImageError, FALLBACK_IMAGE } from '../../constants/commerce'
import ProductStockBadge from './ProductStockBadge'

/**
 * Component ProductTable: Bảng danh sách các sản phẩm của shop
 * - Hiển thị sản phẩm kích thước lớn hơn, ảnh thumbnail 64x80px rõ nét (onError={handleImageError}).
 * - Cung cấp đầy đủ thông tin: Ảnh, Tên (text-sm font-semibold), Mã ID, Danh mục, Đơn giá, Tồn kho (ProductStockBadge), và Thao tác.
 * - Hỗ trợ cả giao diện Bảng thoáng đãng (Desktop) và Thẻ Card trực quan (Mobile).
 * - Tích hợp trạng thái khung chờ (Skeleton) khớp kích thước khi đang tải dữ liệu từ API.
 *
 * Props:
 * - products: Mảng các sản phẩm sau khi lọc và phân trang (10 sản phẩm / trang)
 * - loading: Trạng thái đang tải API
 * - onEditProduct: Callback khi người dùng nhấn nút Sửa sản phẩm
 * - onDeleteProduct: Callback khi người dùng nhấn nút Xóa sản phẩm
 */
export default function ProductTable({
  products = [],
  loading = false,
  onEditProduct,
  onDeleteProduct,
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] shadow-xs overflow-hidden">
      {/* 1. GIAO DIỆN BẢNG TRÊN DESKTOP & TABLET (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              <th className="py-3.5 px-4 font-semibold">PRODUCT</th>
              <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
              <th className="py-3.5 px-4 font-semibold">PRICE</th>
              <th className="py-3.5 px-4 font-semibold">STOCK STATUS</th>
              <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 text-xs">
            {loading ? (
              // Trạng thái Skeleton Loading kích thước lớn khi tải dữ liệu từ API
              [...Array(6)].map((_, idx) => (
                <tr key={`skel-row-${idx}`} className="animate-pulse">
                  <td className="py-4 px-4 flex items-center gap-4">
                    <div className="w-16 h-20 bg-neutral-100 rounded-[2px] shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4.5 w-60 bg-neutral-100 rounded-[2px]" />
                      <div className="h-3.5 w-28 bg-neutral-100 rounded-[2px]" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-24 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-7 w-28 bg-neutral-100 rounded-[2px]" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-7 w-24 bg-neutral-100 rounded-[2px] ml-auto" />
                  </td>
                </tr>
              ))
            ) : products.length > 0 ? (
              // Hiển thị danh sách sản phẩm lấy từ API với kích thước lớn và rõ nét
              products.map((product) => {
                const productImage =
                  product.images?.[0] || product.image || FALLBACK_IMAGE

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    {/* Cột 1: Ảnh thumbnail lớn hơn + Tên sản phẩm rõ ràng + Mã định danh */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        {/* Ảnh thumbnail liên kết trực tiếp tới trang ProductDetail */}
                        <Link
                          to={`/products/${product.id}`}
                          className="w-16 h-20 bg-neutral-100 border border-neutral-200/80 rounded-[2px] overflow-hidden shrink-0 shadow-2xs group block cursor-pointer"
                          title={`View ${product.name}`}
                        >
                          <img
                            src={productImage}
                            alt={product.name}
                            onError={handleImageError}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Tên và mã sản phẩm hiển thị lớn hơn (text-sm) */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className="font-semibold text-black truncate max-w-[280px] lg:max-w-[360px] text-sm hover:underline cursor-pointer tracking-tight"
                              title={product.name}
                              onClick={() => onEditProduct && onEditProduct(product)}
                            >
                              {product.name}
                            </h4>

                            {/* Badge nhãn nếu có (NEW, HOT, LIMITED) */}
                            {product.badge && (
                              <span
                                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] ${
                                  product.badge?.trim().toUpperCase().includes('SALE')
                                    ? 'bg-red-600 text-white'
                                    : 'bg-black text-white'
                                }`}
                              >
                                {product.badge}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-neutral-400 font-mono">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Danh mục */}
                    <td className="py-4 px-4 font-mono text-xs text-neutral-600 uppercase tracking-wider">
                      {product.category || 'Atelier'}
                    </td>

                    {/* Cột 3: Giá bán hiển thị rõ ràng */}
                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-sm text-black">
                        {formatVND(product.price)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-[11px] text-neutral-400 line-through mt-0.5">
                          {formatVND(product.originalPrice)}
                        </div>
                      )}
                    </td>

                    {/* Cột 4: Tình trạng kho hàng */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <ProductStockBadge
                          stock={product.stock}
                          isSoldOut={product.isSoldOut}
                        />
                        <span className="text-[11px] font-mono text-neutral-400 pl-0.5">
                          {product.stock ?? 0} units
                        </span>
                      </div>
                    </td>

                    {/* Cột 5: Nút thao tác (Xem trên web, Sửa, Xóa) */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút sửa sản phẩm */}
                        <button
                          type="button"
                          onClick={() => onEditProduct && onEditProduct(product)}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Nút xóa sản phẩm */}
                        <button
                          type="button"
                          onClick={() => onDeleteProduct && onDeleteProduct(product)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              // Trạng thái trống không tìm thấy sản phẩm
              <tr>
                <td
                  colSpan={5}
                  className="py-14 text-center text-xs text-neutral-400 uppercase tracking-widest font-mono"
                >
                  No products found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2. GIAO DIỆN THẺ CARD TRÊN THIẾT BỊ DI ĐỘNG (< md) */}
      <div className="md:hidden divide-y divide-neutral-100">
        {loading ? (
          [...Array(4)].map((_, idx) => (
            <div key={`skel-mob-${idx}`} className="p-4.5 animate-pulse flex gap-3.5">
              <div className="w-20 h-26 bg-neutral-100 rounded-[2px] shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-neutral-100 rounded-[2px]" />
                <div className="h-3 w-1/3 bg-neutral-100 rounded-[2px]" />
                <div className="h-4 w-1/2 bg-neutral-100 rounded-[2px]" />
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => {
            const productImage =
              product.images?.[0] || product.image || FALLBACK_IMAGE

            return (
              <div key={`mob-${product.id}`} className="p-4.5 flex gap-4 items-start">
                {/* Ảnh sản phẩm liên kết tới ProductDetail */}
                <Link
                  to={`/products/${product.id}`}
                  className="w-20 h-26 bg-neutral-100 border border-neutral-200/80 rounded-[2px] overflow-hidden shrink-0 block cursor-pointer"
                  title={`View ${product.name}`}
                >
                  <img
                    src={productImage}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                {/* Thông tin và nút thao tác */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className="font-semibold text-black text-sm truncate"
                      onClick={() => onEditProduct && onEditProduct(product)}
                    >
                      {product.name}
                    </h4>
                    <span className="font-mono font-bold text-sm text-black shrink-0">
                      {formatVND(product.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                    <span className="uppercase">{product.category}</span>
                    <span>•</span>
                    <span>ID: {product.id}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <ProductStockBadge
                      stock={product.stock}
                      isSoldOut={product.isSoldOut}
                    />

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditProduct && onEditProduct(product)}
                        className="p-2 text-neutral-400 hover:text-black"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct && onDeleteProduct(product)}
                        className="p-2 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 uppercase tracking-widest font-mono">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}
