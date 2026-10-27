import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { getProducts, getShops } from '../../services/api';
import QuickAddModal from '../../components/product/QuickAddModal';
import { Toast } from '../../components/common';
import { useCartStore } from '../../stores';
import dbData from '../../../db.json';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';

// Định dạng tiền tệ VND
const formatVND = (val) =>
  new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + '₫';

// =========================================================================
// DATA NỘI DUNG 6 PHONG CÁCH THỜI TRANG (KHỐI 2) TRỰC TIẾP TRONG GIAO DIỆN
// =========================================================================
const EDITORIAL_STORIES = {
  prd_set_01: {
    styleName: 'QUIET STRUCTURE',
    desc: 'Inspired by ceremonial 19th-century naval regalia deconstructed through a brutalist lens. Strict symmetry meets modern utilitarian proportions.'
  },
  prd_set_02: {
    styleName: 'MODERN UTILITY',
    desc: 'A collision of 1970s cafe racer subculture and neo-cyberpunk denim workwear. Rugged abrasion patterns meet precision diamond quilting.'
  },
  prd_set_03: {
    styleName: 'SOFT MINIMAL',
    desc: 'Tonal exploration of thermal contrasts: cold cracked vintage leather outer shell enveloped in warmth by plush shearling and wool cabling.'
  },
  prd_set_04: {
    styleName: 'TAILORED EASE',
    desc: 'Deconstructed Americana workwear elevated into high fashion. Layered trompe-l’œil collars challenge conventional garment anatomy.'
  },
  prd_set_05: {
    styleName: 'URBAN FORM',
    desc: 'Brutalist monolith aesthetics translated into stark monochromatic white and black. Funnel collar shields the face like a high-tech fortress.'
  },
  prd_set_06: {
    styleName: 'EVERYDAY MINIMAL',
    desc: 'Elevating daily uniform dressing through unexpected material alchemy: heavy ribbed colorblock knit contrasted against sleek vegan leather trousers.'
  }
};

// =========================================================================
// DATA CẤU HÌNH GỢI Ý 3 MÓN PHỐI THEO 6 MOODS (KHỐI 3) TRỰC TIẾP TRONG GIAO DIỆN
// =========================================================================
const MOOD_LOOKS = [
  {
    id: 'QUIET_STRUCTURE',
    label: 'QUIET STRUCTURE',
    tagline: 'Architectural lines and disciplined tailoring.',
    productIds: ['prd_set_01', 'prd_acc_01', 'prd_shoes_01']
  },
  {
    id: 'MODERN_UTILITY',
    label: 'MODERN UTILITY',
    tagline: 'Ergonomic techwear and rugged industrial elements.',
    productIds: ['prd_shirt_02', 'prd_pants_02', 'prd_shoes_02']
  },
  {
    id: 'SOFT_MINIMAL',
    label: 'SOFT MINIMAL',
    tagline: 'Cohesive textures, warm shearling, and fluid knitwear.',
    productIds: ['prd_set_03', 'prd_acc_03', 'prd_shoes_03']
  },
  {
    id: 'TAILORED_EASE',
    label: 'TAILORED EASE',
    tagline: 'Nonchalant oversized proportions and vintage washed denim.',
    productIds: ['prd_shirt_01', 'prd_pants_01', 'prd_acc_04']
  },
  {
    id: 'URBAN_FORM',
    label: 'URBAN FORM',
    tagline: 'Futuristic monochrome silhouette and functional zip tracks.',
    productIds: ['prd_set_05', 'prd_pants_05', 'prd_shoes_05']
  },
  {
    id: 'EVERYDAY_MINIMAL',
    label: 'EVERYDAY MINIMAL',
    tagline: 'Refined essential geometry and clean understated cuts.',
    productIds: ['prd_set_06', 'prd_shoes_06', 'prd_acc_06']
  }
];

