import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';

// Hàm lấy màu sắc nổi bật cho từng loại Badge
function getBadgeStyle(variant) {
  const v = (variant || '').toLowerCase();
  if (v.includes('sale') || v.includes('discount')) {
    return 'bg-red-600 text-white';
  }
  if (v.includes('sold') || v.includes('out')) {
    return 'bg-neutral-800 text-neutral-200';
  }
  if (v.includes('hot') || v.includes('best')) {
    return 'bg-amber-600 text-white';
  }
  // Mặc định hoặc NEW
  return 'bg-black text-white';
}

export default function ProductCard({
  product,
  id: propId,
  name: propName,
  price: propPrice,
  images: propImages,
  image: propImage,
  badge: propBadge,
  isSoldOut: propIsSoldOut = false,
  onQuickAdd,
  className = '',
}) {
  const currentProduct = product || {
    id: propId,
    name: propName,
    price: propPrice,
    images: propImages,
    image: propImage,
    badge: propBadge,
    isSoldOut: propIsSoldOut,
  };

  if (!currentProduct || !currentProduct.id) return null;

  const { id, name, price, badge } = currentProduct;
  const isSoldOut = Boolean(
    currentProduct.isSoldOut ||
    (currentProduct.stock !== undefined && Number(currentProduct.stock) === 0) ||
    (typeof currentProduct.badge === 'string' &&
      (currentProduct.badge.trim().toUpperCase() === 'SOLDOUT' ||
       currentProduct.badge.trim().toUpperCase() === 'SOLD OUT'))
  );

  // Chuẩn hóa đường dẫn ảnh
  const rawImage =
    (Array.isArray(currentProduct.images) && currentProduct.images.length > 0
      ? currentProduct.images[0]
      : null) ||
    currentProduct.image ||
    FALLBACK_IMAGE;

  const displayImage =
    typeof rawImage === 'string'
      ? rawImage.replace(/^(\.\/)?public\//, '/')
      : FALLBACK_IMAGE;

  // Định dạng số phân tách dấu chấm: 3.300.000
  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN').format(val || 0);

  return (
    <div
      className={`group relative flex flex-col bg-white border border-neutral-100 hover:border-neutral-300 transition-colors duration-200 ${className}`}
    >
      {/* 1. KHUNG ẢNH */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white border-b border-neutral-100 flex items-center justify-center p-3">
        <Link to={`/products/${id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={name || 'Product Image'}
            className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </Link>

        {/* Lớp nền bóng đen che lên ảnh cho sản phẩm Sold Out (tương tự Public Shop) */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-white text-xs font-mono uppercase tracking-widest font-bold border border-white px-3 py-1">
              SOLD OUT
            </span>
          </div>
        )}

        {/* 2. CÁC BADGE TRẠNG THÁI */}
        {!isSoldOut && badge && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-sm shadow-sm ${getBadgeStyle(badge)}`}>
              {badge}
            </span>
          </div>
        )}

        {/* Nút Quick Add khi hover */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickAdd) onQuickAdd({ ...currentProduct, image: displayImage });
            }}
            className="absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center bg-white/95 border border-neutral-200 text-neutral-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white cursor-pointer shadow-sm"
            title="Quick add"
            aria-label="Quick add"
          >
            <span className="text-sm font-light leading-none">+</span>
          </button>
        )}
      </div>

      {/* 3. KHUNG THÔNG TIN PHÍA DƯỚI */}
      <div className="p-3 flex flex-col justify-between bg-white text-left">
        <Link
          to={`/products/${id}`}
          className="text-[15px] font-normal uppercase tracking-wider text-neutral-900 hover:underline line-clamp-1"
        >
          {name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-medium tracking-tight text-neutral-800">
            {formatPrice(price)}
          </span>
          {currentProduct.originalPrice && currentProduct.originalPrice > price && (
            <span className="text-xs font-mono text-neutral-400 line-through">
              {formatPrice(currentProduct.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}