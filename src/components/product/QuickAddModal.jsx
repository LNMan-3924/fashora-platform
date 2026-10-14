import { useState, useEffect } from 'react';

export default function QuickAddModal({ product, isOpen, onClose, onAddToCart }) {
  // 1. Khai báo đúng cú pháp: const [tênState, setTênState] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 2. useEffect cập nhật giá trị mặc định
  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedColor(product.colors?.[0] || 'BLACK');
      setSelectedSize(product.sizes?.[0] || 'S');
      setQuantity(1);
    }
  }, [product, isOpen]);

  // 3. Kiểm tra điều kiện đóng modal (phải đặt DƯỚI các hook ở trên)
  if (!isOpen || !product) return null;

  const colors = (product.colors && product.colors.length > 0) ? product.colors : ['BLACK'];
  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['S', 'M', 'L', 'XL'];

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN').format(val || 0) + '₫';

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        shopName: product.shopName || 'M STUDIO',
        color: selectedColor,
        size: selectedSize,
        quantity,
      });
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px] transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[420px] rounded-sm bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400">
            QUICK ADD TO CART
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Thông tin vắn tắt sản phẩm */}
        <div className="mt-4 flex gap-4">
          <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-neutral-100">
            <img
              src={product.images?.[0] || product.image || '/placeholder.png'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
              SHOP: {product.shopName || 'M STUDIO'}
            </span>
            <h4 className="mt-0.5 text-xs font-semibold uppercase text-neutral-900 line-clamp-2 leading-snug">
              {product.name}
            </h4>
            <span className="mt-1 text-xs font-medium text-neutral-800">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Lựa chọn màu */}
        <div className="mt-5">
          <div className="flex justify-between text-[11px] uppercase tracking-wider">
            <span className="text-neutral-500">COLOR</span>
            <span className="font-semibold text-neutral-900">{selectedColor}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all border ${
                  selectedColor === c
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Lựa chọn kích cỡ */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider">
            <span className="text-neutral-500">SIZE</span>
            <span className="font-semibold text-neutral-900">{selectedSize}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`min-w-[36px] px-2.5 py-1.5 text-[11px] font-medium transition-all border ${
                  selectedSize === s
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Số lượng & Tổng tiền */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">
              QUANTITY <span className="ml-1 text-[9px]">MIN 1</span>
            </div>
            <div className="mt-1.5 flex items-center border border-neutral-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-semibold text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
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
              {formatPrice((product.price || 0) * quantity)}
            </span>
          </div>
        </div>

        {/* Nút Thêm Vào Giỏ */}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-black py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          <span>ADD TO CART</span>
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 14H6V9h2v2h2V9h4v2h2V9h2v11z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}