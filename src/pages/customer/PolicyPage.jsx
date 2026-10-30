import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  FileText,
  Printer,
  Share2,
  Check,
  Phone,
  Mail,
  Clock,
  ChevronRight
} from 'lucide-react'
import { safeBack } from '../../utils'

const POLICY_TABS = [
  {
    key: 'shoppingGuide',
    path: '/shopping-guide',
    titleKey: 'policy.tabs.shoppingGuide',
    defaultTitle: 'SHOPPING GUIDE',
    icon: ShoppingBag,
  },
  {
    key: 'exchangePolicy',
    path: '/exchange-policy',
    titleKey: 'policy.tabs.exchangePolicy',
    defaultTitle: 'EXCHANGE POLICY',
    icon: RotateCcw,
  },
  {
    key: 'privacyPolicy',
    path: '/privacy-policy',
    titleKey: 'policy.tabs.privacyPolicy',
    defaultTitle: 'PRIVACY POLICY',
    icon: ShieldCheck,
  },
  {
    key: 'termsOfUse',
    path: '/terms-of-use',
    titleKey: 'policy.tabs.termsOfUse',
    defaultTitle: 'TERMS OF USE',
    icon: FileText,
  },
]

export default function PolicyPage({ title = 'POLICY' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [hasCopied, setHasCopied] = useState(false)

  // Tự động cuộn mượt lên đầu trang khi chuyển đổi chính sách
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, title])

  // Xác định chính sách đang hiển thị dựa trên URL hoặc prop
  const currentTabKey = (() => {
    const path = location.pathname.toLowerCase()
    if (path.includes('exchange-policy') || title === 'EXCHANGE POLICY') return 'exchangePolicy'
    if (path.includes('privacy-policy') || title === 'PRIVACY POLICY') return 'privacyPolicy'
    if (path.includes('terms-of-use') || title === 'TERMS OF USE') return 'termsOfUse'
    return 'shoppingGuide'
  })()

  // Chuyển hướng tab linh hoạt
  const handleTabChange = (tab) => {
    navigate(tab.path, { state: location.state })
  }

  // Nút quay lại thông minh
  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      safeBack(navigate, '/shop')
    }
  }

  const getBackLabel = () => {
    if (location.state?.from === '/register') return t('policy.backToRegister', 'Quay lại trang Tạo tài khoản')
    if (location.state?.from === '/login') return t('policy.backToLogin', 'Quay lại trang Đăng nhập')
    if (location.state?.from === '/home') return t('policy.backToHome', 'Quay lại Trang chủ')
    if (location.state?.from === '/shop') return t('policy.backToShop', 'Quay lại Cửa hàng')
    if (location.state?.from) return t('policy.goBack', 'Quay lại')
    return t('policy.backToPrev', 'Quay lại trang trước')
  }

  // Xử lý in văn bản
  const handlePrint = () => {
    window.print()
  }

  // Xử lý chia sẻ / sao chép liên kết
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2500)
    }
  }

  // Trích xuất dữ liệu nội dung từ i18n an toàn
  const shoppingSteps = t('policy.shoppingGuide.steps', { returnObjects: true }) || []
  const exchangeArticles = t('policy.exchangePolicy.articles', { returnObjects: true }) || []
  const privacyArticles = t('policy.privacyPolicy.articles', { returnObjects: true }) || []
  const termsArticles = t('policy.termsOfUse.articles', { returnObjects: true }) || []

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] antialiased">
      {/* Toast thông báo sao chép liên kết */}
      {hasCopied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#111111] text-white px-4 py-3 rounded-none shadow-2xl text-xs font-mono uppercase tracking-wider animate-fade-in border border-neutral-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t('policy.actions.copiedLink', 'Đã sao chép liên kết chính sách!')}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
        {/* Nút điều hướng quay lại */}
        <div className="mb-8 pb-4 border-b border-neutral-200">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-600 hover:text-black transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">{getBackLabel()}</span>
          </button>
        </div>

        {/* Thanh Điều Hướng 4 Tab Chính Sách */}
        <div className="mb-10 sm:mb-12">
          {/* Tab Bar ngang có thanh trượt trên mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {POLICY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = currentTabKey === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3.5 text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-[#111111] text-white border-[#111111] shadow-md font-semibold'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-black hover:text-black hover:bg-neutral-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className="truncate">{t(tab.titleKey, tab.defaultTitle)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Khung Nội Dung Chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* CỘT NỘI DUNG CHÍNH (8 CỘT) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Banner Tiêu Đề Chính Sách */}
            <div className="bg-white border border-neutral-200/90 p-6 sm:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-block px-2.5 py-1 bg-neutral-100 text-[10px] font-mono uppercase tracking-widest text-neutral-700 font-semibold">
                  {t(`policy.${currentTabKey}.badge`, 'OFFICIAL POLICY')}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {t('policy.lastUpdated', 'Cập nhật lần cuối: Tháng 10, 2026')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#111111] font-sans">
                {t(`policy.${currentTabKey}.title`, 'FASHORA POLICY')}
              </h1>

              <p className="mt-3 text-sm text-neutral-600 font-sans leading-relaxed">
                {t(`policy.${currentTabKey}.subtitle`, '')}
              </p>

              {/* Hộp Thông Điệp Then Chốt (Key Note) */}
              <div className="mt-6 p-4 sm:p-5 bg-neutral-50 border-l-2 border-[#111111] text-xs sm:text-sm text-neutral-700 font-mono leading-relaxed">
                <span className="font-bold uppercase text-black block mb-1">
                  ATELIER STANDARD CHARTER:
                </span>
                {t(`policy.${currentTabKey}.keyNote`, '')}
              </div>

              {/* Các nút tác vụ nhanh: In & Chia sẻ */}
              <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-200 hover:border-black text-neutral-700 hover:text-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('policy.actions.print', 'IN VĂN BẢN')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-200 hover:border-black text-neutral-700 hover:text-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('policy.actions.share', 'CHIA SẺ LIÊN KẾT')}</span>
                </button>
              </div>
            </div>

            {/* ================= 1. SHOPPING GUIDE ================= */}
            {currentTabKey === 'shoppingGuide' && Array.isArray(shoppingSteps) && (
              <div className="space-y-4">
                {shoppingSteps.map((stepItem, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200/90 p-6 sm:p-8 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 bg-[#111111] text-white flex items-center justify-center font-mono font-black text-sm tracking-wider">
                        {stepItem.step || `0${idx + 1}`}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase mb-2">
                          {stepItem.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans mb-3">
                          {stepItem.desc}
                        </p>
                        {stepItem.tips && (
                          <div className="p-3 bg-neutral-50 border border-neutral-200/60 text-[11px] font-mono text-neutral-500">
                            {stepItem.tips}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= 2. EXCHANGE POLICY ================= */}
            {currentTabKey === 'exchangePolicy' && Array.isArray(exchangeArticles) && (
              <div className="space-y-4">
                {exchangeArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200/90 p-6 sm:p-8 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                        {article.code || `ĐIỀU ${idx + 1}`}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase mb-3">
                      {article.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans mb-3">
                      {article.desc}
                    </p>
                    {Array.isArray(article.bullets) && article.bullets.length > 0 && (
                      <ul className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                        {article.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                            <span className="text-black font-bold shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ================= 3. PRIVACY POLICY ================= */}
            {currentTabKey === 'privacyPolicy' && Array.isArray(privacyArticles) && (
              <div className="space-y-4">
                {privacyArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200/90 p-6 sm:p-8 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                        {article.code || `ĐIỀU ${idx + 1}`}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase mb-3">
                      {article.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans mb-3">
                      {article.desc}
                    </p>
                    {Array.isArray(article.bullets) && article.bullets.length > 0 && (
                      <ul className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                        {article.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                            <span className="text-black font-bold shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ================= 4. TERMS OF USE ================= */}
            {currentTabKey === 'termsOfUse' && Array.isArray(termsArticles) && (
              <div className="space-y-4">
                {termsArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200/90 p-6 sm:p-8 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                        {article.code || `ĐIỀU ${idx + 1}`}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] uppercase mb-3">
                      {article.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans mb-3">
                      {article.desc}
                    </p>
                    {Array.isArray(article.bullets) && article.bullets.length > 0 && (
                      <ul className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                        {article.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                            <span className="text-black font-bold shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT THÔNG TIN PHỤ & HỖ TRỢ KHÁCH HÀNG (4 CỘT) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hộp Thông Tin Hỗ Trợ Trực Tiếp (Concierge Client Care) */}
            <div className="bg-[#111111] text-white p-6 sm:p-8 shadow-xl">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold block mb-2">
                {t('policy.supportBox.badge', 'DỊCH VỤ KHÁCH HÀNG CAO CẤP')}
              </span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-3">
                {t('policy.supportBox.title', 'BẠN CẦN TRỢ GIÚP?')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-6">
                {t('policy.supportBox.desc', '')}
              </p>

              <div className="space-y-4 pt-4 border-t border-neutral-800 text-xs font-mono">
                {/* Hotline */}
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">
                      {t('policy.supportBox.hotlineLabel', 'Hotline Concierge')}
                    </span>
                    <a
                      href="tel:+84783734808"
                      className="text-white font-bold hover:text-amber-400 transition-colors text-sm"
                    >
                      +84 783 734 808
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">
                      {t('policy.supportBox.emailLabel', 'Email Hỗ Trợ')}
                    </span>
                    <a
                      href="mailto:infoFashora@gmail.com"
                      className="text-white hover:text-amber-400 transition-colors break-all"
                    >
                      infoFashora@gmail.com
                    </a>
                  </div>
                </div>

                {/* Giờ làm việc */}
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">
                      {t('policy.supportBox.hoursLabel', 'Giờ làm việc')}
                    </span>
                    <span className="text-neutral-300">
                      {t('policy.supportBox.hoursValue', '8:30 - 22:00 hàng ngày')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liên kết điều hướng nhanh đến các trang quan trọng */}
            <div className="bg-white border border-neutral-200/90 p-6 shadow-xs">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-700 font-bold mb-4">
                {t('policy.quickLinksTitle', 'LIÊN KẾT NHANH')}
              </h4>
              <ul className="space-y-2.5 text-xs font-mono text-neutral-600">
                <li>
                  <Link
                    to="/shop"
                    className="flex items-center justify-between py-1.5 hover:text-black transition-colors group"
                  >
                    <span>{t('nav.allProducts', 'TẤT CẢ SẢN PHẨM')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore"
                    className="flex items-center justify-between py-1.5 hover:text-black transition-colors group"
                  >
                    <span>{t('nav.explore', 'KHÁM PHÁ CÂU CHUYỆN')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/become-seller"
                    className="flex items-center justify-between py-1.5 hover:text-black transition-colors group"
                  >
                    <span>{t('nav.becomeSeller', 'TRỞ THÀNH NGƯỜI BÁN')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
