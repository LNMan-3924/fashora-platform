import { COMMERCE_STORAGE_KEYS } from '../../constants'
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  ShieldCheck
} from 'lucide-react'

// Import Zustand Store & Auth
import { useCartStore } from '../../stores'
import { useAuth } from '../../contexts/AuthContext'

// Import API kết nối db.json
import { getProductById, getShopById } from '../../services/api'

// Import các component dùng chung đã có sẵn trong dự án
import { Toast } from '../../components/common'
import { CompleteTheLook, QuickAddModal } from '../../components/product'

// Import component bảng size
import SizeMatrixModal from '../../components/product/SizeMatrixModal'
import { toShopSlug } from '../../constants/commerce'
import { safeBack } from '../../utils'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Zustand Actions
  const addToCart = useCartStore((state) => state.addToCart)

  // State dữ liệu sản phẩm
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isShopPaused, setIsShopPaused] = useState(false)
  const [shopSlug, setShopSlug] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // State lựa chọn biến thể
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  // State tương tác UI
  const [activeTab, setActiveTab] = useState('DETAILS')
  const [toastMessage, setToastMessage] = useState('')
  const [quickAddProduct, setQuickAddProduct] = useState(null)
  const [showSizeModal, setShowSizeModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Nhận diện loại sản phẩm dựa vào product.category / categorySlug / type
  const getProductCategoryType = () => {
    if (!product) return 'shirt'
    const cat = String(product.category || product.categorySlug || product.type || '').toLowerCase().trim()

    // 1. Phụ kiện: Ẩn bảng size
    if (cat.includes('access')) return 'accessories'

    // 2. Set đồ
    if (cat.includes('set')) return 'set'

    // 3. Giày dép
    if (cat.includes('shoe') || cat.includes('footwear') || cat.includes('boot')) return 'shoes'

    // 4. Quần / Váy
    if (cat.includes('pant') || cat.includes('trouser') || cat.includes('bottom') || cat.includes('skirt')) return 'pants'

    // 5. Mặc định là Áo
    return 'shirt'
  }

  const categoryType = getProductCategoryType()

  // Tự động cuộn lên đầu trang khi mở trang hoặc chuyển sản phẩm
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  // Gọi API lấy dữ liệu sản phẩm khi mở trang
  useEffect(() => {
    let isMounted = true

    getProductById(id || 1)
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res

        // Đảm bảo dữ liệu luôn đầy đủ cấu trúc chuẩn
        const formattedData = {
          ...data,
          images: Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : [data.image || '/assets/fallback.png'],
          colors: Array.isArray(data.colors) && data.colors.length > 0
            ? data.colors
            : ['#FFFFFF', '#111111', '#666666'],
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0
            ? data.sizes
            : ['XS', 'S', 'M', 'L'],
          stock: data.stock ?? 12,
          shopName: data.shopName || 'M STUDIO',
        }

        setProduct(formattedData)
        setSelectedColor(formattedData.colors[0] || 'PURE WHITE')
        setSelectedSize(formattedData.sizes[2] || formattedData.sizes[0] || 'M')
        setQuantity(1)
        setCurrentImageIndex(0)

        if (data.shopId) {
          getShopById(data.shopId)
            .then((sRes) => {
              const s = sRes?.data || sRes
              if (s && isMounted) {
                if (s.slug) setShopSlug(s.slug)
                if (s.status === 'PAUSED') setIsShopPaused(true)
              }
            })
            .catch(() => {})
        }
      })
      .catch((err) => {
        console.error('Error loading product:', err)
        setProduct({
          id: id || 'prd_shirt_01',
          name: 'CROPPED SATIN STRUCTURAL SHIRT',
          category: 'shirt',
          catalogRef: 'SHIRT.01.ARCHIVE',
          shopName: 'M STUDIO',
          price: 420000,
          stock: 12,
          description:
            'Formulated with high-density Italian triacetate satin drape. This cropped archetype integrates razor-cut architectural lapels, dropped geometric shoulders, and modular brushed alloy harness buckles engineered for dual silhouette transformations.',
          images: [
            '/assets/fallback.png',
            '/assets/fallback.png',
          ],
          colors: ['#FFFFFF', '#111111', '#666666'],
          sizes: ['XS', 'S', 'M', 'L'],
        })
        setSelectedColor('#FFFFFF')
        setSelectedSize('M')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Tính tổng tiền theo số lượng
  const totalAmount = useMemo(() => {
    if (!product) return 0
    return (product.price || 0) * quantity
  }, [product, quantity])

  // Xử lý tăng / giảm số lượng
  const handleIncrease = () => {
    if (!product) return
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    } else {
      showToast(`Only ${product.stock} items remaining in stock!`)
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!product) return
    if (isShopPaused) {
      showToast("Atelier paused: This store is currently suspended and not accepting orders.")
      return
    }
    const result = addToCart(product, selectedSize, selectedColor, quantity)
    if (result?.success === false) {
      showToast(result.message)
    } else {
      showToast(`ADDED ${product.name.toUpperCase()} TO CART.`)
    }
  }

  // Mua ngay (BUY NOW)
  const handleBuyNow = () => {
    if (!product) return
    if (isShopPaused) {
      showToast("Atelier paused: This store is currently suspended and not accepting orders.")
      return
    }

    addToCart(product, selectedSize, selectedColor, quantity)

    const buyNowItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    }

    try {
      sessionStorage.setItem(COMMERCE_STORAGE_KEYS.CHECKOUT_ITEMS, JSON.stringify([buyNowItem]))
    } catch {
      // ignore
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/checkout' },
          selectedItems: [buyNowItem],
        },
      })
    } else {
      navigate('/checkout', {
        state: { selectedItems: [buyNowItem] },
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center font-mono text-xs tracking-widest text-neutral-400 uppercase">
        LOADING ARCHIVE SPECIFICATION...
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[#111111]">
      {/* Nút Back quay lại trang trước */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => safeBack(navigate, '/explore')}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      {/* 1. KHUNG NỘI DUNG CHÍNH (GALLERY & DETAILS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">

        {/* === CỘT TRÁI (7 CỘT): GALLERY ẢNH === */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start">
          {/* Cột Thumbnails nhỏ */}
          <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 bg-neutral-100 border p-1 transition-all ${
                  currentImageIndex === idx
                    ? 'border-[#111111] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Khung Ảnh Lớn Chính Giữa */}
          <div className="relative w-full aspect-[4/5] bg-[#F5F5F5] border border-neutral-200 order-1 sm:order-2 overflow-hidden group">
            <img
              src={product.images[currentImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Nút lùi / tiến ảnh */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-neutral-200 shadow-sm transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-800" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-neutral-200 shadow-sm transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-800" />
                </button>
              </>
            )}

            {/* Đánh số trang ảnh: 01 / 02 */}
            <div className="absolute bottom-4 right-4 bg-white/90 px-2.5 py-1 text-[10px] font-mono tracking-widest text-neutral-700 uppercase border border-neutral-200">
              {String(currentImageIndex + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI (5 CỘT): THÔNG TIN SẢN PHẨM & ACTIONS === */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {/* Badge nhãn nếu có (SALE nền đỏ, khác nền đen) */}
          {product.badge && (
            <div className="mb-2">
              <span
                className={`inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[2px] ${
                  product.badge.trim().toUpperCase().includes('SALE')
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white'
                }`}
              >
                {product.badge}
              </span>
            </div>
          )}

          {/* Tên sản phẩm */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase leading-tight text-[#111111]">
            {product.name}
          </h1>

          {/* Tên Shop */}
          <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-500 mt-1 mb-4">
            SHOP:{' '}
            <Link
              to={`/store/${
                product.shopSlug ||
                product.sellerSlug ||
                shopSlug ||
                toShopSlug(product.shopName) ||
                'm-studio'
              }`}
              className="text-[#111111] font-semibold underline hover:opacity-70 transition-opacity"
            >
              {product.shopName}
            </Link>
          </div>

          {/* Đơn giá */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-[#111111] tracking-tight">
              {product.price?.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm font-mono text-neutral-400 line-through">
                {product.originalPrice?.toLocaleString('vi-VN')}₫
              </span>
            )}
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              VAT INCLUDED
            </span>
          </div>

          {/* Mô tả ngắn */}
          <p className="text-xs text-neutral-600 leading-relaxed font-sans pb-5 border-b border-neutral-200">
            {product.description}
          </p>

          {/* KHỐI 1: BỘ CHỌN COLOR */}
          <div className="py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider mb-2.5">
              <span className="font-semibold text-neutral-700 uppercase">COLOR</span>
              <span className="text-neutral-500 uppercase font-sans text-[11px]">
                {selectedColor.startsWith('#') ? 'BLACK' : selectedColor}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-black border-neutral-400'
                      : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* KHỐI 2: BỘ CHỌN SIZE & TỒN KHO */}
          <div className="py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 uppercase">SIZE</span>
                <span className="text-neutral-400 font-sans text-[11px]">({selectedSize})</span>
              </div>

              {/* ẨN NÚT SIZE MATRIX NẾU LÀ CATEGORY ACCESSORIES */}
              {categoryType !== 'accessories' && (
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="text-[11px] font-mono text-black underline uppercase tracking-widest hover:text-neutral-500 transition-colors cursor-pointer"
                >
                  SIZE MATRIX
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {product.sizes?.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3.5 py-2.5 min-w-[56px] text-center font-mono tracking-wider transition-all border ${
                    sz.length > 3 ? 'text-[10px] leading-tight' : 'text-xs'
                  } ${
                    selectedSize === sz
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Trạng thái tồn kho chi tiết */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-neutral-400">
              <span>[✓]</span>
              <span>IN STOCK ({product.stock} units archived in atelier)</span>
            </div>
          </div>

          {/* KHỐI 3: QUANTITY & TOTAL AMOUNT */}
          <div className="py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-1.5">
                QUANTITY
              </div>
              <div className="flex items-center border border-neutral-300 w-28 bg-white">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="w-8 h-9 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono text-xs font-semibold">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="w-8 h-9 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-1">
                TOTAL AMOUNT
              </div>
              <div className="text-xl font-bold text-[#111111]">
                {totalAmount.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* KHỐI 4: NÚT HÀNH ĐỘNG (ADD TO CART & BUY NOW) */}
          <div className="pt-6 pb-6 space-y-2.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-4 bg-[#111111] hover:bg-black text-white text-xs font-mono font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
            >
              <span>ADD TO CART</span>
              <ShoppingBag className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-white hover:bg-black text-[#111111] hover:text-white text-xs font-mono font-bold tracking-widest uppercase transition-all duration-200 border border-neutral-300 hover:border-black"
            >
              BUY NOW
            </button>
          </div>

          {/* KHỐI 5: 3 CAM KẾT DỊCH VỤ */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-neutral-200 text-neutral-600 text-[10px] font-sans">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black uppercase font-mono tracking-wider">
                  SHIPPING
                </p>
                <p className="text-neutral-500 mt-0.5 leading-tight">
                  Standard & Express delivery
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black uppercase font-mono tracking-wider">
                  14-DAY EXCHANGE
                </p>
                <p className="text-neutral-500 mt-0.5 leading-tight">
                  Original tags & unworn condition
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black uppercase font-mono tracking-wider">
                  PROVENANCE
                </p>
                <p className="text-neutral-500 mt-0.5 leading-tight">
                  {product.shopName || 'Atelier'} Certified Piece
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS CHI TIẾT (DETAILS / RETURNS / CARE GUIDE) */}
      <div className="border-t border-neutral-200 pt-8 mb-20">
        {/* THANH CHỌN TAB */}
        <div className="flex items-center gap-8 mb-8 border-b border-neutral-200 pb-3">
          {['DETAILS', 'RETURNS', 'CARE GUIDE'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-mono tracking-widest uppercase pb-3 -mb-3 transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-black font-bold text-black'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NỘI DUNG TAB 1: DETAILS (Có vạch thẳng mảnh chia đôi 2 cột) */}
        {activeTab === 'DETAILS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-xs text-neutral-600 leading-relaxed font-sans">
            {/* Cột trái: Material & Specifications (Có border-r phân cách) */}
            <div className="md:pr-10 md:border-r border-neutral-200">
              <h4 className="font-mono font-bold tracking-wider text-black uppercase mb-3">
                MATERIAL & SPECIFICATIONS
              </h4>
              {product.details?.material && (
                <p className="mb-3 font-medium text-neutral-700">
                  {product.details.material}
                </p>
              )}
              <ul className="space-y-2 list-disc list-inside text-neutral-600">
                {product.details?.specifications && product.details.specifications.length > 0 ? (
                  product.details.specifications.map((spec, i) => <li key={i}>{spec}</li>)
                ) : categoryType === 'accessories' ? (
                  <>
                    <li>Hypoallergenic brushed titanium and surgical alloy construction.</li>
                    <li>Ergonomic hollowed structure with open-band contouring.</li>
                    <li>Corrosion and tarnish resistant micro-matte treatment.</li>
                  </>
                ) : (
                  <>
                    <li>High-density structured textile blend with precision finishing.</li>
                    <li>Reinforced seam architecture with tailored silhouette lines.</li>
                    <li>Custom hardware accents with laser-engraved atelier markings.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Cột phải: Provenance & Craftsmanship */}
            <div className="md:pl-2">
              <h4 className="font-mono font-bold tracking-wider text-black uppercase mb-3">
                PROVENANCE & CRAFTSMANSHIP
              </h4>
              <p>
                {product.details?.origin ||
                  product.provenance ||
                  `Designed and curated by ${product.shopName || 'M STUDIO'}. Produced in limited batch allocations to ensure exacting quality standards.`}
              </p>
            </div>
          </div>
        )}

        {/* NỘI DUNG TAB 2: RETURNS (ENGLISH) */}
        {activeTab === 'RETURNS' && (
          <div className="text-xs text-neutral-600 leading-relaxed font-sans max-w-2xl">
            <h4 className="font-mono font-bold tracking-wider text-black uppercase mb-2">
              ARCHIVAL RETURN POLICIES
            </h4>
            <p>
              Returns and exchanges are accepted within 14 days of delivery. All garments and accessories must remain unworn, unwashed, and in original condition with all security tags and protective packaging intact. Final sale items, personalized alterations, and pierced body jewelry are strictly non-returnable due to hygiene regulations.
            </p>
          </div>
        )}

        {/* NỘI DUNG TAB 3: CARE GUIDE (ENGLISH) */}
        {activeTab === 'CARE GUIDE' && (
          <div className="text-xs text-neutral-600 leading-relaxed font-sans max-w-2xl">
            <h4 className="font-mono font-bold tracking-wider text-black uppercase mb-2">
              MAINTENANCE & PRESERVATION
            </h4>
            {product.careInstructions ? (
              <p>{product.careInstructions}</p>
            ) : categoryType === 'accessories' ? (
              <p>
                Avoid direct contact with water, perfume, hairspray, and harsh solvents. Buff gently with a microfiber polishing cloth after wear and store in a sealed jewelry pouch to prevent oxidation.
              </p>
            ) : categoryType === 'shoes' ? (
              <p>
                Brush off surface dirt with a soft bristle brush or damp cloth. Do not submerge in water. Allow to air dry naturally away from direct sunlight and heat sources to preserve leather and sole bonding.
              </p>
            ) : (
              <p>
                Specialist dry clean or gentle hand wash cold inside out. Do not bleach or tumble dry. Steam or cool iron on reverse with a protective pressing cloth.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. GỢI Ý PHỐI ĐỒ (COMPLETE THE LOOK) */}
      <div className="border-t border-neutral-200 pt-10">
        <CompleteTheLook onQuickAdd={(lookItem) => setQuickAddProduct(lookItem)} />
      </div>

      {/* 4. POPUP THÊM NHANH (QUICK ADD) TỪ COMPLETE THE LOOK */}
      <QuickAddModal
        key={quickAddProduct?.id || 'none'}
        isOpen={Boolean(quickAddProduct)}
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        onConfirm={(item) => {
          addToCart(
            item,
            item.selectedSize || 'One Size',
            item.selectedColor || 'Standard',
            item.quantity || 1
          )
          showToast(`ADDED ${item.name.toUpperCase()} TO CART.`)
        }}
      />

      {/* 5. TOAST THÔNG BÁO TÁI SỬ DỤNG */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />

      {/* 6. MODAL BẢNG SIZE */}
      <SizeMatrixModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        categoryType={categoryType}
      />
    </div>
  )
}