import { useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { Button } from '../common'

// Ảnh dự phòng khi ảnh sản phẩm bị lỗi
const FALLBACK_IMAGE = '/assets/fallback.png'

/**
 * Component con QuickAddContent: Chứa toàn bộ nội dung lựa chọn biến thể
 * Được gắn key={product.id} từ component cha để tự động khởi tạo lại state sạch sẽ khi đổi sản phẩm.
 */
function QuickAddContent({ product, onClose, onConfirm, onAddToCart }) {
  // State lưu màu sắc được chọn (mặc định lấy màu đầu tiên trong mảng colors)
  const [selectedColor, setSelectedColor] = useState(
    () => product?.colors?.[0] || 'DEFAULT'
  )

  // State lưu kích thước được chọn (mặc định lấy size đầu tiên trong mảng sizes)
  const [selectedSize, setSelectedSize] = useState(
    () => product?.sizes?.[0] || 'One Size'
  )

  // State lưu số lượng món đồ muốn thêm
  const [quantity, setQuantity] = useState(1)

  // Chuẩn hóa đường dẫn ảnh: hỗ trợ cả product.image lẫn mảng product.images[0]
  const rawImage =
    product?.image ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : null) ||
    FALLBACK_IMAGE

  const displayImage =
    typeof rawImage === 'string'
      ? rawImage.replace(/^(\.\/)?public\//, '/')
      : FALLBACK_IMAGE

  // Hàm định dạng số tiền VND (VD: 850,000₫)
  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN').format(val || 0) + '₫'

  const availableColors =
    product?.colors && product.colors.length > 0 ? product.colors : ['DEFAULT']

  const availableSizes =
    product?.sizes && product.sizes.length > 0 ? product.sizes : ['One Size']

  // Xử lý khi người dùng nhấn nút xác nhận thêm vào giỏ
  const handleAdd = () => {
    const payload = {
      ...product,
      image: displayImage,
      selectedColor,
      selectedSize,
      color: selectedColor,
      size: selectedSize,
      quantity,
    }

    // Hỗ trợ cả 2 tên prop onConfirm và onAddToCart để đảm bảo tương thích mọi nơi
    if (onConfirm) onConfirm(payload)
    if (onAddToCart) onAddToCart(payload)

    onClose?.()
  }

  return (
    <div
      className="bg-white w-full max-w-sm rounded-[2px] border border-neutral-200 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ------------------------------------------------------------- */}
      {/* PHẦN 1: HEADER MODAL (DANH MỤC & NÚT ĐÓNG X)                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          {product?.category || 'M STUDIO ATELIER'}
        </span>
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="text-neutral-400 hover:text-[#111111] transition-colors p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 2: THÔNG TIN VẮN TẮT SẢN PHẨM (ẢNH, TÊN, GIÁ)            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex gap-3 items-center">
        <div className="w-16 h-20 bg-neutral-50 rounded-[2px] overflow-hidden shrink-0 border border-neutral-200">
          <img
            src={displayImage}
            alt={product?.name || 'Product'}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = FALLBACK_IMAGE
            }}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs uppercase text-[#111111] truncate">
            {product?.name}
          </h4>
          <p className="font-mono font-bold text-sm text-[#111111] mt-0.5">
            {formatVND(product?.price)}
          </p>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] inline-block mt-1">
            IN STOCK ATELIER
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 3: BỘ CHỌN CÁC BIẾN THỂ (MÀU SẮC, SIZE, SỐ LƯỢNG)        */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 pt-1">
        {/* Lựa chọn màu sắc */}
        <div>
          <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
            COLOR
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-2.5 py-1 text-xs font-mono rounded-[2px] cursor-pointer transition-colors ${
                  selectedColor === color
                    ? 'border border-[#111111] bg-[#111111] text-white'
                    : 'border border-neutral-200 bg-neutral-50 text-[#111111] hover:border-black'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Lựa chọn kích thước */}
        <div>
          <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
            SIZE
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-2.5 py-1 text-xs font-mono rounded-[2px] cursor-pointer transition-colors ${
                  selectedSize === size
                    ? 'border border-[#111111] bg-[#111111] text-white font-bold'
                    : 'border border-neutral-200 bg-neutral-50 text-[#111111] hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Bộ tăng giảm số lượng (- / +) */}
        <div>
          <label className="block text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
            QUANTITY
          </label>
          <div className="inline-flex items-center border border-neutral-200 rounded-[2px] bg-neutral-50 h-8">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-full flex items-center justify-center font-mono text-sm text-[#111111] hover:bg-neutral-200 cursor-pointer"
            >
              −
            </button>
            <span className="w-8 text-center font-mono text-xs font-semibold text-[#111111]">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-8 h-full flex items-center justify-center font-mono text-sm text-[#111111] hover:bg-neutral-200 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PHẦN 4: NÚT BẤM THÊM VÀO GIỎ HÀNG (TÁI SỬ DỤNG BUTTON COMMON)  */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-3 border-t border-neutral-200">
        <Button
          variant="primary"
          size="md"
          onClick={handleAdd}
          className="w-full h-11 tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>ADD TO CART</span>
        </Button>
      </div>
    </div>
  )
}

/**
 * Component QuickAddModal: Cửa sổ pop-up chọn biến thể nhanh
 *
 * Tính năng:
 * - Chuẩn hóa xử lý ảnh: Hỗ trợ linh hoạt cả `product.image` lẫn mảng `product.images[0]`.
 * - Tự động fallback về /assets/fallback.png nếu đường dẫn ảnh bị lỗi.
 * - Hỗ trợ cả 2 chuẩn callback: onConfirm (chuẩn Atelier) và onAddToCart (tương thích ngược).
 * - Sử dụng key={product.id} giúp tự động reset sạch sẽ state biến thể khi đổi sản phẩm mà không gây cascading render.
 */
export default function QuickAddModal({
  isOpen,            // Trạng thái modal có đang hiển thị hay không (boolean)
  product,           // Thông tin sản phẩm đang được chọn
  onClose,           // Hàm gọi khi nhấn nút đóng hoặc click ra vùng nền đen bên ngoài
  onConfirm,         // Hàm gọi khi nhấn nút "ADD TO CART" (chuẩn Atelier)
  onAddToCart,       // Bí danh tương thích ngược cho onConfirm
}) {
  // Nếu modal không mở hoặc không có dữ liệu sản phẩm thì không render gì cả
  if (!isOpen || !product) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <QuickAddContent
        key={product.id}
        product={product}
        onClose={onClose}
        onConfirm={onConfirm}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
