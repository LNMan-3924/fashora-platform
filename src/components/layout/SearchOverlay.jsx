import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, ArrowRight, Store, Tag } from 'lucide-react'
import { getProducts, getShops } from '../../services/api'
import { formatVND, handleImageError, FALLBACK_IMAGE } from '../../constants/commerce'
import {
  getLocalizedProductName,
  getLocalizedBadge,
  normalizeSearchText,
  matchesProductSearch,
} from '../../utils'

// Danh sách từ khóa gợi ý song ngữ thông minh
const TRENDING_TAGS = [
  { key: 'boots', labelEn: 'BOOTS', labelVi: 'GIÀY BOOT', query: 'BOOTS' },
  { key: 'sunglasses', labelEn: 'SUNGLASSES', labelVi: 'KÍNH MÁT', query: 'SUNGLASSES' },
  { key: 'leather', labelEn: 'LEATHER', labelVi: 'ĐỒ DA', query: 'LEATHER' },
  { key: 'enire', labelEn: 'ENIRE', labelVi: 'ENIRE', query: 'ENIRE' },
  { key: 'smoker', labelEn: 'SMOKER', labelVi: 'SMOKER', query: 'SMOKER' },
  { key: 'mStudio', labelEn: 'M STUDIO', labelVi: 'M STUDIO', query: 'M STUDIO' },
  { key: 'swag', labelEn: '#SWAG', labelVi: '#SWAG', query: '#SWAG' },
  { key: 'denim', labelEn: 'DENIM', labelVi: 'ĐỒ JEAN', query: 'DENIM' },
  { key: 'bag', labelEn: 'BAG', labelVi: 'TÚI XÁCH', query: 'BAG' },
  { key: 'accessories', labelEn: 'ACCESSORIES', labelVi: 'PHỤ KIỆN', query: 'ACCESSORIES' },
]

