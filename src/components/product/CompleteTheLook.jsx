import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';

// Hàm đồng bộ màu sắc nhãn Badge chuẩn nhận diện Fashora
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
  return 'bg-black text-white';
}

// 8 Sản phẩm phối đồ mẫu đại diện đầy đủ các phân loại thời trang (Outfit Curation)
const DEFAULT_LOOK_ITEMS = [
  // --- TRANG 1: PHỤ KIỆN, TÚI VÀ NÓN ---
  {
    id: 'prd_acc_01',
    name: 'LIQUID THORN SUNGLASSES',
    price: 450000,
    image: '/images/products/accessories/acc-01.jpg',
    images: ['/images/products/accessories/acc-01.jpg'],
    category: 'ACCESSORIES',
    shopName: 'M STUDIO',
    badge: null,
    isSoldOut: false,
    colors: ['Silver Chrome', 'Smoke Lens'],
    sizes: ['One Size'],
    stock: 15,
  },
  {
    id: 'prd_acc_02',
    name: 'BIOMORPHIC PERFORATED RING',
    price: 180000,
    image: '/images/products/accessories/acc-02.jpg',
    images: ['/images/products/accessories/acc-02.jpg'],
    category: 'JEWELRY',
    shopName: 'M STUDIO',
    badge: null,
    isSoldOut: false,
    colors: ['Titanium Silver'],
    sizes: ['Freesize'],
    stock: 20,
  },
  {
    id: 'prd_acc_03',
    name: 'SCULPTURAL PATENT SHOULDER BAG',
    price: 750000,
    image: '/images/products/accessories/acc-03.jpg',
    images: ['/images/products/accessories/acc-03.jpg'],
    category: 'BAGS',
    shopName: 'M STUDIO',
    badge: 'SALE',
    isSoldOut: false,
    colors: ['Patent Black'],
    sizes: ['One Size'],
    stock: 8,
  },
  {
    id: 'prd_acc_04',
    name: 'DISTRESSED GRAPHIC BASEBALL CAP',
    price: 240000,
    image: '/images/products/accessories/acc-04.jpg',
    images: ['/images/products/accessories/acc-04.jpg'],
    category: 'HEADWEAR',
    shopName: 'M STUDIO',
    badge: null,
    isSoldOut: false,
    colors: ['Washed Black'],
    sizes: ['One Size'],
    stock: 12,
  },

  // --- TRANG 2: GIÀY, ÁO, QUẦN VÀ THẮT LƯNG ---
  {
    id: 'prd_shoes_06',
    name: 'MONOLITH LUG DERBY SHOES',
    price: 2100000,
    image: '/images/products/shoes/shoes-06.jpg',
    images: ['/images/products/shoes/shoes-06.jpg'],
    category: 'SHOES',
    shopName: 'M STUDIO',
    badge: 'HOT',
    isSoldOut: false,
    colors: ['Polished Jet Black'],
    sizes: ['39', '40', '41', '42'],
    stock: 6,
  },
  {
    id: 'prd_shirt_01',
    name: 'BOXY OVERSIZED DRAPED SHIRT',
    price: 890000,
    image: '/images/products/apparel/shirt-01.jpg',
    images: ['/images/products/apparel/shirt-01.jpg'],
    category: 'SHIRT',
    shopName: 'M STUDIO',
    badge: 'NEW',
    isSoldOut: false,
    colors: ['Optic White', 'Asphalt'],
    sizes: ['S', 'M', 'L'],
    stock: 14,
  },
  {
    id: 'prd_pants_02',
    name: 'WIDE-LEG PLEATED TAILORED TROUSERS',
    price: 1150000,
    image: '/images/products/apparel/pants-02.jpg',
    images: ['/images/products/apparel/pants-02.jpg'],
    category: 'PANTS',
    shopName: 'M STUDIO',
    badge: null,
    isSoldOut: false,
    colors: ['Charcoal Black'],
    sizes: ['28', '30', '32'],
    stock: 10,
  },
  {
    id: 'prd_acc_07',
    name: 'TEXTURED RAW CUT LEATHER BELT',
    price: 390000,
    image: '/images/products/accessories/acc-07.jpg',
    images: ['/images/products/accessories/acc-07.jpg'],
    category: 'ACCESSORIES',
    shopName: 'M STUDIO',
    badge: null,
    isSoldOut: true,
    colors: ['Distressed Black'],
    sizes: ['One Size'],
    stock: 0,
  },
];

