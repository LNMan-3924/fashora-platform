import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'

// Ảnh dự phòng mặc định nếu ảnh sản phẩm bị lỗi
const FALLBACK_IMAGE = '/images/products/accessories/acc-01.jpg'

/**
 * 4 Sản phẩm phối đồ mặc định của thương hiệu M STUDIO
 * (Tất cả hình ảnh đều trỏ vào thư mục public/images/products để đảm bảo không bị lỗi ảnh).
 */
const DEFAULT_LOOK_ITEMS = [
  {
    id: 'prd_acc_01',
    name: 'SCULPTED CYBER METALLIC SHADES',
    price: 850000,
    image: '/images/products/accessories/acc-01.jpg',
    images: ['/images/products/accessories/acc-01.jpg'],
    category: 'ACCESSORIES / M STUDIO',
    shopName: 'M STUDIO',
    tag: 'NEW',
    colors: ['Silver Chrome', 'Smoke Lens'],
    sizes: ['One Size'],
    stock: 15,
  },
  {
    id: 'prd_acc_03',
    name: 'ARMORED LEATHER MOON BAG',
    price: 1850000,
    image: '/images/products/accessories/acc-03.jpg',
    images: ['/images/products/accessories/acc-03.jpg'],
    category: 'LEATHER GOODS / M STUDIO',
    shopName: 'M STUDIO',
    tag: 'SIGNATURE',
    colors: ['Patent Black', 'Gunmetal'],
    sizes: ['One Size'],
    stock: 8,
  },
  {
    id: 'prd_acc_02',
    name: 'INDUSTRIAL LIQUID METAL RING',
    price: 490000,
    image: '/images/products/accessories/acc-02.jpg',
    images: ['/images/products/accessories/acc-02.jpg'],
    category: 'HARDWARE / M STUDIO',
    shopName: 'M STUDIO',
    tag: 'JEWELRY',
    colors: ['Titanium Silver'],
    sizes: ['Freesize (Adjustable)'],
    stock: 20,
  },
  {
    id: 'prd_shoes_06',
    name: 'BRUSHED LEATHER MONOLITH LUG DERBY',
    price: 2100000,
    image: '/images/products/shoes/shoes-06.jpg',
    images: ['/images/products/shoes/shoes-06.jpg'],
    category: 'FOOTWEAR / M STUDIO',
    shopName: 'M STUDIO',
    tag: 'RUNWAY',
    colors: ['Polished Jet Black'],
    sizes: ['39', '40', '41', '42'],
    stock: 6,
  },
]

/**
 * Component CompleteTheLook: Gợi ý phối đồ dùng chung (Shared Component).
 * Tái sử dụng ở cả trang Cart, Product Detail lẫn trang Shop.
 * Tính năng:
 * - Hiển thị 4 sản phẩm phối kèm ảnh tỉ lệ thời trang 3:4.
 * - Nút tròn màu trắng có dấu cộng nằm ở góc phải ảnh kèm animation xoay 90 độ khi hover.
 * - Khi click nút cộng, gọi callback onQuickAdd để mở modal chọn biến thể nhanh.
 */
export default function CompleteTheLook({
  items = DEFAULT_LOOK_ITEMS,     // Danh sách sản phẩm gợi ý (mặc định là 4 món M STUDIO)
  title = 'COMPLETE THE LOOK',    // Tiêu đề khối
  subtitle = 'Curated pairings from M STUDIO to complement your selected silhouette.', // Phụ đề
  viewAllLink = '/shop',          // Đường dẫn xem tất cả sản phẩm
  onQuickAdd,                     // Hàm gọi khi nhấn nút thêm nhanh (+)
}) {
  // Hàm định dạng số tiền VND (VD: 850,000₫)
  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN').format(val) + '₫'

  // Xử lý sự cố ảnh: Tự động trỏ về ảnh dự phòng
  const handleImageError = (e) => {
    if (!e.currentTarget.src.includes(FALLBACK_IMAGE)) {
      e.currentTarget.src = FALLBACK_IMAGE
    }
  }

  const displayItems = items && items.length > 0 ? items : DEFAULT_LOOK_ITEMS

  return (
    <section className="mt-16 lg:mt-24 pt-10 border-t border-neutral-200">
      {/* ------------------------------------------------------------- */}
      {/* PHẦN 1: HEADER KHỐI GỢI Ý (TIÊU ĐỀ & LIÊN KẾT XEM TẤT CẢ)      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-2">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl uppercase tracking-wider text-[#111111]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold tracking-widest uppercase text-[#111111] hover:text-neutral-500 transition-colors flex items-center gap-1 group"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 2: LƯỚI 4 SẢN PHẨM PHỐI (2 CỘT MOBILE, 4 CỘT DESKTOP)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayItems.map((prod) => (
          <div
            key={prod.id}
            className="group border border-neutral-200 rounded-[2px] bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            {/* Khung ảnh sản phẩm tỉ lệ 3:4 */}
            <div className="aspect-[3/4] bg-neutral-50 overflow-hidden relative border-b border-neutral-100">
              <img
                src={prod.image || FALLBACK_IMAGE}
                alt={prod.name}
                onError={handleImageError}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Tag phân loại (NEW, SIGNATURE, RUNWAY, JEWELRY) */}
              {prod.tag && (
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#111111] text-[9px] font-mono px-2 py-0.5 border border-neutral-200 rounded-[2px] uppercase">
                  {prod.tag}
                </span>
              )}

              {/* Nút tròn màu trắng có dấu cộng nằm góc dưới bên phải bức ảnh */}
              {/* Hiệu ứng: Phóng to 110%, đảo màu đen-trắng và xoay dấu cộng 90 độ khi rê chuột */}
              <button
                type="button"
                aria-label={`Quick add ${prod.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickAdd?.(prod)
                }}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white text-[#111111] shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#111111] hover:text-white z-10 cursor-pointer group/btn"
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
              </button>
            </div>

            {/* Thông tin sản phẩm: Danh mục, Tên và Giá bán */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-between grow">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">
                {prod.category || 'M STUDIO'}
              </span>
              <h3
                className="font-semibold text-xs sm:text-sm uppercase text-[#111111] mt-1 truncate"
                title={prod.name}
              >
                {prod.name}
              </h3>
              <p className="font-mono font-medium text-xs sm:text-sm text-[#111111] mt-1">
                {formatVND(prod.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