export default function SearchOverlay({ isOpen, onClose }) {
  const { t, i18n } = useTranslation()
  const isVi = (i18n.language || 'en').toLowerCase().startsWith('vi')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [allShops, setAllShops] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false)

  // Tải trước dữ liệu sản phẩm & shop khi mở Overlay
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    Promise.all([getProducts(), getShops()])
      .then(([productsRes, shopsRes]) => {
        if (!isMounted) return
        const pList = Array.isArray(productsRes?.data) ? productsRes.data : []
        const sList = Array.isArray(shopsRes?.data) ? shopsRes.data : []
        setAllProducts(pList)
        setAllShops(sList.filter((s) => s.status === 'ACTIVE' || !s.status))
      })
      .catch((err) => {
        console.warn('SearchOverlay: Failed to load data:', err)
      })
      .finally(() => {
        if (isMounted) setHasLoaded(true)
      })

    // Tự động focus vào ô tìm kiếm
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // Khóa cuộn trang nền
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Lắng nghe phím ESC để đóng
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      isMounted = false
      clearTimeout(timer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Lọc Cửa hàng phù hợp (hỗ trợ không dấu)
  const matchedShops = useMemo(() => {
    const q = normalizeSearchText(query)
    if (!q) return []
    return allShops.filter((s) => {
      const nameMatch = normalizeSearchText(s.name).includes(q)
      const slugMatch = normalizeSearchText(s.slug).includes(q)
      const catMatch = normalizeSearchText(s.category).includes(q)
      const taglineMatch = normalizeSearchText(s.tagline).includes(q)
      return nameMatch || slugMatch || catMatch || taglineMatch
    })
  }, [query, allShops])

  // Lọc Sản phẩm phù hợp (tìm song ngữ thông minh Anh - Việt theo Tên, Shop, Danh mục & Từ đồng nghĩa)
  const matchedProducts = useMemo(() => {
    if (!query.trim()) return []
    return allProducts
      .filter((p) => {
        const isAvailable =
          !p.isSoldOut &&
          Number(p.stock ?? 1) > 0 &&
          String(p.badge || '').toUpperCase() !== 'SOLDOUT'
        if (!isAvailable) return false

        return matchesProductSearch(p, query)
      })
      .slice(0, 8) // Giới hạn xem nhanh tối đa 8 sản phẩm
  }, [query, allProducts])

  // Tổng số sản phẩm khớp thực tế
  const totalMatchedCount = useMemo(() => {
    if (!query.trim()) return 0
    return allProducts.filter((p) => {
      const isAvailable =
        !p.isSoldOut &&
        Number(p.stock ?? 1) > 0 &&
        String(p.badge || '').toUpperCase() !== 'SOLDOUT'
      if (!isAvailable) return false
      return matchesProductSearch(p, query)
    }).length
  }, [query, allProducts])


  // Điều hướng sang trang xem đầy đủ kết quả
  const handleFullSearch = (searchKeyword) => {
    const kw = (searchKeyword || query).trim()
    if (!kw) return
    onClose()
    navigate(`/shop?q=${encodeURIComponent(kw)}`)
  }

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('searchOverlay.title', 'FASHORA ARCHIVE DISCOVERY')}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-200"
    >
      {/* 1. Header Bar: Tiêu đề + Nút đóng ESC */}
      <div className="w-full border-b border-neutral-800 px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 uppercase">
          <Search className="w-3.5 h-3.5" />
          <span>{t('searchOverlay.title', 'FASHORA ARCHIVE DISCOVERY')}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest cursor-pointer px-2 py-1"
        >
          <span className="hidden sm:inline">[ESC]</span>
          <span>{t('searchOverlay.close', 'CLOSE')}</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Search Area */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-20 py-8 max-w-7xl mx-auto w-full">
        {/* Form nhập liệu tìm kiếm */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleFullSearch()
          }}
          className="relative max-w-4xl mx-auto mb-8"
        >
          <div className="relative flex items-center border-b-2 border-neutral-700 focus-within:border-white transition-colors pb-3">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-500 mr-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchOverlay.placeholder', 'SEARCH PIECES, ATELIERS, OR STYLES...')}
              className="w-full bg-transparent text-lg sm:text-2xl md:text-3xl font-light uppercase tracking-wider text-white placeholder:text-neutral-600 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title={t('searchOverlay.clear', 'Clear input')}
                aria-label={t('searchOverlay.clear', 'Clear input')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* 3. Từ khóa gợi ý Trending (Luôn hiển thị tiện chuyển đổi nhanh) */}
        <div className="max-w-4xl mx-auto space-y-3 mb-8">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400">
            <Tag className="w-3.5 h-3.5" />
            <span>{t('searchOverlay.popularSearches', 'POPULAR SEARCHES & ATELIERS')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => {
              const tagLabel = isVi ? tag.labelVi : tag.labelEn
              const normQ = normalizeSearchText(query)
              const isActive =
                normQ === normalizeSearchText(tag.labelEn) ||
                normQ === normalizeSearchText(tag.labelVi) ||
                normQ === normalizeSearchText(tag.query)

              return (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => {
                    setQuery(tagLabel)
                    inputRef.current?.focus()
                  }}
                  className={`px-3.5 py-1.5 border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer rounded-[2px] ${
                    isActive
                      ? 'border-white bg-white text-black font-bold shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  {tagLabel}
                </button>
              )
            })}
          </div>
        </div>

        {/* Thông điệp khi chưa gõ gì */}
        {!query.trim() && (
          <div className="max-w-4xl mx-auto py-12 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
            {t('searchOverlay.typeKeyword', 'TYPE A KEYWORD OR SELECT A POPULAR TAG ABOVE TO EXPLORE ARCHIVAL PIECES')}
          </div>
        )}

        {/* 4. Kết quả tìm kiếm trực tiếp (Live Instant Results) */}
        {Boolean(query.trim()) && (
          <div className="max-w-5xl mx-auto space-y-10 pt-2 animate-in fade-in duration-200">
            {/* TẦNG 1: CÁC SHOP / ATELIER TRÙNG KHỚP */}
            {matchedShops.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-neutral-400 block">
                  {t('searchOverlay.matchingAteliers', { count: matchedShops.length, defaultValue: `MATCHING ATELIERS (${matchedShops.length})` })}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matchedShops.map((shop) => (
                    <Link
                      key={shop.id || shop.slug}
                      to={`/store/${shop.slug || shop.id}`}
                      onClick={onClose}
                      className="p-3.5 bg-neutral-900/80 border border-neutral-800 hover:border-neutral-500 transition-all rounded-[2px] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full border border-neutral-700 bg-black overflow-hidden shrink-0 flex items-center justify-center">
                          {shop.logo ? (
                            <img
                              src={shop.logo}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="font-bold text-xs font-mono">{shop.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-white truncate group-hover:underline">
                            {shop.name}
                          </h4>
                          <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase truncate block">
                            {shop.category || t('searchOverlay.officialAtelier', 'OFFICIAL ATELIER')}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono tracking-wider text-neutral-400 group-hover:text-white uppercase shrink-0 flex items-center gap-1">
                        {t('searchOverlay.visit', 'VISIT')} <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* TẦNG 2: CÁC SẢN PHẨM TRÙNG KHỚP */}
            {matchedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-neutral-400">
                    {t('searchOverlay.matchingPieces', { count: totalMatchedCount, defaultValue: `MATCHING ARCHIVE PIECES (${totalMatchedCount})` })}
                  </span>
                  {totalMatchedCount > 8 && (
                    <button
                      type="button"
                      onClick={() => handleFullSearch()}
                      className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('searchOverlay.viewAll', { count: totalMatchedCount, defaultValue: `VIEW ALL (${totalMatchedCount})` })}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {matchedProducts.map((prod) => {
                    const imgUrl = Array.isArray(prod.images) ? prod.images[0] : prod.image
                    const localizedName = getLocalizedProductName(prod, i18n.language, prod.name)
                    const localizedBadge = getLocalizedBadge(prod.badge, i18n.language)

                    return (
                      <Link
                        key={prod.id}
                        to={`/product/${prod.id}`}
                        onClick={onClose}
                        className="group bg-neutral-900/50 border border-neutral-800 p-2.5 hover:border-neutral-500 transition-all cursor-pointer flex flex-col"
                      >
                        <div className="aspect-[3/4] w-full bg-neutral-800 overflow-hidden mb-2 relative">
                          <img
                            src={imgUrl || FALLBACK_IMAGE}
                            alt={localizedName}
                            onError={handleImageError}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                          {localizedBadge && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-[8px] font-mono tracking-widest uppercase text-white">
                              {localizedBadge}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase truncate block">
                            {t('searchOverlay.by', 'BY')} {prod.shopName || t('searchOverlay.atelier', 'ATELIER')}
                          </span>
                          <h4 className="text-xs font-semibold text-white uppercase truncate group-hover:underline" title={localizedName}>
                            {localizedName}
                          </h4>
                          <span className="text-xs font-mono text-neutral-200 font-bold block">
                            {formatVND(prod.price)}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Nút Xem tất cả kết quả */}
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleFullSearch()}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <span>{t('searchOverlay.exploreAllPieces', { count: totalMatchedCount, defaultValue: `EXPLORE ALL ${totalMatchedCount} PIECES IN STORE` })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TRƯỜNG HỢP KHÔNG TÌM THẤY KẾT QUẢ NÀO */}
            {hasLoaded && matchedShops.length === 0 && matchedProducts.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <Store className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white font-mono">
                  {t('searchOverlay.noResultsTitle', { query, defaultValue: `NO PIECES OR ATELIERS FOUND MATCHING "${query}"` })}
                </h3>
                <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto leading-relaxed">
                  {t('searchOverlay.noResultsDesc', "We couldn't find any pieces matching your search query. Try keywords like boots, sunglasses, leather, or search for an atelier name.")}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      navigate('/shop')
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-white text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    <span>{t('searchOverlay.browseAll', 'BROWSE ALL ARCHIVAL PIECES')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
