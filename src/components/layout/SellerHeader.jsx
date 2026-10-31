import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { changeAppLanguage } from '../../i18n'
import { VietnamFlag } from '../common'

export default function SellerHeader({
    shopName = 'MY ATELIER',
    pageTitle = 'DASHBOARD',
    status = 'ACTIVE',
    onToggleStatus,
    onOpenMobile,
    shopSlug = ''
}) {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const isActive = status === 'ACTIVE'
    const currentLang = (i18n.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en'

    // Dropdown state cho desktop và mobile
    const [desktopLangOpen, setDesktopLangOpen] = useState(false)
    const [mobileLangOpen, setMobileLangOpen] = useState(false)
    const desktopLangRef = useRef(null)
    const mobileLangRef = useRef(null)

    // Đóng dropdown khi bấm bên ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (desktopLangRef.current && !desktopLangRef.current.contains(e.target)) {
                setDesktopLangOpen(false)
            }
            if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) {
                setMobileLangOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            {/* 1. THANH TRÊN CÙNG CHO MOBILE (< md) */}
            <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between relative">
                {/* Nút Hamburger bên trái */}
                <button
                    type="button"
                    onClick={onOpenMobile}
                    className="p-1.5 text-neutral-800 hover:text-black focus:outline-none z-10 cursor-pointer"
                    aria-label="Open sidebar menu"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo FASHORA CĂN GIỮA TUYỆT ĐỐI */}
                <Link
                    to="/home"
                    className="absolute left-1/2 -translate-x-1/2 font-bold tracking-[0.25em] text-sm uppercase text-black select-none hover:opacity-80 transition-opacity"
                    title="Back to Home (/home)"
                >
                    FASHORA
                </Link>

                {/* Cụm trạng thái, ngôn ngữ & Shop bên phải */}
                <div className="flex items-center gap-1.5 z-10">
                    {/* Nút đổi ngôn ngữ Mobile */}
                    <div className="relative" ref={mobileLangRef}>
                        <button
                            type="button"
                            onClick={() => setMobileLangOpen((prev) => !prev)}
                            className="inline-flex items-center px-1.5 py-0.5 border border-neutral-300 rounded text-[10px] font-mono text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer"
                            aria-label="Change Language"
                        >
                            {currentLang === 'vi' ? (
                                <VietnamFlag className="w-3.5 h-2.5 rounded-[1px] object-cover inline-block" />
                            ) : (
                                <span>🌐</span>
                            )}
                        </button>

                        {mobileLangOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 z-50 bg-neutral-900 border border-neutral-800 shadow-xl py-1 text-xs rounded-[2px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        changeAppLanguage('vi')
                                        setMobileLangOpen(false)
                                    }}
                                    className={`w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider flex items-center justify-between cursor-pointer ${
                                        currentLang === 'vi' ? 'text-white font-bold bg-neutral-800' : 'text-neutral-300 hover:text-white'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <VietnamFlag className="w-3.5 h-2.5 rounded-[1px] object-cover inline-block" />
                                        <span>Tiếng Việt</span>
                                    </span>
                                    {currentLang === 'vi' && <span className="text-emerald-400">✓</span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        changeAppLanguage('en')
                                        setMobileLangOpen(false)
                                    }}
                                    className={`w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider flex items-center justify-between cursor-pointer ${
                                        currentLang === 'en' ? 'text-white font-bold bg-neutral-800' : 'text-neutral-300 hover:text-white'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <span>🌐</span>
                                        <span>English</span>
                                    </span>
                                    {currentLang === 'en' && <span className="text-emerald-400">✓</span>}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded text-[10px] font-semibold tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${isActive
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        title={isActive ? 'Click to pause store operations' : 'Click to reactivate store'}
                        aria-label="Toggle store status"
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                        />
                        <span>{isActive ? t('seller.active', 'ACTIVE') : t('seller.paused', 'PAUSED')}</span>
                    </button>
                </div>
            </header>

            {/* 2. THANH BANNER ĐEN HEADER DESKTOP */}
            <div className="bg-[#0e0e0e] text-white px-6 sm:px-10 py-6 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Cụm chữ bên trái */}
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[0.08em] uppercase text-white">
                        {pageTitle}
                    </h2>

                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-200">{shopName}</span>
                        <span className="text-neutral-500">—</span>
                        <span>{t('seller.overviewShop', 'Overview of your shop')}</span>
                    </div>
                </div>

                {/* Cụm trạng thái bên phải */}
                <div className="flex items-center gap-3">
                    {/* Dropdown chuyển đổi ngôn ngữ trên Desktop */}
                    <div className="relative" ref={desktopLangRef}>
                        <button
                            type="button"
                            onClick={() => setDesktopLangOpen((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white rounded text-[11px] font-mono tracking-wider transition-colors cursor-pointer select-none"
                            aria-label="Toggle language menu"
                        >
                            {currentLang === 'vi' ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <VietnamFlag className="w-3.5 h-2.5 rounded-[1px] object-cover shrink-0 shadow-xs" />
                                    <span>TIẾNG VIỆT</span>
                                </span>
                            ) : (
                                <span>🌐 ENGLISH</span>
                            )}
                            <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {desktopLangOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-44 z-50 bg-neutral-900 border border-neutral-800 shadow-2xl py-1 text-xs rounded-[2px] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        changeAppLanguage('vi')
                                        setDesktopLangOpen(false)
                                    }}
                                    className={`w-full text-left px-3.5 py-2 font-mono uppercase text-[11px] tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                                        currentLang === 'vi' ? 'text-white font-bold bg-neutral-800' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <VietnamFlag className="w-4 h-2.5 rounded-[1px] object-cover shrink-0 shadow-xs" />
                                        <span>Tiếng Việt (VN)</span>
                                    </span>
                                    {currentLang === 'vi' && <span className="text-emerald-400">✓</span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        changeAppLanguage('en')
                                        setDesktopLangOpen(false)
                                    }}
                                    className={`w-full text-left px-3.5 py-2 font-mono uppercase text-[11px] tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                                        currentLang === 'en' ? 'text-white font-bold bg-neutral-800' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                                    }`}
                                >
                                    <span>🌐 English (Global)</span>
                                    {currentLang === 'en' && <span className="text-emerald-400">✓</span>}
                                </button>
                            </div>
                        )}
                    </div>

                    {shopSlug && (
                        <Link
                            to={`/store/${shopSlug}`}
                            state={{ from: `${location.pathname}${location.search}` }}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white rounded text-[11px] font-mono tracking-wider transition-colors"
                            title="View Public Storefront"
                        >
                            <span>{t('seller.viewPublicShop', 'VIEW PUBLIC SHOP')}</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className={`group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-[11px] font-semibold tracking-wider select-none active:scale-95 ${isActive
                                ? 'bg-[#171717] hover:bg-[#1f1f1f] border-emerald-500/50 hover:border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                : 'bg-[#1f1912] hover:bg-[#282017] border-amber-500/50 hover:border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            }`}
                        title={
                            isActive
                                ? 'Store is operational (Click to pause operations)'
                                : 'Store is paused (Click to reactivate)'
                        }
                        aria-label="Toggle store status"
                    >
                        <span className="relative flex h-2 w-2">
                            {isActive && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                            />
                        </span>

                        <span className="transition-colors">
                            {isActive ? t('seller.active', 'ACTIVE') : t('seller.paused', 'PAUSED')}
                        </span>

                        <div
                            className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${isActive ? 'bg-emerald-500 justify-end' : 'bg-neutral-600 justify-start'
                                }`}
                        >
                            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs transition-transform" />
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}