export default function CompleteTheLook({
  items,
  title = 'COMPLETE THE LOOK',
  subtitle = 'Curated pairings from M STUDIO to complement your selected silhouette.',
  viewAllLink = '/shop',
  onQuickAdd,
  className = '',
}) {
  const [apiItems, setApiItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          // Lấy đa dạng các thể loại: Phụ kiện, Giày, Áo, Quần
          const categories = ['ACCESSORIES', 'SHOES', 'SHIRT', 'PANTS', 'BAGS', 'JEWELRY'];
          const diverseList = [];
          
          // Ưu tiên chọn rải đều mỗi thể loại 1-2 món để đủ bộ phối
          categories.forEach((cat) => {
            const matches = data.filter((p) => p.category?.toUpperCase()?.includes(cat));
            if (matches.length > 0) {
              diverseList.push(...matches.slice(0, 2));
            }
          });

          // Nếu lọc theo danh mục chưa đủ 8 thì lấy thêm các sản phẩm khác trong db.json
          const combined = diverseList.length >= 8 ? diverseList : [...diverseList, ...data];
          const uniqueItems = Array.from(new Map(combined.map((item) => [item.id, item])).values());
          const selected = uniqueItems.slice(0, 8);

          const formatted = selected.map((p) => ({
            ...p,
            isSoldOut: Boolean(p.stock === 0 || p.isSoldOut || p.status === 'SOLD_OUT'),
            badge: p.badge || p.tag || (p.salePrice ? 'SALE' : null),
          }));

          setApiItems(formatted);
        }
      })
      .catch((err) => {
        console.warn('CompleteTheLook API fallback:', err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN').format(Number(val) || 0);

  const allItems =
    items && items.length > 0 && items !== DEFAULT_LOOK_ITEMS
      ? items
      : apiItems.length > 0
        ? apiItems
        : DEFAULT_LOOK_ITEMS;

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE) + 1;
  const visibleItems = allItems.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - ITEMS_PER_PAGE));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + ITEMS_PER_PAGE < allItems.length ? prev + ITEMS_PER_PAGE : prev
    );
  };

  return (
    <section className={className || "mt-16 lg:mt-24 pt-10 border-t border-neutral-200"}>
      {/* ------------------------------------------------------------- */}
      {/* HEADER KHỐI GỢI Ý & BỘ NÚT ĐIỀU HƯỚNG MŨI TÊN                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
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

        <div className="flex items-center gap-4 sm:gap-6">
          {allItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400 tracking-widest mr-1">
                {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous items"
                className={`w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
                  currentIndex === 0
                    ? 'opacity-30 cursor-not-allowed bg-neutral-50 text-neutral-400'
                    : 'hover:bg-black hover:text-white hover:border-black cursor-pointer text-[#111111]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex + ITEMS_PER_PAGE >= allItems.length}
                aria-label="Next items"
                className={`w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
                  currentIndex + ITEMS_PER_PAGE >= allItems.length
                    ? 'opacity-30 cursor-not-allowed bg-neutral-50 text-neutral-400'
                    : 'hover:bg-black hover:text-white hover:border-black cursor-pointer text-[#111111]'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

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
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LƯỚI 4 SẢN PHẨM PHỐI HỢP CÁC PHÂN LOẠI                         */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {visibleItems.map((prod) => {
          const isSoldOut = Boolean(prod.isSoldOut || prod.stock === 0);
          const badge = prod.badge || prod.tag;

          const rawImage =
            (Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images[0]
              : null) ||
            prod.image ||
            FALLBACK_IMAGE;

          const displayImage =
            typeof rawImage === 'string'
              ? rawImage.replace(/^(\.\/)?public\//, '/')
              : FALLBACK_IMAGE;

          return (
            <div
              key={prod.id}
              className="group border border-neutral-100 hover:border-neutral-300 rounded-[2px] bg-white overflow-hidden flex flex-col justify-between transition-colors duration-200 relative"
            >
              {/* KHUNG ẢNH */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-white border-b border-neutral-100 flex items-center justify-center p-3">
                <Link to={`/products/${prod.id}`} className="block h-full w-full">
                  <img
                    src={displayImage}
                    alt={prod.name || 'Product Image'}
                    className={`h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                      isSoldOut ? 'opacity-60 grayscale' : ''
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </Link>

                {/* BADGE TRẠNG THÁI */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
                  {isSoldOut ? (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-sm shadow-sm ${getBadgeStyle(
                        'soldout'
                      )}`}
                    >
                      SOLD OUT
                    </span>
                  ) : badge ? (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-sm shadow-sm ${getBadgeStyle(
                        badge
                      )}`}
                    >
                      {badge}
                    </span>
                  ) : null}
                </div>

                {/* NÚT THÊM NHANH */}
                {!isSoldOut && (
                  <button
                    type="button"
                    aria-label={`Quick add ${prod.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onQuickAdd) onQuickAdd({ ...prod, image: displayImage });
                    }}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white text-[#111111] shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#111111] hover:text-white z-10 cursor-pointer group/btn"
                    title="Quick add"
                  >
                    <Plus className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
                  </button>
                )}
              </div>

              {/* THÔNG TIN DANH MỤC, TÊN VÀ GIÁ */}
              <div className="p-3 flex flex-col justify-between bg-white text-left grow">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                  {prod.category || 'M STUDIO'}
                </span>
                <Link
                  to={`/products/${prod.id}`}
                  className="text-[14px] font-normal uppercase tracking-wider text-neutral-900 hover:underline line-clamp-1"
                  title={prod.name}
                >
                  {prod.name}
                </Link>
                <span className="mt-1 text-[14px] font-medium tracking-tight text-neutral-800">
                  {formatPrice(prod.price)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}