import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { getProducts, getCarouselItems, getShops } from '../../services/api';
import CompleteTheLook from '../../components/product/CompleteTheLook';
import QuickAddModal from '../../components/product/QuickAddModal';
import { Toast } from '../../components/common';
import { useCartStore } from '../../stores';
import { useFollowShop } from '../../hooks/useFollowShop';
import { getLocalizedProduct, getLocalizedProductName } from '../../utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';

// Định dạng tiền tệ VND
const formatVND = (val) =>
  new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + '₫';

// Dữ liệu mặc định 6 Set sản phẩm chuẩn theo db.json (prd_set_01 -> prd_set_06)
const DEFAULT_SET_PRODUCTS = [
  {
    id: 'prd_set_01',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Military Officer Jacket & Shorts Set',
    category: 'SET',
    price: 1250000,
    originalPrice: 1450000,
    badge: 'NEW',
    isSoldOut: false,
    images: [
      '/images/products/set/set-01.jpg',
      '/images/products/set/set-01-hover.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    stock: 12,
  },
  {
    id: 'prd_set_02',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Quilted Biker Jacket & Flare Denim Set',
    category: 'SET',
    price: 1480000,
    originalPrice: 1750000,
    badge: 'SALE',
    isSoldOut: false,
    images: [
      '/images/products/set/set-02.jpg',
      '/images/products/set/set-02-hover.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Washed Black'],
    stock: 9,
  },
  {
    id: 'prd_set_03',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Shearling Leather Jacket & Cable Knit Skirt Set',
    category: 'SET',
    price: 1590000,
    originalPrice: null,
    badge: 'NEW',
    isSoldOut: false,
    images: [
      '/images/products/set/set-03.jpg',
      '/images/products/set/set-03-hover.jpg',
    ],
    sizes: ['S', 'M'],
    colors: ['Espresso Brown / Navy'],
    stock: 7,
  },
  {
    id: 'prd_set_04',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Double Collar Denim Jacket & Baggy Jeans Set',
    category: 'SET',
    price: 1350000,
    originalPrice: 1600000,
    badge: 'SALE',
    isSoldOut: false,
    images: [
      '/images/products/set/set-04.jpg',
      '/images/products/set/set-04-hover.jpg',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['Vintage Indigo Wash'],
    stock: 14,
  },
  {
    id: 'prd_set_05',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Architectural Funnel Leather Jacket & Zip Pants Set',
    category: 'SET',
    price: 1680000,
    originalPrice: null,
    badge: 'NEW',
    isSoldOut: false,
    images: [
      '/images/products/set/set-05.jpg',
      '/images/products/set/set-05-hover.jpg',
    ],
    sizes: ['M', 'L'],
    colors: ['Stark White / Black'],
    stock: 6,
  },
  {
    id: 'prd_set_06',
    shopId: 'shop_m_studio',
    shopName: 'M STUDIO',
    name: 'Colorblock Buckled Cardigan & Leather Pants Set',
    category: 'SET',
    price: 1390000,
    originalPrice: 1650000,
    badge: 'NEW',
    isSoldOut: false,
    images: [
      '/images/products/set/set-06.jpg',
      '/images/products/set/set-06-hover.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Black / Cream'],
    stock: 8,
  },
];

// Dữ liệu 4 slide chiến dịch nghệ thuật
const DEFAULT_CAROUSEL_ITEMS = [
  {
    id: 'carousel-01',
    name: 'GISELLE',
    code: 'NO.20001030',
    tagline: 'FUTURISTIC LEATHER',
    image: '/images/carousel/carousel-01.jpg',
    link: '/shop?category=SET',
  },
  {
    id: 'carousel-02',
    name: 'NINGNING',
    code: 'NO.20021023',
    tagline: 'CYBER CARGO & METALLIC',
    image: '/images/carousel/carousel-02.jpg',
    link: '/shop?category=PANTS',
  },
  {
    id: 'carousel-03',
    name: 'KARINA',
    code: 'NO.20000411',
    tagline: 'NEO-TECH ACCESSORIES',
    image: '/images/carousel/carousel-03.jpg',
    link: '/shop?category=ACCESSORIES',
  },
  {
    id: 'carousel-04',
    name: 'WINTER',
    code: 'NO.20010101',
    tagline: 'DARK BIKER AESTHETIC',
    image: '/images/carousel/carousel-04.jpg',
    link: '/shop?category=SHIRT',
  },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  // 1. Quản lý dữ liệu Set products & Carousel
  const [setProducts, setSetProducts] = useState(DEFAULT_SET_PRODUCTS);
  const [carouselItems, setCarouselItems] = useState(DEFAULT_CAROUSEL_ITEMS);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Quản lý dữ liệu Atelier Spotlight Carousel (Shops có ảnh bìa coverImage)
  const [featuredShops, setFeaturedShops] = useState([]);
  const [currentShopSlide, setCurrentShopSlide] = useState(0);

  // 2. Quản lý Quick Add Modal & Toast thông báo
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const addToCartStore = useCartStore((state) => state.addToCart);
  const { isFollowing, toggleFollow, isUpdating: isFollowUpdating } = useFollowShop();

  // Xử lý bật/tắt theo dõi gian hàng
  const handleFollowToggle = async (shopItem, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = await toggleFollow(shopItem);
    if (res?.success) {
      setToastMessage(
        res.isNowFollowing
          ? t('storefront.followSuccess', { name: shopItem?.name || 'atelier' })
          : t('storefront.unfollowSuccess', { name: shopItem?.name || 'atelier' })
      );
    } else if (res?.isOwner) {
      setToastMessage(t('storefront.ownAtelierToast', 'Đây là gian hàng của chính bạn.'));
    }
  };

  // Tự động cuộn lên đầu trang khi vào Home
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch dữ liệu từ API nếu có backend json-server chạy
  useEffect(() => {
    let isMounted = true;

    // Lấy danh sách sản phẩm Set
    getProducts()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const sets = data.filter(
            (p) =>
              p.category?.toUpperCase() === 'SET' ||
              (p.id && p.id.startsWith('prd_set_'))
          );
          if (sets.length >= 6) {
            setSetProducts(sets.slice(0, 6));
          }
        }
      })
      .catch((err) => {
        console.warn('Home set products API fallback:', err?.message);
      });

    // Lấy danh sách Carousel slides
    getCarouselItems()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item) => ({
            ...item,
            image: (item.image || '').replace(
              '/images/banners/',
              '/images/carousel/'
            ),
          }));
          setCarouselItems(normalized);
        }
      })
      .catch((err) => {
        console.warn('Home carousel items API fallback:', err?.message);
      });

    // Lấy danh sách Ateliers có coverImage để quảng bá trên Carousel Trang chủ
    getShops()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (Array.isArray(data)) {
          const validShops = data.filter(
            (s) =>
              s.status === 'ACTIVE' &&
              s.coverImage &&
              typeof s.coverImage === 'string' &&
              s.coverImage.trim() !== ''
          );
          setFeaturedShops(validShops);
        }
      })
      .catch((err) => {
        console.warn('Home featured shops API fallback:', err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Điều khiển slide Atelier Spotlight Carousel
  const handlePrevShopSlide = useCallback(() => {
    if (featuredShops.length <= 1) return;
    setCurrentShopSlide((prev) => (prev - 1 + featuredShops.length) % featuredShops.length);
  }, [featuredShops.length]);

  const handleNextShopSlide = useCallback(() => {
    if (featuredShops.length <= 1) return;
    setCurrentShopSlide((prev) => (prev + 1) % featuredShops.length);
  }, [featuredShops.length]);

  // Tự động chuyển slide Atelier Spotlight mỗi 5 giây
  useEffect(() => {
    if (featuredShops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentShopSlide((prev) => (prev + 1) % featuredShops.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredShops.length]);

  // Điều khiển slide Carousel
  const slides =
    carouselItems && carouselItems.length > 0
      ? carouselItems
      : DEFAULT_CAROUSEL_ITEMS;

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Tự động chuyển slide Carousel mỗi 4 giây (tự động lướt liên tục)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Xử lý mở Quick Add Modal
  const handleOpenQuickAdd = (product) => {
    setQuickAddProduct(product);
  };

  // Xác nhận thêm sản phẩm vào giỏ hàng
  // Cho phép khách vãng lai thêm thoải mái, chỉ yêu cầu đăng nhập khi Checkout
  const handleConfirmQuickAdd = (item) => {
    if (!quickAddProduct) return;

    const result = addToCartStore(
      {
        ...quickAddProduct,
        images:
          quickAddProduct.images ||
          (quickAddProduct.image ? [quickAddProduct.image] : []),
      },
      item.selectedSize || item.size || 'One Size',
      item.selectedColor || item.color || 'Standard',
      item.quantity || 1
    );

    const productName = getLocalizedProductName(
      quickAddProduct,
      i18n.language,
      quickAddProduct.name
    );

    if (result?.success === false) {
      setToastMessage(result.message);
    } else {
      setToastMessage(
        i18n.language?.startsWith('vi')
          ? `ĐÃ THÊM ${productName.toUpperCase()} VÀO GIỎ HÀNG.`
          : `ADDED ${productName.toUpperCase()} TO CART.`
      );
    }
  };

  return (
    <div className="w-full bg-white text-black selection:bg-black selection:text-white">
      {/* =========================================================================
          KHỐI 1: HERO BANNER (Full-bleed Runway Spotlight)
          - Chiều cao lớn (78vh - 86vh, min 560px)
          - Cụm trái: Tag SS26, Tiêu đề FASHORA / FASHION PLATFORM, Phụ đề
          - Cụm phải: 2 CTA buttons (EXPLORE PRODUCTS, BEST SELLERS)
          ========================================================================= */}
      <section className="relative w-full h-[78vh] sm:h-[82vh] lg:h-[86vh] min-h-[560px] max-h-[920px] overflow-hidden bg-black">
        {/* Ảnh nền Runway Editorial */}
        <img
          src="/images/banner/hero-banner.jpg"
          alt="Fashora Runway Spotlight"
          className="absolute inset-0 w-full h-full object-cover object-top sm:object-center select-none"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85';
          }}
        />

        {/* Lớp phủ Gradient chân banner tạo chiều sâu và độ sắc nét Brutalist */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 pointer-events-none" />

        {/* Nội dung Hero Banner */}
        <div className="relative h-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20 z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 sm:gap-10">
            {/* CỤM BÊN TRÁI */}
            <div className="max-w-2xl text-left">
              {/* Tiêu đề chính 2 dòng phong cách brutalist */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[0.95] select-none drop-shadow-lg">
                <span className="block">FASHORA</span>
                <span className="block text-white/95 mt-1 sm:mt-1.5">
                  {t('home.platform')}
                </span>
              </h1>

              {/* Phụ đề */}
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-mono tracking-widest text-neutral-300 uppercase leading-relaxed max-w-xl">
                {t('home.subtitle')}
              </p>
            </div>

            {/* CỤM BÊN PHẢI (Call-To-Action buttons) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 bg-black/40 border border-white/80 text-white backdrop-blur-sm font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-black active:scale-[0.99] shadow-xl text-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('home.backToExplore')}</span>
              </Link>
              <Link
                to="/shop?category=ALL"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 hover:bg-neutral-200 active:scale-[0.99] shadow-xl text-center"
              >
                <span>{t('home.exploreProducts')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 2: SET PRODUCTS STRIP (Hiển thị 6 set đồ từ Set 01 đến Set 06)
          - Lấy 6 sản phẩm Set từ db.json (prd_set_01 -> prd_set_06)
          - Hiệu ứng hover: images[0] mờ dần và chuyển mượt sang images[1] (set-01-hover.jpg)
          - BỎ nhãn chữ SET 01 ở góc trên của card ảnh
          - Thông tin bên dưới: Tên viết hoa toàn bộ và giá VND
          - Nút tròn + mở QuickAddModal
          - Nút "VIEW ALL SETS" ở đáy dải sản phẩm
          ========================================================================= */}
      {/* =========================================================================
          KHỐI 2: SET PRODUCTS STRIP (Hiển thị 6 set đồ từ Set 01 đến Set 06)
          - Hiển thị tối giản theo [ảnh 2]:
            + Bỏ tiêu đề FEATURED SETS & nút VIEW ALL ở trên
            + Bỏ khung viền (borderless) và nhãn badge
            + Ẩn tên và giá mặc định, hiển thị khi lia chuột (hover)
            + Giữ hiệu ứng chuyển mượt từ ảnh chính sang ảnh phụ khi hover
            + Nút xem thêm dưới dạng link "View more" tối giản kèm icon mũi tên
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
        {/* Lưới 6 sản phẩm Set */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {setProducts.map((product) => {
            const currentItem = getLocalizedProduct(product, i18n.language);
            const mainImg =
              (Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : null) ||
              product.image ||
              FALLBACK_IMAGE;

            const hoverImg =
              Array.isArray(product.images) && product.images.length > 1
                ? product.images[1]
                : null;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-transparent"
              >
                {/* Khung ảnh: kích thước lớn hơn, hiệu ứng hoán đổi mượt mà giữa images[0] và images[1] */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-white flex items-center justify-center p-0">
                  <Link
                    to={`/products/${product.id}`}
                    className="block h-full w-full relative"
                  >
                    {/* Ảnh chính images[0] */}
                    <img
                      src={mainImg}
                      alt={currentItem.name}
                      className={`absolute inset-0 w-full h-full object-contain object-center transition-all duration-500 ease-out ${
                        hoverImg
                          ? 'group-hover:opacity-0 group-hover:scale-105'
                          : 'group-hover:scale-105'
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Ảnh phụ images[1] (hover) */}
                    {hoverImg && (
                      <img
                        src={hoverImg}
                        alt={`${currentItem.name} hover view`}
                        className="absolute inset-0 w-full h-full object-contain object-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </Link>

                  {/* Nút tròn + mở Quick Add (hiện khi hover) */}
                  {!product.isSoldOut && (
                    <button
                      type="button"
                      aria-label={`${t('common.quickAdd', 'Thêm nhanh')} ${currentItem.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenQuickAdd(currentItem);
                      }}
                      className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-8 h-8 rounded-full bg-white text-[#111111] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-[#111111] hover:text-white z-10 cursor-pointer group/btn"
                      title={t('common.quickAdd', 'Thêm nhanh')}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
                    </button>
                  )}
                </div>

                {/* Thông tin sản phẩm bên dưới: Ẩn mặc định, hiển thị khi hover */}
                <div className="pt-2 sm:pt-3 flex flex-col justify-start bg-transparent text-left min-h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-neutral-900 hover:underline line-clamp-1"
                    title={currentItem.name}
                  >
                    {currentItem.name.toUpperCase()}
                  </Link>
                  <span className="mt-1 text-xs sm:text-[13px] font-semibold tracking-tight text-neutral-900">
                    {formatVND(currentItem.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút "VIEW MORE" in hoa với khung viền mảnh bao quanh */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Link
            to="/shop?category=SET"
            className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-2.5 sm:py-3 border border-neutral-300 hover:border-black text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-900 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer"
          >
            <span>{t('home.viewMore')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 3: EDITORIAL CAMPAIGN CAROUSEL
          - Full chiều ngang màn hình (w-full edge-to-edge)
          - Chiều cao khống chế theo viewport (max-h-[600px]) vừa vặn màn hình
          - Tự động lướt ngang mượt mà (Sliding track animation)
          - Bộ điều khiển ChevronLeft/Right nổi và thanh gạch phân trang
          ========================================================================= */}
      <section className="w-full py-0 my-0 bg-white overflow-hidden">
        {/* Khung hiển thị Slide Campaign FULL CHIỀU NGANG MÀN HÌNH (w-full) & KHỐNG CHẾ CHIỀU CAO VỪA MÀN HÌNH */}
        <div className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100vh-122px)] min-h-[500px] max-h-[920px] bg-neutral-950 overflow-hidden">
          {/* Dải trượt ngang (Sliding Track) */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="relative w-full h-full shrink-0 overflow-hidden"
              >
                {/* Ảnh slide chiến dịch: Căn object-top / center_top để hiển thị trọn vẹn gương mặt người mẫu */}
                <img
                  src={slide.image}
                  alt={slide.name || 'Campaign Look'}
                  className="w-full h-full object-cover object-top sm:object-[center_top] select-none"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                {/* Lớp phủ gradient Brutalist tinh tế */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-transparent pointer-events-none" />

                {/* Nội dung chữ trên Slide căn chỉnh theo grid */}
                <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-7 sm:pb-8 lg:pb-10 pt-4 z-20 text-white pointer-events-none">
                  <div className="max-w-[1560px] w-full mx-auto">
                    <div className="max-w-xl pointer-events-auto">
                      <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                        <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/10 backdrop-blur-md border border-white/20">
                          {slide.code}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono tracking-widest text-neutral-400 uppercase">
                          AESPA × FASHORA
                        </span>
                      </div>

                      <h4 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none drop-shadow-md">
                        {slide.name}
                      </h4>

                      <p className="text-xs sm:text-sm font-mono tracking-widest text-neutral-300 uppercase mb-3 sm:mb-5">
                        {t(`home.carousel.${slide.id}`, slide.tagline)}
                      </p>

                      <Link
                        to={slide.link || '/shop'}
                        className="inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors duration-200 shadow-lg cursor-pointer"
                      >
                        <span>{t('home.exploreLookbook')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nút mũi tên lơ lửng 2 bên mép full màn hình */}
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Thanh gạch phân trang ở đáy full banner */}
          <div className="absolute bottom-3 sm:bottom-5 right-6 sm:right-12 z-30 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1 sm:h-1.5 transition-all duration-300 cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 sm:w-12 bg-white'
                    : 'w-3 sm:w-4 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 3.5: ATELIER SPOTLIGHT CAROUSEL (QUẢNG BÁ ATELIER CÓ ẢNH BÌA COVER)
          - Full chiều ngang màn hình (w-full edge-to-edge) chuẩn như Campaign Carousel ở trên
          - Tỷ lệ 16:9 đồng bộ, trượt ngang mượt mà (Sliding track animation)
          - Hiển thị trực tiếp ảnh bìa do Seller đăng tải lên Seller Center
          - Nằm ngay dưới Campaign Carousel và trước Complete The Look
          ========================================================================= */}
      {featuredShops.length > 0 && (
        <section className="w-full py-0 mt-6 sm:mt-10 mb-0 bg-white overflow-hidden">
          {/* Khung Carousel FULL CHIỀU NGANG MÀN HÌNH (w-full edge-to-edge) & KHỐNG CHẾ CHIỀU CAO VỪA MÀN HÌNH */}
          <div className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100vh-122px)] min-h-[500px] max-h-[920px] bg-neutral-950 overflow-hidden">
            {/* Dải trượt ngang (Sliding Track) */}
            <div
              className="flex w-full h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentShopSlide * 100}%)` }}
            >
              {featuredShops.map((shopItem, idx) => {
                const shopSlug = shopItem.slug || shopItem.id;
                const isShopFollowed = isFollowing(shopItem.id || shopSlug, shopItem);
                return (
                  <div
                    key={shopItem.id || idx}
                    className="relative w-full h-full shrink-0 overflow-hidden"
                  >
                    {/* Ảnh bìa Cover của Shop: Căn object-top / center_top để hiển thị trọn vẹn chi tiết bên trên */}
                    <img
                      src={shopItem.coverImage}
                      alt={shopItem.name}
                      className="w-full h-full object-cover object-top sm:object-[center_top] select-none"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Lớp gradient Cinematic Brutalist tối màu tạo độ tương phản */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Nội dung chữ trên Slide căn chỉnh theo grid max-w-[1560px] */}
                    <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-7 sm:pb-8 lg:pb-10 pt-4 z-20 text-white pointer-events-none">
                      <div className="max-w-[1560px] w-full mx-auto">
                        <div className="max-w-xl pointer-events-auto">
                          <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                            {/* Logo shop */}
                            {shopItem.logo ? (
                              <img
                                src={shopItem.logo}
                                alt={shopItem.name}
                                className="w-7 h-7 sm:w-9 sm:h-9 object-cover border border-white/20 bg-black/60 backdrop-blur-sm shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white text-black font-black font-serif flex items-center justify-center shrink-0 text-xs sm:text-sm">
                                {shopItem.name?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                            )}

                            <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-emerald-400 uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40">
                              {t('home.verifiedAtelier')}
                            </span>
                            {shopItem.category && (
                              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-neutral-300 uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/10 backdrop-blur-md border border-white/20">
                                {shopItem.category}
                              </span>
                            )}
                          </div>

                          {/* Tên Shop */}
                          <h4 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-1.5 sm:mb-2 leading-none drop-shadow-md">
                            {shopItem.name}
                          </h4>

                          {/* Tagline / Mô tả */}
                          <p className="text-xs sm:text-sm font-mono tracking-widest text-neutral-300 uppercase mb-3 sm:mb-5 line-clamp-2">
                            {shopItem.tagline || shopItem.description || 'CONTEMPORARY FASHION ATELIER'}
                          </p>

                          {/* Cụm nút hành động */}
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={(e) => handleFollowToggle(shopItem, e)}
                              disabled={isFollowUpdating}
                              className={`inline-flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-48 h-11 sm:h-12 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 shadow-lg cursor-pointer backdrop-blur-md border ${
                                isShopFollowed
                                  ? 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/60'
                                  : 'bg-white/10 hover:bg-white/20 text-white border-white/40 hover:border-white'
                              }`}
                              title={isShopFollowed ? 'Click to unfollow atelier' : 'Click to follow this atelier'}
                            >
                              {isShopFollowed ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{t('product.following', 'FOLLOWING')}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{t('product.follow', 'FOLLOW')}</span>
                                </>
                              )}
                            </button>

                            <Link
                              to={`/store/${shopSlug}`}
                              className="inline-flex items-center justify-center gap-2.5 flex-1 sm:flex-none sm:w-48 h-11 sm:h-12 px-4 bg-white text-black text-xs font-bold uppercase tracking-widest whitespace-nowrap hover:bg-neutral-200 transition-colors duration-200 shadow-lg cursor-pointer border border-white group"
                            >
                              <span>{t('home.visitAtelier')}</span>
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút mũi tên lơ lửng 2 bên mép full màn hình */}
            {featuredShops.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevShopSlide}
                  aria-label="Previous Atelier"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextShopSlide}
                  aria-label="Next Atelier"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Thanh gạch phân trang ở đáy full banner */}
                <div className="absolute bottom-3 sm:bottom-5 right-6 sm:right-12 z-30 flex items-center gap-2">
                  {featuredShops.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentShopSlide(idx)}
                      aria-label={`Go to atelier slide ${idx + 1}`}
                      className={`h-1 sm:h-1.5 transition-all duration-300 cursor-pointer ${
                        currentShopSlide === idx
                          ? 'w-8 sm:w-12 bg-white'
                          : 'w-3 sm:w-4 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          KHỐI 4: COMPLETE THE LOOK (Thay thế mục Best Sellers trước đây)
          - Tích hợp trực tiếp component CompleteTheLook
          - Kết nối callback onQuickAdd để mở QuickAddModal mượt mà
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 pb-10 sm:pb-16">
        <CompleteTheLook
          onQuickAdd={handleOpenQuickAdd}
          viewAllLink="/shop"
          className="mt-4 sm:mt-6 pt-2"
        />
      </section>

      {/* =========================================================================
          KHỐI 5: TOAST & QUICK ADD MODAL
          - QuickAddModal: Chọn biến thể (Màu, Size, Số lượng) và thêm vào giỏ
          - Toast: Thông báo tức thì góc dưới màn hình chuẩn Atelier
          ========================================================================= */}
      <QuickAddModal
        key={quickAddProduct?.id || 'quick-add-modal'}
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