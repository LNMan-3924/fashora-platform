import { useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';

const FALLBACK_IMAGE = '/placeholder.png';

function QuickAddContent({ product, onClose, onConfirm, onAddToCart }) {

  // Lấy hàm addToCart từ store
  const addToCart = useCartStore((state) => state.addToCart);

  const colors =
    Array.isArray(product?.colors) && product.colors.length > 0
      ? product.colors
      : [product?.color || 'DEFAULT'];

  const sizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : [product?.size || 'One Size'];

  const [selectedColor, setSelectedColor] = useState(colors[0] || 'DEFAULT');
  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'One Size');
  const [quantity, setQuantity] = useState(1);

  const rawImage =
    product?.image ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : null) ||
    FALLBACK_IMAGE;

  const displayImage =
    typeof rawImage === 'string'
      ? rawImage.replace(/^(\.\/)?public\//, '/')
      : FALLBACK_IMAGE;

  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + '₫';

  const shopName =
    product?.shopName || product?.sellerName || product?.storeName || 'M STUDIO';

  // Xử lý thêm vào giỏ: cho phép cả khách vãng lai và người dùng đã đăng nhập
  const handleAdd = () => {
    const payload = {
      ...product,
      id: product?.id,
      name: product?.name,
      shopName,
      image: displayImage,
      selectedColor,
      selectedSize,
      color: selectedColor,
      size: selectedSize,
      quantity,
    };

    if (typeof onAddToCart === 'function') {
      onAddToCart(payload, selectedSize, selectedColor, quantity);
    } else if (typeof onConfirm === 'function') {
      onConfirm(payload);
    } else if (typeof addToCart === 'function') {
      try {
        addToCart(product, selectedSize, selectedColor, quantity);
      } catch {
        try {
          addToCart(payload);
        } catch (err) {
          console.warn('Lỗi khi gọi addToCart:', err);
        }
      }
    }

    if (typeof onClose === 'function') onClose();
  };

  return (
    <div
      className="bg-white w-full max-w-[420px] rounded-sm border border-neutral-200 p-6 shadow-2xl space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400">
          {product?.category || 'QUICK ADD TO CART'}
        </span>
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="text-neutral-400 hover:text-black transition-colors text-base font-bold px-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex gap-4 items-center">
        <div className="w-16 h-20 bg-neutral-100 rounded-sm overflow-hidden shrink-0 border border-neutral-200">
          <img
            src={displayImage}
            alt={product?.name || 'Product'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-normal block">
            SHOP: {shopName}
          </span>
          <h4 className="font-semibold text-xs uppercase text-neutral-900 truncate mt-0.5">
            {product?.name}
          </h4>
          <p className="font-semibold text-xs text-neutral-900 mt-1">
            {formatVND(product?.price)}
          </p>
        </div>
      </div>

      {/* Biến thể Color & Size */}
      <div className="space-y-4 pt-1">
        <div>
          <div className="flex justify-between text-[11px] uppercase tracking-wider mb-2">
            <span className="text-neutral-500">COLOR</span>
            <span className="font-semibold text-neutral-900">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedColor === color
                    ? 'border-black bg-black text-white font-bold'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2 text-neutral-500 font-medium">
            SIZE
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-w-[36px] px-2.5 py-1.5 text-[11px] font-medium transition-all border cursor-pointer ${
                  selectedSize === size
                    ? 'border-black bg-black text-white font-bold'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Số lượng */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
              QUANTITY
            </div>
            <div className="inline-flex items-center border border-neutral-200 bg-white h-8">
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-full flex items-center justify-center text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-semibold text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-8 h-full flex items-center justify-center text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-neutral-400">
              TOTAL
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {formatVND((product?.price || 0) * quantity)}
            </span>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 bg-black py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 active:scale-[0.99] cursor-pointer"
        >
          <span>ADD TO CART</span>
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 14H6V9h2v2h2V9h4v2h2V9h2v11z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function QuickAddModal({
  isOpen,
  product,
  onClose,
  onConfirm,
  onAddToCart,
}) {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <QuickAddContent
        key={product?.id || 'quick-add'}
        product={product}
        onClose={onClose}
        onConfirm={onConfirm}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}