import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores'
import { useAuth } from '../../contexts/AuthContext'
import { changeAppLanguage } from '../../i18n'
import SearchOverlay from './SearchOverlay'
import { VietnamFlag } from '../common'

function Header({ hideNav = false }) {
    const { t, i18n } = useTranslation()
    const currentLang = i18n.language || 'en'
    const [logoSrc, setLogoSrc] = useState('/assets/logo.png')
    const [logoError, setLogoError] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
    const [langMenuOpen, setLangMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Lấy trạng thái đăng nhập từ AuthContext
    const { currentUser, isAuthenticated, logoutUser } = useAuth()

    // Đồng bộ số lượng sản phẩm từ Zustand store
    const cartItems = useCartStore((state) => state.cartItems || [])
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

    const location = useLocation()
    const navigate = useNavigate()

    // Đóng drawer khi nhấn ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isMobileMenuOpen])

    // Khóa cuộn trang khi mở drawer
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobileMenuOpen])

    const handleConfirmSignOut = () => {
        logoutUser()
        setIsSignOutModalOpen(false)
        navigate('/home')
    }




    // Nghiệp vụ: Chỉ ở các trang Auth (/login, /register) mới ẩn badge giỏ hàng (0); ở Explore và các trang khác vẫn đồng bộ số lượng giỏ hàng
    const isAuthPage = ['/login', '/register'].includes(location.pathname)
    const displayCartCount = isAuthPage ? 0 : totalCount
    const formattedCount = displayCartCount > 99 ? '99+' : displayCartCount

    const isNewArrival = location.pathname === '/home'
    const isBestSeller = location.pathname === '/best-seller'
    const isAll = location.pathname === '/shop'

    // Lắng nghe sự kiện storage để đồng bộ giỏ hàng qua các tab
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'fashora-cart-storage') {
                useCartStore.persist?.rehydrate?.()
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // Đồng bộ ngược ra localStorage key fashora_cart
    useEffect(() => {
        try {
            localStorage.setItem('fashora_cart', JSON.stringify(cartItems))
        } catch {
            // ignore
        }
    }, [cartItems])

    const handleLogoError = () => {
        if (logoSrc === '/assets/logo.png') {
            setLogoSrc('/logo.png')
        } else {
            setLogoError(true)
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
            {/* TẦNG 1: h-20, grid 3 cột */}
            <div className="h-20 grid grid-cols-3 items-center px-6 sm:px-10 lg:px-16">
                {/* Cột trái: Form ô tìm kiếm dạng gạch chân tối giản / Mobile menu toggle */}
                <div className="flex items-center">
                    {/* Nút Hamburger: Chỉ hiển thị khi responsive nhỏ lại (< md) trên mọi trang ngoại trừ Auth */}
                    {!isAuthPage && (
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden mr-3 p-1 text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                                    />
                                )}
                            </svg>
                        </button>
                    )}

                    {/* Ô tìm kiếm dạng gạch chân tối giản: Hiển thị trên Desktop (md:flex), ẩn khi responsive nhỏ lại */}
                    {!isAuthPage && (
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2.5 border-b border-neutral-700 hover:border-white pb-1 max-w-[220px] w-full text-left transition-colors cursor-pointer group"
                            title="Search pieces & ateliers..."
                        >
                            <svg
                                className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white shrink-0 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                            <span className="w-full text-xs text-neutral-400 group-hover:text-white tracking-[0.15em] font-mono uppercase truncate">
                                {t('nav.searchArchive')}
                            </span>
                        </button>
                    )}
                </div>

                {/* Cột giữa: Logo FASHORA căn chính giữa */}
                <div className="flex items-center justify-center">
                    <Link to="/home" className="inline-flex items-center justify-center">
                        {!logoError ? (
                            <img
                                src={logoSrc}
                                alt="FASHORA"
                                className="h-12 sm:h-14 object-contain max-w-[220px] sm:max-w-[260px]"
                                onError={handleLogoError}
                            />
                        ) : (
                            <span className="text-xl sm:text-2xl font-bold tracking-[0.35em] text-white">
                                FASHORA
                            </span>
                        )}
                    </Link>
                </div>

                {/* Cột phải: Language Switcher, Account, Giỏ hàng */}
                <div className="flex items-center justify-end gap-4 sm:gap-6">
                    {/* Nút chuyển đổi Ngôn ngữ (Language Switcher) trên Desktop */}
                    <div
                        className="relative hidden md:block"
                        onMouseLeave={() => setLangMenuOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setLangMenuOpen((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-white font-medium tracking-wider cursor-pointer py-1 px-2 rounded-[2px] hover:bg-neutral-800 transition-colors"
                            aria-label="Change Language"
                        >
                            {currentLang === 'vi' ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <VietnamFlag className="w-4 h-2.5 rounded-[1px] object-cover shrink-0 shadow-xs" />
                                    <span>VIỆT NAM</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5">
                                    <span>🌐</span>
                                    <span>ENGLISH</span>
                                </span>
                            )}
                            <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {langMenuOpen && (
                            <div className="absolute right-0 top-full pt-1.5 w-44 z-50 animate-in fade-in duration-150">
                                <div className="bg-neutral-900 border border-neutral-800 shadow-2xl py-1 text-xs rounded-[2px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            changeAppLanguage('vi')
                                            setLangMenuOpen(false)
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
                                            setLangMenuOpen(false)
                                        }}
                                        className={`w-full text-left px-3.5 py-2 font-mono uppercase text-[11px] tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                                            currentLang === 'en' ? 'text-white font-bold bg-neutral-800' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                                        }`}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <span>🌐</span>
                                            <span>English (Global)</span>
                                        </span>
                                        {currentLang === 'en' && <span className="text-emerald-400">✓</span>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Icon Account (Bấm để bật/tắt dropdown, không chuyển hướng trang) */}
                    <div
                        className="relative"
                        onMouseLeave={() => setAccountMenuOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setAccountMenuOpen((prev) => !prev)}
                            aria-label="Account Menu"
                            aria-expanded={accountMenuOpen}
                            className="p-1 text-neutral-300 hover:text-white transition-colors block cursor-pointer outline-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.4"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {accountMenuOpen && (
                            <div className="absolute right-0 top-full pt-2 w-52 z-50 animate-in fade-in duration-150">
                                <div className="bg-neutral-900 border border-neutral-800 shadow-2xl py-2 text-xs rounded-sm">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-neutral-800">
                                                <span className="text-[10px] font-mono text-neutral-400 uppercase block tracking-wider">
                                                    {t('nav.signedInAs')}
                                                </span>
                                                <span className="text-xs font-bold text-white truncate block mt-0.5">
                                                    {currentUser?.fullName || 'Valued Member'}
                                                </span>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                {t('nav.profile')}
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                {t('nav.myOrders')}
                                            </Link>
                                            <Link
                                                to="/following"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                {t('nav.followingShops')}
                                            </Link>
                                            {currentUser?.shopId ? (
                                                <Link
                                                    to="/seller/dashboard"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider font-semibold text-emerald-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                                >
                                                    {t('nav.sellerDashboard')}
                                                </Link>
                                            ) : (
                                                <Link
                                                    to="/become-seller"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider font-semibold text-white hover:bg-neutral-800 transition-colors"
                                                >
                                                    {t('nav.becomeSeller')}
                                                </Link>
                                            )}
                                            <div className="my-1 border-t border-neutral-800" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAccountMenuOpen(false)
                                                    setIsSignOutModalOpen(true)
                                                }}
                                                className="w-full text-left px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                                            >
                                                {t('nav.signOut')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2.5 font-mono uppercase text-[11px] tracking-wider font-semibold text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                {t('nav.signIn')}
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2.5 font-mono uppercase text-[11px] tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                {t('nav.createAccount')}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Icon Giỏ hàng (shopping bag) - Chỉ hiện badge số khi displayCartCount > 0 */}
                    <Link
                        to="/cart"
                        aria-label="Shopping Cart"
                        className="relative p-1 text-neutral-300 hover:text-white transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.4"
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.434 1.119 1.007z"
                            />
                        </svg>

                        {/* Chỉ render badge khi displayCartCount > 0 */}
                        {displayCartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-white text-black text-[9px] font-bold tracking-tighter min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-in fade-in duration-200">
                                {formattedCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* TẦNG 2: Navigation bar căn giữa bên dưới (ẨN KHI hideNav = true) */}
            {!hideNav && (
                <nav className="hidden md:flex items-center justify-center gap-10 lg:gap-14 py-3 border-t border-neutral-800/80 text-xs tracking-[0.18em]">
                    <Link
                        to="/home"
                        className={`transition-colors uppercase ${isNewArrival
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white font-medium'
                            }`}
                    >
                        {t('nav.newArrival')}
                    </Link>
                    <Link
                        to="/best-seller"
                        className={`transition-colors uppercase ${isBestSeller
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white font-medium'
                            }`}
                    >
                        {t('nav.bestSeller')}
                    </Link>
                    <Link
                        to="/shop"
                        className={`transition-colors uppercase ${isAll
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white font-medium'
                            }`}
                    >
                        {t('nav.all')}
                    </Link>
                </nav>
            )}

            {/* HAMBURGER DRAWER (Chỉ mở khi responsive thu nhỏ lại < md) */}
            {!isAuthPage && isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex md:hidden"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* Backdrop làm mờ */}
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer trượt từ bên trái */}
                    <aside
                        className="relative z-10 w-[300px] max-w-[85vw] h-full bg-neutral-950 border-r border-neutral-800 shadow-2xl flex flex-col justify-between px-6 py-7 animate-in slide-in-from-left duration-200"
                    >
                        <div>
                            {/* 1. Header của Drawer */}
                            <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                                <span className="text-lg font-bold tracking-[0.28em] uppercase text-white font-mono">
                                    FASHORA
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1 text-white hover:opacity-60 transition-opacity cursor-pointer"
                                    aria-label="Close menu"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* 2. KHUNG SEARCH Ở TRÊN */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileMenuOpen(false)
                                    setIsSearchOpen(true)
                                }}
                                className="mt-6 w-full relative flex items-center bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-[2px] px-3.5 py-2.5 transition-colors cursor-pointer text-left"
                            >
                                <svg
                                    className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                                <span className="text-[11px] tracking-[0.16em] uppercase text-neutral-400 font-mono">
                                    {t('nav.searchArchive')}
                                </span>
                            </button>

                            {/* 3. Navigation Links */}
                            <nav className="mt-8 flex flex-col gap-5">
                                <NavLink
                                    to="/home"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `text-sm font-semibold tracking-wider uppercase transition-colors ${
                                            isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                                        }`
                                    }
                                >
                                    {t('nav.newArrival')}
                                </NavLink>
                                <NavLink
                                    to="/best-seller"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `text-sm font-semibold tracking-wider uppercase transition-colors ${
                                            isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                                        }`
                                    }
                                >
                                    {t('nav.bestSeller')}
                                </NavLink>
                                <NavLink
                                    to="/shop"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `text-sm font-semibold tracking-wider uppercase transition-colors ${
                                            isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                                        }`
                                    }
                                >
                                    {t('nav.all')}
                                </NavLink>
                            </nav>
                        </div>

                        {/* 4. PHẦN DỊCH THUẬT / THANH CHỌN NGÔN NGỮ Ở DƯỚI */}
                        <div className="pt-6 border-t border-neutral-800">
                            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-3">
                                REGION &amp; LANGUAGE
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => changeAppLanguage('vi')}
                                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider border rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                                        currentLang === 'vi'
                                            ? 'border-white bg-white text-black font-bold'
                                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    <VietnamFlag className="w-4 h-2.5 rounded-[1px] object-cover shrink-0 shadow-xs" />
                                    <span>VIỆT NAM</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeAppLanguage('en')}
                                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider border rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                                        currentLang === 'en'
                                            ? 'border-white bg-white text-black font-bold'
                                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    <span>🌐</span>
                                    <span>ENGLISH</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>,
                document.body
            )}

            {/* SIGN OUT CONFIRMATION MODAL */}
            {isSignOutModalOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px] animate-in fade-in duration-150"
                    onClick={() => setIsSignOutModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sign-out-title"
                >
                    <div
                        className="relative w-full max-w-sm bg-[#0e0e0e] text-white border border-neutral-800 shadow-2xl p-6 rounded-[2px] animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="mb-3">
                            <h3 id="sign-out-title" className="text-base font-bold uppercase tracking-wider text-white">
                                {t('nav.confirmSignOut')}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-neutral-300 font-mono mb-6 leading-relaxed">
                            {t('nav.signOutDesc')}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsSignOutModalOpen(false)}
                                className="flex-1 py-2.5 border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSignOut}
                                className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                            >
                                {t('nav.signOut')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Search Overlay Toàn màn hình */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    )
}

function HeaderWithLiveCart(props) {
    const storeCount = useCartStore((state) => {
        if (typeof state.getTotalItems === 'function') {
            return state.getTotalItems()
        }
        if (Array.isArray(state.cartItems)) {
            return state.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        }
        return 0
    })

    useEffect(() => {
        try {
            const currentItems = useCartStore.getState().cartItems || []
            localStorage.setItem('fashora_cart', JSON.stringify(currentItems))
        } catch {
            // ignore
        }
        window.dispatchEvent(new Event('cartUpdated'))
    }, [storeCount])

    return <Header {...props} />
}

export default HeaderWithLiveCart