// Dữ liệu dự phòng 6 Set chính chuẩn db.json
const DEFAULT_SETS = [
  {
    id: 'prd_set_01',
    name: 'Military Officer Jacket & Shorts Set',
    category: 'SET',
    price: 1250000,
    originalPrice: 1450000,
    images: ['/images/products/set/set-01.jpg', '/images/products/set/set-01-hover.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    stock: 12
  },
  {
    id: 'prd_set_02',
    name: 'Quilted Biker Jacket & Flare Denim Set',
    category: 'SET',
    price: 1480000,
    originalPrice: 1750000,
    images: ['/images/products/set/set-02.jpg', '/images/products/set/set-02-hover.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Washed Black'],
    stock: 9
  },
  {
    id: 'prd_set_03',
    name: 'Shearling Leather Jacket & Cable Knit Skirt Set',
    category: 'SET',
    price: 1590000,
    originalPrice: null,
    images: ['/images/products/set/set-03.jpg', '/images/products/set/set-03-hover.jpg'],
    sizes: ['S', 'M'],
    colors: ['Espresso Brown / Navy'],
    stock: 7
  },
  {
    id: 'prd_set_04',
    name: 'Double Collar Denim Jacket & Baggy Jeans Set',
    category: 'SET',
    price: 1350000,
    originalPrice: 1600000,
    images: ['/images/products/set/set-04.jpg', '/images/products/set/set-04-hover.jpg'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Vintage Indigo Wash'],
    stock: 14
  },
  {
    id: 'prd_set_05',
    name: 'Architectural Funnel Leather Jacket & Zip Pants Set',
    category: 'SET',
    price: 1680000,
    originalPrice: null,
    images: ['/images/products/set/set-05.jpg', '/images/products/set/set-05-hover.jpg'],
    sizes: ['M', 'L'],
    colors: ['Stark White / Black'],
    stock: 6
  },
  {
    id: 'prd_set_06',
    name: 'Colorblock Buckled Cardigan & Leather Pants Set',
    category: 'SET',
    price: 1390000,
    originalPrice: 1650000,
    images: ['/images/products/set/set-06.jpg', '/images/products/set/set-06-hover.jpg'],
    sizes: ['M', 'L'],
    colors: ['Multi / Dark Charcoal'],
    stock: 11
  }
];

export default function Explore() {
  const [allProducts, setAllProducts] = useState(dbData?.products || DEFAULT_SETS);
  const [shops, setShops] = useState(dbData?.shops || []);
  const [selectedMoodId, setSelectedMoodId] = useState('QUIET_STRUCTURE');
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const addToCartStore = useCartStore((state) => state.addToCart);

  // Tải danh sách sản phẩm và shops từ API / db.json
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getProducts();
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (isMounted && data.length > 0) {
          setAllProducts(data);
        } else if (isMounted) {
          setAllProducts(dbData?.products || DEFAULT_SETS);
        }
      } catch (err) {
        console.error('Unable to load products for Explore:', err);
        if (isMounted) setAllProducts(dbData?.products || DEFAULT_SETS);
      }

      try {
        const sRes = await getShops();
        const sData = Array.isArray(sRes?.data) ? sRes.data : [];
        if (isMounted && sData.length > 0) {
          setShops(sData);
        } else if (isMounted && dbData?.shops) {
          setShops(dbData.shops);
        }
      } catch (sErr) {
        console.warn('Unable to load shops for Explore:', sErr);
        if (isMounted && dbData?.shops) setShops(dbData.shops);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh sách các Shop đang hoạt động
  const activeShops = useMemo(() => {
    const list = Array.isArray(shops) ? shops.filter((s) => s.status === 'ACTIVE' || !s.status) : [];
    return list.length > 0 ? list : (dbData?.shops || []);
  }, [shops]);

  // Tạo danh sách lặp vô tận (nhân bản mảng 3 lần = 15 items cho 5 shop, sau đó nhân đôi tạo 2 nửa liền mạch)
  const marqueeItems = useMemo(() => {
    if (activeShops.length === 0) return [];
    const setA = [...activeShops, ...activeShops, ...activeShops];
    return [...setA, ...setA];
  }, [activeShops]);

  // 6 bộ Set cho Khối 2: "WHAT IS FASHION RIGHT NOW?"
  const sixSetProducts = useMemo(() => {
    const sets = allProducts.filter((p) => p.category === 'SET');
    if (sets.length >= 6) return sets.slice(0, 6);
    return DEFAULT_SETS;
  }, [allProducts]);

  // Bộ 3 món theo Mood cho Khối 3: "CHOOSE A MOOD"
  const currentMoodLook = useMemo(() => {
    const config = MOOD_LOOKS.find((m) => m.id === selectedMoodId) || MOOD_LOOKS[0];
    const products = config.productIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean);

    // Dự phòng nếu API chưa tải đủ sản phẩm
    if (products.length < 3) {
      return {
        ...config,
        products: sixSetProducts.slice(0, 3)
      };
    }

    return {
      ...config,
      products
    };
  }, [selectedMoodId, allProducts, sixSetProducts]);

  // 5 Hàng Ngang cho Khối 4 (mỗi hàng 6 sản phẩm)
  const fiveRowsData = useMemo(() => {
    const categories = [
      { key: 'SET', label: '01 / SET' },
      { key: 'SHIRT', label: '02 / SHIRT' },
      { key: 'PANTS', label: '03 / PANTS' },
      { key: 'SHOES', label: '04 / SHOES' },
      { key: 'ACCESSORIES', label: '05 / ACCESSORIES' }
    ];

    return categories.map((cat) => {
      let items = allProducts.filter((p) => p.category === cat.key);
      if (items.length < 6 && cat.key === 'SET') {
        items = DEFAULT_SETS;
      }
      return {
        categoryKey: cat.key,
        label: cat.label,
        items: items.slice(0, 6)
      };
    });
  }, [allProducts]);

  // Mở modal Quick Add
  const handleOpenQuickAdd = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuickAddProduct(product);
  };

  // Xác nhận thêm sản phẩm vào giỏ từ QuickAddModal
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
    <div className="w-full bg-white text-black min-h-screen">
      {/* =========================================================================
          KHỐI 1: HERO VIDEO GIỚI THIỆU
          - Video nền: public/images/banner/hero-banner-video.mp4
          - Thuộc tính: autoPlay loop muted playsInline, phủ kín không méo
          - Overlay mờ vừa phải, Typography Brutalist tinh tế
          - Nút CTA: [ GO TO FASHORA PLATFORM -> ] (điều hướng về '/')
          ========================================================================= */}
      <section className="relative w-full h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden bg-black flex flex-col justify-end">
        <video
          src="/images/banner/hero-banner-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none contrast-[1.04] brightness-[1.02]"
        />

        {/* Lớp phủ gradient tối dần về phía góc dưới giúp text sắc nét mà video ở trung tâm hoàn toàn thông thoáng */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Khối nội dung nổi căn góc dưới bên trái */}
        <div className="relative z-10 w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 lg:pb-20 text-left text-white flex flex-col items-start">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[0.95] mb-3 sm:mb-4 drop-shadow-md text-white">
              EXPLORE THE WORLD OF FASHION
            </h1>

            <p className="text-xs sm:text-sm lg:text-base font-light tracking-[0.16em] text-neutral-200 uppercase mb-6 sm:mb-8 drop-shadow">
              Discover trends, stories, styles, and pieces from FASHORA.
            </p>

            <Link
              to="/home"
              className="inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 bg-white text-black text-xs font-bold uppercase tracking-[0.22em] hover:bg-neutral-200 transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>GO TO FASHORA PLATFORM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 2: "WHAT IS FASHION RIGHT NOW?" (6 Phong Cách Thời Trang)
          - Hiển thị 6 Set sản phẩm (prd_set_01 -> prd_set_06)
          - Bố cục so le (Alternating):
            * Style lẻ (1, 3, 5): Cột trái thông tin; cột phải 2 ảnh (images[0], images[1])
            * Style chẵn (2, 4, 6): Cột trái 2 ảnh; cột phải thông tin
          - Nút [ READ EDITORIAL STORY & PIECES ] -> chuyển sang /explore/story/:id
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div className="text-left max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-neutral-900 mb-4">
            WHAT IS FASHION RIGHT NOW?
          </h2>
        </div>

        <div className="space-y-24 sm:space-y-32">
          {sixSetProducts.map((product, idx) => {
            if (!product) return null;
            const story = EDITORIAL_STORIES[product.id] || EDITORIAL_STORIES.prd_set_01;
            const isEven = idx % 2 === 1; // Style 2, 4, 6 (index 1, 3, 5) -> Đảo cột
            const imgPrimary = product.images?.[0] || FALLBACK_IMAGE;
            const imgSecondary = product.images?.[1] || product.images?.[0] || FALLBACK_IMAGE;

            // Khối thông tin văn bản
            const TextColumn = (
              <div className="w-full lg:w-1/2 flex flex-col justify-center px-2 sm:px-6">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-950 mb-2">
                  {story.styleName}
                </h3>

                <h4 className="text-sm sm:text-base font-semibold text-neutral-700 uppercase tracking-wider mb-4">
                  {product.name}
                </h4>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light mb-6 tracking-wide">
                  {story.desc || product.description}
                </p>

                <div className="pt-2">
                  <Link
                    to={`/explore/story/${product.id}`}
                    className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <span>READ EDITORIAL STORY & PIECES</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );

            // Khối 2 ảnh của Set
            const ImageColumn = (
              <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200">
                  <img
                    src={imgPrimary}
                    alt={`${product.name} Front`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono tracking-widest text-neutral-700 bg-white/90 px-2 py-0.5 uppercase border border-neutral-200">
                    LOOK A
                  </span>
                </div>

                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200">
                  <img
                    src={imgSecondary}
                    alt={`${product.name} Alternate`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono tracking-widest text-neutral-700 bg-white/90 px-2 py-0.5 uppercase border border-neutral-200">
                    LOOK B
                  </span>
                </div>
              </div>
            );

            return (
              <div
                key={product.id || idx}
                className={`flex flex-col gap-10 lg:gap-16 items-center ${
                  isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                {/* Khi isEven = true: Cột ảnh nằm bên trái, Cột thông tin nằm bên phải */}
                {isEven ? (
                  <>
                    {TextColumn}
                    {ImageColumn}
                  </>
                ) : (
                  <>
                    {TextColumn}
                    {ImageColumn}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          KHỐI 3: "DON'T KNOW WHAT TO WEAR? CHOOSE A MOOD"
          - Thanh 6 tab phong cách: QUIET STRUCTURE, MODERN UTILITY, SOFT MINIMAL,
            TAILORED EASE, URBAN FORM, CYBER RUNWAY
          - Render gợi ý 3 sản phẩm phối hợp (Trio Look: áo + quần + giày/phụ kiện)
          - Card sản phẩm: ảnh, tên in hoa, giá VND, nút tròn '+' QuickAddModal
          - Khách vãng lai chưa đăng nhập vẫn bấm thêm giỏ hàng được
          ========================================================================= */}
      <section className="bg-[#111111] text-white border-y border-neutral-800 py-16 sm:py-24">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-3">
              DON&apos;T KNOW WHAT TO WEAR? CHOOSE A MOOD
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 tracking-wider uppercase font-light">
              Select your aesthetic frequency. We assemble the complete silhouette for you.
            </p>
          </div>

          {/* Thanh 6 Tab Moods */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            {MOOD_LOOKS.map((mood) => {
              const isActive = selectedMoodId === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(mood.id)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-[0.18em] transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>

          {/* Grid 3 sản phẩm phối hợp (Trio Look) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {currentMoodLook?.products?.map((item, itemIdx) => {
              if (!item) return null;
              const primaryImg = item.images?.[0] || FALLBACK_IMAGE;
              const secondaryImg = item.images?.[1] || primaryImg;
              const hasHover = item.images && item.images.length > 1;

              return (
                <div
                  key={item.id || itemIdx}
                  className="group bg-[#161616] border border-neutral-800 flex flex-col justify-between overflow-hidden shadow-sm hover:border-neutral-600 transition-all"
                >
                  {/* Container Ảnh Sản Phẩm */}
                  <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                    <Link to={`/products/${item.id}`} className="block w-full h-full">
                      {/* Ảnh chính */}
                      <img
                        src={primaryImg}
                        alt={item.name}
                        className={`w-full h-full object-cover object-center transition-all duration-500 ${
                          hasHover ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />
                      {/* Ảnh phụ hiển thị khi hover */}
                      {hasHover && (
                        <img
                          src={secondaryImg}
                          alt={`${item.name} Alternate`}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                          loading="lazy"
                        />
                      )}
                    </Link>

                    {/* Nút tròn Quick Add (+) */}
                    <button
                      type="button"
                      aria-label="Quick add to cart"
                      onClick={(e) => handleOpenQuickAdd(item, e)}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-all hover:scale-110 shadow-md cursor-pointer z-10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="block text-xs font-bold uppercase tracking-wider text-white hover:text-neutral-400 transition-colors line-clamp-1 mb-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
                        {item.shopName || 'M STUDIO'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-xs font-bold font-mono tracking-wider text-white">
                        {formatVND(item.price)}
                      </span>
                      {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                        <span className="text-[11px] font-mono text-neutral-500 line-through">
                          {formatVND(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 4: LƯỚI 5 HÀNG NGANG SẢN PHẨM & NÚT VIEW MORE DUY NHẤT Ở ĐÁY
          - 5 hàng ngang, mỗi hàng 6 sản phẩm lấy từ db.json:
            * Hàng 1: SET (Set 01 - 06)
            * Hàng 2: SHIRT (Shirt 01 - 06)
            * Hàng 3: PANTS (Pants 01 - 06)
            * Hàng 4: SHOES (Shoes 01 - 06)
            * Hàng 5: ACCESSORIES (Acc 01 - 06)
          - Card sản phẩm: Mặc định hiện ảnh chính, hover chuyển sang ảnh phụ (*-hover.jpg)
            kèm tên và giá bên dưới. Có nút tròn '+' Quick Add.
          - DUY NHẤT 1 nút VIEW MORE -> ở đáy của cả 5 hàng ngang dẫn sang /shop.
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div className="text-left mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-neutral-900">
            ARCHITECTURAL ATELIER EDITIONS
          </h2>
        </div>

        {/* 5 Hàng Ngang */}
        <div className="space-y-16 sm:space-y-20">
          {fiveRowsData.map((row, rowIdx) => (
            <div key={row.categoryKey || rowIdx} className="space-y-6">
              {/* Tiêu đề Hàng */}
              <div className="pb-3 border-b border-neutral-200">
                <h3 className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] uppercase text-neutral-900">
                  {row.label}
                </h3>
              </div>

              {/* Lưới 6 sản phẩm trên hàng (Responsive: 2 cột mobile, 3 cột tablet, 6 cột desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {row.items?.map((prod, prodIdx) => {
                  if (!prod) return null;
                  const mainImage = prod.images?.[0] || FALLBACK_IMAGE;
                  const hoverImage = prod.images?.[1] || mainImage;
                  const canCrossfade = prod.images && prod.images.length > 1;

                  return (
                    <div
                      key={prod.id || prodIdx}
                      className="group flex flex-col justify-start bg-transparent"
                    >
                      {/* Thẻ Ảnh với hiệu ứng Hover Crossfade */}
                      <div className={`relative aspect-[3/4] overflow-hidden ${row.categoryKey === 'SHIRT' ? 'bg-white' : 'bg-neutral-100'}`}>
                        <Link to={`/products/${prod.id}`} className="block w-full h-full">
                          {/* Ảnh chính */}
                          <img
                            src={mainImage}
                            alt={prod.name}
                            className={`w-full h-full object-cover object-center transition-all duration-500 ${
                              canCrossfade ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                            }`}
                            loading="lazy"
                          />

                          {/* Ảnh phụ chuyển mượt khi hover */}
                          {canCrossfade && (
                            <img
                              src={hoverImage}
                              alt={`${prod.name} Alternate`}
                              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                              loading="lazy"
                            />
                          )}
                        </Link>

                        {/* Nút tròn Quick Add (+) chỉ hiện khi hover */}
                        <button
                          type="button"
                          aria-label="Quick add to cart"
                          onClick={(e) => handleOpenQuickAdd(prod, e)}
                          className="absolute bottom-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-105 shadow-md cursor-pointer z-10 pointer-events-none group-hover:pointer-events-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Tên và Giá phía dưới: ẩn mặc định, khi lia chuột vô sẽ hiện cả tên và giá lên mượt mà */}
                      <div className="pt-2 sm:pt-2.5 min-h-[44px] flex flex-col transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <Link
                          to={`/products/${prod.id}`}
                          className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                        >
                          {prod.name}
                        </Link>

                        <div className="h-5 flex items-center pt-0.5">
                          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-tight text-neutral-950">
                            {formatVND(prod.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* NÚT VIEW MORE DUY NHẤT Ở PHÍA DƯỚI CÙNG CỦA CẢ 5 HÀNG NGANG */}
        <div className="mt-16 sm:mt-24 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-4 px-10 sm:px-14 py-4 sm:py-4.5 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all duration-300 shadow-lg hover:gap-6"
          >
            <span>VIEW MORE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 4.5: DIRECTORY OF REGISTERED ATELIERS (MARQUEE KHÁM PHÁ CÁC SHOP)
          - Hiển thị danh sách các shop đã đăng ký trên sàn (M STUDIO, enire, SMOKER, #SWAG, L'OBSCUR ATELIER)
          - Avatar tròn, dàn hàng ngang chuyển động mượt mà từ trái sang phải
          - Tự động dừng khi rê chuột (pause on hover)
          - Bấm vào sẽ chuyển hướng sang trang Public Shop (/store/:slug)
          ========================================================================= */}
      <section className="bg-neutral-50/80 border-t border-neutral-200 py-12 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111111]">
            REGISTERED ATELIERS &amp; STUDIOS
          </h3>
        </div>

        {/* Marquee Container with Gradient Edge Masks */}
        <div className="relative w-full overflow-hidden select-none">
          {/* Fade mask left */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-neutral-50 via-neutral-50/70 to-transparent z-10" />
          {/* Fade mask right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-neutral-50 via-neutral-50/70 to-transparent z-10" />

          {/* Marquee Track (Smooth Left-to-Right) */}
          <div className="animate-marquee-ltr py-2 flex items-center">
            {marqueeItems.map((shop, idx) => {
              const shopSlug = shop.slug || shop.id;
              return (
                <Link
                  key={`${shop.id || shopSlug}-${idx}`}
                  to={`/store/${shopSlug}`}
                  className="flex flex-col items-center gap-2.5 px-6 sm:px-8 py-2 group cursor-pointer shrink-0 transition-transform duration-200 hover:scale-105"
                  title={`Visit ${shop.name} Atelier`}
                >
                  {/* Circular Avatar Badge */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-neutral-300 group-hover:border-black bg-white overflow-hidden shadow-xs flex items-center justify-center transition-all duration-300">
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-black text-white font-mono text-base sm:text-lg font-bold uppercase ${
                        shop.logo ? 'hidden' : 'flex'
                      }`}
                    >
                      {shop.name ? shop.name.charAt(0) : 'A'}
                    </div>
                  </div>

                  {/* Shop Name Only */}
                  <div className="text-center max-w-[120px] sm:max-w-[140px]">
                    <span className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-black group-hover:underline truncate">
                      {shop.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHỐI 5: BANNER KẾT TRANG
          - Khối nền đen toàn phần: bg-[#111111]
          - Tiêu đề: YOU'VE EXPLORED. NOW, MAKE IT YOURS.
          - Mô tả về các xưởng thiết kế độc lập.
          - Nút: [ GO TO FASHORA PLATFORM -> ] (chuyển về '/')
          ========================================================================= */}
      <section className="bg-[#111111] text-white py-20 sm:py-28 px-6 sm:px-12 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-neutral-400 mb-3 block">
            THE ARCHIVE CONCLUDES
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-tight">
            YOU&apos;VE EXPLORED. NOW, MAKE IT YOURS.
          </h2>

          <p className="text-xs sm:text-sm lg:text-base font-light tracking-wide text-neutral-300 leading-relaxed max-w-2xl mb-10">
            FASHORA connects you directly with independent design ateliers worldwide. 
            Every garment is produced in small, conscientious batches—honoring structural integrity, 
            ethical craftsmanship, and the enduring philosophy of avant-garde permanence.
          </p>

          <Link
            to="/home"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 border border-white text-white text-xs font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all duration-300"
          >
            <span>GO TO FASHORA PLATFORM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Add Modal & Toast Notification */}
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