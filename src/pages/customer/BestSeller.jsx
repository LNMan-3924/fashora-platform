import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  Store,
  Sparkles,
  CheckCircle2,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { getProducts, getOrders, getShops } from '../../services/api';
import { useCartStore } from '../../stores';
import { QuickAddModal } from '../../components/product';
import { Toast } from '../../components/common';
import { formatVND, handleImageError, FALLBACK_IMAGE, toShopSlug } from '../../constants/commerce';

export default function BestSeller() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShopFilter, setSelectedShopFilter] = useState('ALL');

  // Quick Add Modal & Toast notification state
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const addToCartStore = useCartStore((state) => state.addToCart);

  // Cuộn lên đầu trang khi vào trang Best Seller
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Tải đồng thời Products, Orders và Shops từ API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [prodsRes, ordersRes, shopsRes] = await Promise.allSettled([
          getProducts(),
          getOrders(),
          getShops(),
        ]);

        if (!isMounted) return;

        const prodsData = prodsRes.status === 'fulfilled' ? (prodsRes.value?.data || prodsRes.value || []) : [];
        const ordersData = ordersRes.status === 'fulfilled' ? (ordersRes.value?.data || ordersRes.value || []) : [];
        const shopsData = shopsRes.status === 'fulfilled' ? (shopsRes.value?.data || shopsRes.value || []) : [];

        setProducts(Array.isArray(prodsData) ? prodsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setShops(Array.isArray(shopsData) ? shopsData : []);
      } catch (err) {
        console.error('BestSeller: Error loading catalog data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Tính toán bảng thống kê số lượng đã bán (Sales Map) từ các đơn hàng hợp lệ
  const salesMap = useMemo(() => {
    const map = {};
    (orders || []).forEach((order) => {
      const statusUpper = (order.status || '').toUpperCase();
      if (statusUpper !== 'CANCELLED') {
        (order.items || []).forEach((item) => {
          if (item?.id) {
            map[item.id] = (map[item.id] || 0) + (Number(item.quantity) || 1);
          }
        });
      }
    });
    return map;
  }, [orders]);

  // 2. Danh sách tất cả sản phẩm được gắn kèm soldCount và sắp xếp theo độ bán chạy
  const rankedProducts = useMemo(() => {
    return products
      .map((p) => {
        const sold = salesMap[p.id] || 0;
        let badgeScore = 0;
        const b = String(p.badge || '').toUpperCase();
        if (b.includes('HOT') || b.includes('BEST')) badgeScore = 3;
        else if (b.includes('SALE')) badgeScore = 2;
        else if (b.includes('NEW')) badgeScore = 1;

        return {
          ...p,
          soldCount: sold,
          badgeScore,
        };
      })
      .sort((a, b) => {
        // Ưu tiên 1: Lượt bán thực tế giảm dần
        if (b.soldCount !== a.soldCount) {
          return b.soldCount - a.soldCount;
        }
        // Ưu tiên 2: Huy hiệu HOT/BEST
        if (b.badgeScore !== a.badgeScore) {
          return b.badgeScore - a.badgeScore;
        }
        // Ưu tiên 3: Sản phẩm còn hàng trước
        const aOut = a.isSoldOut || Number(a.stock) === 0;
        const bOut = b.isSoldOut || Number(b.stock) === 0;
        if (aOut !== bOut) return aOut ? 1 : -1;
        return 0;
      });
  }, [products, salesMap]);

  // 3. Top 3 sản phẩm bán chạy nhất toàn sàn (The Podium / Top 3 Best Sellers)
  const topThreePlatform = useMemo(() => {
    return rankedProducts.slice(0, 3);
  }, [rankedProducts]);

  // 4. Nhóm các sản phẩm Best Seller theo từng Atelier / Shop
  const shopShowcases = useMemo(() => {
    if (!shops || shops.length === 0) return [];

    return shops
      .map((shop) => {
        const sSlug = toShopSlug(shop.slug || shop.name);
        const sId = shop.id;

        // Lọc sản phẩm thuộc về shop này
        const shopProducts = rankedProducts.filter((p) => {
          if (p.shopId && sId && p.shopId === sId) return true;
          if (p.shopName && shop.name && p.shopName.trim().toLowerCase() === shop.name.trim().toLowerCase()) return true;
          if (toShopSlug(p.shopName) === sSlug) return true;
          // Fallback cho M STUDIO (shop mặc định nếu thiếu shopId)
          if ((sId === 'shop_m_studio' || sSlug === 'm-studio') && (!p.shopId || p.shopId === 'shop_m_studio')) {
            return true;
          }
          return false;
        });

        // Lấy top 4 sản phẩm bán chạy nhất của shop
        const topShopItems = shopProducts.slice(0, 4);

        // Tổng lượt bán tích lũy của toàn shop
        const totalShopSold = shopProducts.reduce((acc, it) => acc + (it.soldCount || 0), 0);

        return {
          shop,
          slug: shop.slug || sSlug,
          items: topShopItems,
          totalProducts: shopProducts.length,
          totalShopSold,
        };
      })
      .filter((group) => group.items.length > 0)
      .sort((a, b) => b.totalShopSold - a.totalShopSold);
  }, [shops, rankedProducts]);

  // Danh sách các Shop hiển thị sau khi lọc qua tab chọn Shop
  const visibleShowcases = useMemo(() => {
    if (selectedShopFilter === 'ALL') return shopShowcases;
    return shopShowcases.filter(
      (s) => s.shop.id === selectedShopFilter || s.slug === selectedShopFilter
    );
  }, [shopShowcases, selectedShopFilter]);

  // Xử lý mở Quick Add Modal
  const handleOpenQuickAdd = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuickAddProduct(product);
  };

  // Xác nhận thêm sản phẩm vào giỏ hàng
  const handleConfirmQuickAdd = (variantData) => {
    if (!quickAddProduct) return;

    const targetSize = variantData.selectedSize || variantData.size || 'One Size';
    const targetColor = variantData.selectedColor || variantData.color || 'Standard';
    const targetQty = Number(variantData.quantity) || 1;

    const primaryImage =
      (Array.isArray(quickAddProduct.images) && quickAddProduct.images[0]) ||
      quickAddProduct.image ||
      FALLBACK_IMAGE;

    const result = addToCartStore(
      {
        ...quickAddProduct,
        id: quickAddProduct.id,
        name: quickAddProduct.name,
        price: Number(quickAddProduct.price) || 0,
        image: primaryImage,
        images:
          Array.isArray(quickAddProduct.images) && quickAddProduct.images.length > 0
            ? quickAddProduct.images
            : [primaryImage],
        shopName: quickAddProduct.shopName || 'M STUDIO',
        category: quickAddProduct.category || 'SET',
        stock: quickAddProduct.stock ?? 99,
      },
      targetSize,
      targetColor,
      targetQty
    );

    if (result?.success === false) {
      setToastMessage(result.message);
    } else {
      const prodName = (quickAddProduct.name || 'PIECE').toUpperCase();
      setToastMessage(`ADDED ${prodName} TO CART.`);
    }
    setQuickAddProduct(null);
  };

  return (
    <div className="w-full bg-[#fdfdfd] text-[#111111] min-h-screen">
      {/* =========================================================================
          KHỐI 1: EDITORIAL PAGE HEADER
          - Breadcrumb: HOME / BEST SELLER
          - Typography Brutalist Runway: Cắt nét in hoa sắc sảo
          - Chỉ số vinh danh các Atelier độc lập
          ========================================================================= */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-4"
          >
            <Link to="/home" className="hover:text-black transition-colors">
              HOME
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">BEST SELLER</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[10px] font-mono tracking-[0.2em] uppercase font-bold">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>MOST COVETED ARCHIVE</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-950 leading-none">
              BEST SELLER
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed tracking-wide">
              Explore the most acquired silhouettes across all independent design studios. 
              Each garment represents our ateliers&apos; highest level of craftsmanship and permanent aesthetic demand.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 2: THE PODIUM / PLATFORM-WIDE TOP 3 (3 SIÊU PHẨM BÁN CHẠY NHẤT TOÀN SÀN)
          - Vinh danh 3 vị trí dẫn đầu toàn nền tảng FASHORA
          - Bố cục bục danh dự: Rank #01 ở trung tâm (hoặc trái qua phải), viền chrome ấn tượng
          ========================================================================= */}
      {topThreePlatform.length > 0 && (
        <section className="border-b border-neutral-200 bg-neutral-950 text-white py-12 sm:py-16">
          <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
            <div className="mb-8 sm:mb-10 pb-4 border-b border-neutral-800">
              <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
                TOP 3 BEST SELLERS
              </h2>
            </div>

            {/* Grid 3 sản phẩm đứng bục */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-8">
              {topThreePlatform.map((item, idx) => {
                const mainImg = item.images?.[0] || item.image || FALLBACK_IMAGE;
                const hoverImg = item.images?.[1] || mainImg;
                const hasHover = item.images && item.images.length > 1;

                const rankLabels = ['RANK #01 • GOLD ICONS', 'RANK #02 • SILVER ICONS', 'RANK #03 • BRONZE ICONS'];
                const rankAccents = [
                  'border-amber-400/80 bg-amber-400 text-black',
                  'border-neutral-300 bg-neutral-200 text-black',
                  'border-orange-400/80 bg-orange-300 text-black',
                ];

                return (
                  <div
                    key={`podium-${item.id || idx}`}
                    className="group bg-[#151515] border border-neutral-800 hover:border-neutral-500 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
                  >
                    {/* Header Rank Badge */}
                    <div className="p-2.5 sm:p-3 border-b border-neutral-800 flex items-center justify-between gap-2 min-w-0">
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 shrink-0 whitespace-nowrap ${rankAccents[idx] || 'bg-white text-black'}`}>
                        {rankLabels[idx]}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase truncate text-right min-w-0" title={item.shopName || 'ATELIER'}>
                        {item.shopName || 'ATELIER'}
                      </span>
                    </div>

                    {/* Image Container with Crossfade */}
                    <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden">
                      <Link to={`/products/${item.id}`} className="block w-full h-full">
                        <img
                          src={mainImg}
                          alt={item.name}
                          className={`w-full h-full object-cover object-center transition-all duration-500 ${
                            hasHover ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                          }`}
                          onError={handleImageError}
                        />
                        {hasHover && (
                          <img
                            src={hoverImg}
                            alt={`${item.name} Alternate`}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </Link>

                      {/* Nút Quick Add (+) */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenQuickAdd(item, e)}
                        aria-label={`Quick add ${item.name}`}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 hover:scale-110 transition-all shadow-md cursor-pointer z-10"
                        title="Quick add to cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Details */}
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
                          {item.category || 'SET'}
                        </span>
                        <Link
                          to={`/products/${item.id}`}
                          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:text-neutral-300 transition-colors line-clamp-2 mt-0.5 block min-h-[2.25rem]"
                          title={item.name}
                        >
                          {item.name}
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-mono font-bold text-white shrink-0 whitespace-nowrap">
                          {formatVND(item.price)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-800/60 uppercase shrink-0 whitespace-nowrap">
                          {item.soldCount > 0 ? `${item.soldCount} SOLD` : 'HIGH DEMAND'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          KHỐI 3: THANH ĐIỀU HƯỚNG SHOP NHANH (ATELIER QUICK JUMP DOCK)
          - Hiển thị danh sách Avatar và Tên các Shop để người mua có thể bấm lọc
          - Phong cách dock ngang tinh tế, hỗ trợ cuộn mượt
          ========================================================================= */}
      <section className="sticky top-20 md:top-[121px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 sm:py-4 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Store className="w-4 h-4 text-neutral-500 hidden sm:block" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-900">
              ATELIER DIRECTORY:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Nút ALL ATELIERS */}
            <button
              type="button"
              onClick={() => setSelectedShopFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                selectedShopFilter === 'ALL'
                  ? 'bg-black text-white border-black font-bold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-black hover:text-black'
              }`}
            >
              ALL ATELIERS ({shopShowcases.length})
            </button>

            {/* Các Shop cụ thể */}
            {shopShowcases.map(({ shop, slug }) => {
              const isSelected = selectedShopFilter === shop.id || selectedShopFilter === slug;
              return (
                <button
                  key={shop.id || slug}
                  type="button"
                  onClick={() => setSelectedShopFilter(shop.id || slug)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? 'bg-black text-white border-black font-bold shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {/* Mini Avatar */}
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-black flex items-center justify-center h-full">
                        {shop.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span>{shop.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 4: ATELIER BEST SELLERS SHOWCASE (Ý TƯỞNG CỐT LÕI CỦA NGƯỜI DÙNG)
          - Phân tách theo từng Shop (M STUDIO, enire, SMOKER, #SWAG, L'OBSCUR ATELIER...)
          - Header của mỗi shop mang phong cách độc lạ: Avatar tròn lớn viền kép kim loại,
            tên shop in hoa, tagline, vị trí và nút dẫn sang Storefront (/store/:slug)
          - Lưới 4 sản phẩm bán chạy nhất của từng shop kèm huy hiệu #01, #02...
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-16 sm:space-y-24">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              RETRIEVING ATELIER BEST SELLER ARCHIVES...
            </p>
          </div>
        ) : visibleShowcases.length > 0 ? (
          visibleShowcases.map(({ shop, slug, items, totalShopSold }) => {
            return (
              <div
                key={shop.id || slug}
                id={`atelier-section-${shop.id}`}
                className="space-y-6 sm:space-y-8 animate-in fade-in duration-300"
              >
                {/* 1. KHỐI HEADER SHOP ĐỘC ĐÁO & NỔI BẬT (BRUTALIST ATELIER CARD) */}
                <div className="bg-[#111111] text-white p-6 sm:p-8 rounded-[2px] border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  {/* Subtle watermarked background monogram */}
                  <span className="absolute -right-4 -bottom-8 text-8xl font-black font-serif text-white/5 pointer-events-none select-none">
                    {shop.name?.slice(0, 3)}
                  </span>

                  {/* Left: Avatar + Brand Info */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 relative z-10">
                    {/* Avatar tròn lớn với viền kép sắc sảo */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black shrink-0 p-0.5 border-2 border-neutral-400 shadow-md overflow-hidden">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center font-serif text-2xl font-black">
                          {shop.name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Shop Identity */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                          {shop.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>VERIFIED ATELIER</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-mono text-neutral-300 tracking-wide">
                        {shop.tagline || 'Contemporary Minimalist Fashion Atelier'}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-neutral-400">
                        {shop.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-500" />
                            <span>{shop.location}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-neutral-300">
                          {totalShopSold > 0 ? `${totalShopSold} PIECES DISPATCHED` : 'ACTIVE COLLECTION'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: CTA to visit official storefront */}
                  <div className="flex items-center gap-3 relative z-10 self-start md:self-center">
                    <Link
                      to={`/store/${slug}`}
                      className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer group"
                    >
                      <span>VISIT ATELIER</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* 2. LƯỚI TOP 4 BEST SELLERS CỦA SHOP */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {items.map((prod, pIdx) => {
                    const mainImage = prod.images?.[0] || prod.image || FALLBACK_IMAGE;

                    return (
                      <div
                        key={prod.id || pIdx}
                        className="group flex flex-col justify-between bg-white border border-neutral-200 hover:border-black transition-all duration-300 overflow-hidden shadow-2xs"
                      >
                        {/* Container Ảnh Sản Phẩm */}
                        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                          <Link to={`/products/${prod.id}`} className="block w-full h-full">
                            {/* Ảnh chính zoom nhẹ khi hover tương tự /shop */}
                            <img
                              src={mainImage}
                              alt={prod.name}
                              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                              onError={handleImageError}
                            />
                          </Link>

                          {/* Huy hiệu thứ tự Best Seller nội bộ của shop (#01 BEST, #02 BEST...) */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase border border-neutral-700 shadow-xs">
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>#{String(pIdx + 1).padStart(2, '0')} BEST</span>
                            </span>
                          </div>

                          {/* Nút tròn Quick Add (+) */}
                          <button
                            type="button"
                            aria-label={`Quick add ${prod.name}`}
                            onClick={(e) => handleOpenQuickAdd(prod, e)}
                            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-105 shadow-md cursor-pointer z-10"
                            title="Quick add to cart"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                          <div>
                            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                              {prod.category || 'PIECE'}
                            </span>
                            <Link
                              to={`/products/${prod.id}`}
                              className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-neutral-900 hover:underline line-clamp-1 mt-0.5 block"
                              title={prod.name}
                            >
                              {prod.name}
                            </Link>
                          </div>

                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs sm:text-[13px] font-mono font-bold text-neutral-950">
                              {formatVND(prod.price)}
                            </span>
                            {prod.originalPrice && Number(prod.originalPrice) > Number(prod.price) && (
                              <span className="text-[10px] font-mono text-neutral-400 line-through">
                                {formatVND(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center border border-neutral-200 bg-white p-8">
            <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">
              NO ATELIER RECORDS FOUND
            </h4>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              No products found matching the active atelier filter.
            </p>
          </div>
        )}
      </section>


      {/* =========================================================================
          KHỐI 6: QUICK ADD MODAL & TOAST THÔNG BÁO TÁI SỬ DỤNG
          ========================================================================= */}
      <QuickAddModal
        key={quickAddProduct?.id || 'best-seller-quick-add'}
        product={quickAddProduct}
        isOpen={Boolean(quickAddProduct)}
        onClose={() => setQuickAddProduct(null)}
        onConfirm={handleConfirmQuickAdd}
      />

      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
        duration={3000}
      />
    </div>
  );
}
