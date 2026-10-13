import { useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'

// Ảnh dự phòng khi ảnh sản phẩm bị lỗi
const FALLBACK_IMAGE = '/assets/fallback.png'

/**
 * Component QuickAddModal: Cửa sổ pop-up chọn biến thể nhanh (màu sắc, size, số lượng)
 * cho phép người dùng thêm thẳng món đồ từ mục "Complete The Look" vào giỏ hàng.
 */
export default function QuickAddModal({
  isOpen,            // Trạng thái modal có đang hiển thị hay không (boolean)
  product,           // Thông tin sản phẩm đang được chọn
  onClose,           // Hàm gọi khi nhấn nút đóng hoặc click ra vùng nền đen bên ngoài
  onConfirm,         // Hàm gọi khi nhấn nút "ADD TO CART"
}) {
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

  // Nếu modal không mở hoặc không có dữ liệu sản phẩm thì không render gì cả
  if (!isOpen || !product) return null

  // Hàm định dạng số tiền VND (VD: 850,000₫)
  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN').format(val) + '₫'

  const availableColors = product.colors || ['DEFAULT', 'SILVER']
  const availableSizes = product.sizes || ['One Size', 'M', 'L']

  // Xử lý khi người dùng nhấn nút xác nhận thêm vào giỏ
  const handleAdd = () => {
    onConfirm?.({
      ...product,
      selectedColor,
      selectedSize,
      quantity,
    })
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Khung nội dung modal trắng (ngăn nổi bọt sự kiện click để không bị tự tắt khi click vào bên trong) */}
      <div
        className="bg-white w-full max-w-sm rounded-[2px] border border-neutral-200 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ------------------------------------------------------------- */}
        {/* PHẦN 1: HEADER MODAL (DANH MỤC & NÚT ĐÓNG X)                  */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            {product.category || 'M STUDIO ATELIER'}
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
              src={product.image || FALLBACK_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE
              }}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs uppercase text-[#111111] truncate">
              {product.name}
            </h4>
            <p className="font-mono font-bold text-sm text-[#111111] mt-0.5">
              {formatVND(product.price)}
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
            <div className="flex gap-2">
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
            <div className="flex gap-2">
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
        {/* PHẦN 4: NÚT BẤM THÊM VÀO GIỎ HÀNG (ADD TO CART)               */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full h-11 bg-[#111111] text-white hover:bg-neutral-800 font-semibold text-xs tracking-widest rounded-[2px] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>
    </div>
  )
}
