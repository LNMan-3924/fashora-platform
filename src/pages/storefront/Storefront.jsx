import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { safeBack } from '../../utils'
import { Store, MapPin, Phone, CheckCircle2, AlertTriangle, ArrowLeft, Search, Layers } from 'lucide-react'
import { getShops, getProductsByShop, getProducts } from '../../services/api'
import { formatVND, handleImageError, FALLBACK_IMAGE, toShopSlug } from '../../constants/commerce'
import { useAuth } from '../../contexts/AuthContext'

export default function Storefront() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const ITEMS_PER_PAGE = 16

  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('category') || 'ALL'
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateFilters = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(newParams).forEach(([key, val]) => {
          if (
            val === undefined ||
            val === null ||
            val === '' ||
            val === 'ALL' ||
            (key === 'page' && Number(val) <= 1)
          ) {
            next.delete(key)
          } else {
            next.set(key, String(val))
          }
        })
        return next
      },
      { replace: true }
    )
  }

  const handleCategorySelect = (cat) => {
    updateFilters({ category: cat, page: 1 })
  }

  const handleSearchChange = (query) => {
    updateFilters({ q: query, page: 1 })
  }

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage })
    const catalogSection = document.getElementById('storefront-catalog-section')
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchShopAndCatalog = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const shopsRes = await getShops()
        const allShops = Array.isArray(shopsRes?.data) ? shopsRes.data : []

        const rawSlug = decodeURIComponent(slug || '').trim()
        const normalizedSlug = toShopSlug(rawSlug)

        const targetShop = allShops.find((s) => {
          const sSlug = (s.slug || '').toLowerCase().trim()
          const sNormalizedSlug = toShopSlug(sSlug)
          const sNameNormalized = toShopSlug(s.name)

          // 1. Khớp chính xác slug hoặc slug đã chuẩn hóa
          if (sSlug === rawSlug.toLowerCase() || sNormalizedSlug === normalizedSlug) return true
          // 2. Khớp theo tên shop đã chuẩn hóa (VD: "L'OBSCUR ATELIER" -> "l-obscur-atelier")
          if (sNameNormalized === normalizedSlug) return true
          // 3. Khớp tiền tố (VD: user nhấn "l-obscur" nhưng tên shop là "l-obscur-atelier" hoặc ngược lại)
          if (
            normalizedSlug.length >= 4 &&
            (sNormalizedSlug.startsWith(normalizedSlug) || normalizedSlug.startsWith(sNormalizedSlug))
          ) {
            return true
          }
          // 4. Khớp theo Shop ID (VD: "shop_l-obscur-atelier_8158" hoặc "l-obscur-atelier_8158")
          if (s.id === rawSlug || s.id === `shop_${rawSlug}` || (s.id && s.id.replace(/^shop_/, '') === rawSlug)) {
            return true
          }
          // 5. Khớp tên thô không phân biệt hoa thường
          if (s.name && s.name.trim().toLowerCase() === rawSlug.toLowerCase()) return true
          return false
        })

        if (!targetShop) {
          if (isMounted) {
            setError(`No atelier storefront found matching "${slug}".`)
            setIsLoading(false)
          }
          return
        }

        if (isMounted) setShop(targetShop)

        // Tải danh sách sản phẩm của shop
        try {
          const prodsRes = await getProductsByShop(targetShop.id)
          let prods = Array.isArray(prodsRes?.data) ? prodsRes.data : []
          if (prods.length === 0) {
            // Dự phòng tìm theo shopId hoặc shopName trong toàn bộ kho sản phẩm
            const allProdsRes = await getProducts()
            const all = Array.isArray(allProdsRes?.data) ? allProdsRes.data : []
            prods = all.filter(
              (p) =>
                p.shopId === targetShop.id ||
                (p.shopName && p.shopName.toLowerCase() === targetShop.name.toLowerCase())
            )
          }
          if (isMounted) setProducts(prods)
        } catch (prodErr) {
          console.warn('Error loading shop products:', prodErr)
        }
      } catch (err) {
        console.error('Storefront error:', err)
        if (isMounted) setError('Failed to retrieve storefront data from server.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchShopAndCatalog()

    return () => {
      isMounted = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          RETRIEVING ATELIER ARCHIVE...
        </p>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 text-center space-y-4 font-mono">
        <Store className="w-10 h-10 text-neutral-400 mx-auto" />
        <h2 className="text-base font-bold uppercase tracking-wider text-black">
          STOREFRONT NOT FOUND
        </h2>
        <p className="text-xs text-neutral-500">
          {error || `The atelier with slug "/store/${slug}" does not exist or has been archived.`}
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => safeBack(navigate, '/shop')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Fashora Catalog</span>
          </button>
        </div>
      </div>
    )
  }

  const isPaused = (shop.status || '').toUpperCase() === 'PAUSED'
  const isOwner = currentUser && (currentUser.shopId === shop.id || currentUser.id === shop.ownerId)
  const isFromSellerCenter = Boolean(
    location.state?.from &&
    (location.state.from.startsWith('/seller') || isOwner)
  )

  // Danh mục độc nhất
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))]

  // Lọc sản phẩm theo danh mục và từ khóa, đồng thời đẩy sản phẩm Sold Out xuống cuối danh sách
  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = (p.name || '').toLowerCase().includes(q)
        const matchCat = (p.category || '').toLowerCase().includes(q)
        return matchName || matchCat
      }
      return true
    })
    .sort((a, b) => {
      const aSoldOut = Boolean(
        a.isSoldOut ||
        (a.stock !== undefined && Number(a.stock) === 0) ||
        (typeof a.badge === 'string' &&
          (a.badge.trim().toUpperCase() === 'SOLDOUT' ||
           a.badge.trim().toUpperCase() === 'SOLD OUT'))
      )
      const bSoldOut = Boolean(
        b.isSoldOut ||
        (b.stock !== undefined && Number(b.stock) === 0) ||
        (typeof b.badge === 'string' &&
          (b.badge.trim().toUpperCase() === 'SOLDOUT' ||
           b.badge.trim().toUpperCase() === 'SOLD OUT'))
      )
      // Sản phẩm còn hàng (In Stock) hiển thị trước, hết hàng (Sold Out) đẩy về cuối
      if (aSoldOut === bSoldOut) return 0
      return aSoldOut ? 1 : -1
    })

  // Tính toán tổng số trang & danh sách sản phẩm trang hiện tại tương tự trang Shop
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const hasCover = Boolean(shop?.coverImage)

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black">
      {/* 1. PAUSED Status Alert Banner if shop is paused */}
      {isPaused && (
        <div className="w-full bg-amber-500 text-black px-6 py-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b border-amber-600">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            ATELIER HIATUS: "{shop.name}" is currently paused. Garment purchases and orders are temporarily suspended.
          </span>
        </div>
      )}

      {/* 2. Shop Hero Header */}
      <section
        className={`relative border-b transition-colors duration-300 ${
          hasCover
            ? 'bg-[#0a0a0a] text-white border-neutral-900 overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center'
            : 'bg-white text-black border-neutral-200'
        }`}
      >
        {/* Cover image background & subtle gradient overlay */}
        {hasCover && (
          <>
            <img
              src={shop.coverImage}
              alt={`${shop.name} Cover Banner`}
              className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-90 transition-transform duration-700"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/45 backdrop-blur-[0.5px]" />
          </>
        )}

        <div
          className={`relative z-10 max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 w-full ${
            hasCover ? 'py-16 sm:py-24 lg:py-28' : 'py-10 sm:py-14'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Left: Logo & Identity */}
            <div className="flex items-start sm:items-center gap-6">
              <div
                className={`w-20 h-20 sm:w-28 sm:h-28 shrink-0 overflow-hidden flex items-center justify-center border shadow-xs ${
                  hasCover
                    ? 'bg-black/80 text-white border-white/20 shadow-2xl backdrop-blur-sm'
                    : 'bg-black text-white border-neutral-300'
                }`}
              >
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-serif font-black">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className={`text-2xl sm:text-3xl font-black uppercase tracking-wider ${
                      hasCover ? 'text-white drop-shadow-sm' : 'text-black'
                    }`}
                  >
                    {shop.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono tracking-wider px-2 py-0.5 ${
                      hasCover ? 'bg-white/10 text-white border border-white/20' : 'bg-black text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    VERIFIED ATELIER
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono tracking-wider px-2 py-0.5 border ${
                      isPaused
                        ? hasCover
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                        : hasCover
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span>{isPaused ? 'PAUSED' : 'ACTIVE'}</span>
                  </span>
                </div>

                <p
                  className={`text-xs sm:text-sm font-medium tracking-wide font-mono ${
                    hasCover ? 'text-neutral-200' : 'text-neutral-800'
                  }`}
                >
                  {shop.tagline || 'Contemporary Minimalist Fashion Atelier'}
                </p>

                <p
                  className={`text-xs max-w-2xl leading-relaxed font-light ${
                    hasCover ? 'text-neutral-300' : 'text-neutral-600'
                  }`}
                >
                  {shop.description || 'Independent fashion design house on FASHORA.'}
                </p>

                {/* Sub-specs */}
                <div
                  className={`pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono ${
                    hasCover ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  <span className={`font-semibold uppercase ${hasCover ? 'text-white' : 'text-black'}`}>
                    {shop.category}
                  </span>
                  {shop.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span>{shop.location}</span>
                      </span>
                    </>
                  )}
                  {shop.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{shop.phone}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
              {isFromSellerCenter && (
                <button
                  type="button"
                  onClick={() => {
                    if (location.state?.from) {
                      navigate(location.state.from)
                    } else {
                      safeBack(navigate, '/seller/dashboard')
                    }
                  }}
                  className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer group shadow-sm ${
                    hasCover
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                  title="Return to Seller Center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>BACK TO SELLER CENTER</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  hasCover
                    ? 'bg-black/40 hover:bg-black/70 border border-white/30 text-white backdrop-blur-sm'
                    : 'border border-neutral-300 text-black hover:border-black'
                }`}
                title="Browse all products in catalog"
              >
                Back to All Brands
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Section */}
      <section id="storefront-catalog-section" className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          {/* Categories Tab (Text + Underline chuẩn Design System 5.5) */}
          <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mb-px">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`pb-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-neutral-500 hover:text-black hover:border-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search inside shop */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search in this atelier..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Product Count Header */}
        <div className="py-4 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>
            SHOWING {paginatedProducts.length} OF {filteredProducts.length} GARMENTS
            {totalPages > 1 && ` • PAGE ${currentPage} OF ${totalPages}`}
          </span>
          <span>CURATED CAPSULE ARCHIVE</span>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {paginatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group flex flex-col bg-white border border-neutral-200 hover:border-black transition-all duration-200 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <img
                    src={p.images?.[0] || p.image || FALLBACK_IMAGE}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />
                  {p.badge && (
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                        p.badge?.trim().toUpperCase().includes('SALE')
                          ? 'bg-red-600 text-white'
                          : 'bg-black text-white'
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                  {(p.isSoldOut || Number(p.stock) === 0) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-mono uppercase tracking-widest font-bold border border-white px-3 py-1">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      {p.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black line-clamp-1 group-hover:underline mt-0.5">
                      {p.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-xs sm:text-sm font-bold font-mono text-black">
                      {formatVND(p.price)}
                    </span>
                    {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                      <span className="text-[11px] font-mono text-neutral-400 line-through">
                        {formatVND(p.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white border border-neutral-200 space-y-3 font-mono my-8">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">
              NO GARMENTS FOUND
            </h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              This atelier has not cataloged any pieces matching your filter. Check back soon for new collection drops.
            </p>
          </div>
        )}

        {/* CỤM PHÂN TRANG TƯƠNG TỰ TRANG SHOP */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 border-t border-neutral-100 pt-8">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`h-9 w-9 rounded-md border text-xs flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-200 text-neutral-700 hover:border-black cursor-pointer'
              }`}
              title="Previous Page"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              const isCurrent = pageNumber === currentPage
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`h-9 w-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`h-9 w-9 rounded-md border text-xs flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-200 text-neutral-700 hover:border-black cursor-pointer'
              }`}
              title="Next Page"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
