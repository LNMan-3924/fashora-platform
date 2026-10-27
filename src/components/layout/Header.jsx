import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores'
import { useAuth } from '../../contexts/AuthContext'
import SearchOverlay from './SearchOverlay'

function Header({ hideNav = false }) {
    const [logoSrc, setLogoSrc] = useState('/assets/logo.png')
    const [logoError, setLogoError] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
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

    const handleConfirmSignOut = () => {
        logoutUser()
        setIsSignOutModalOpen(false)
        navigate('/home')
    }
    const searchParams = new URLSearchParams(location.search)
    const currentTag = searchParams.get('tag')
    const isShopPath = location.pathname === '/shop'

    // Nghiệp vụ: Chỉ ở các trang Auth (/login, /register) mới ẩn badge giỏ hàng (0); ở Explore và các trang khác vẫn đồng bộ số lượng giỏ hàng
    const isAuthPage = ['/login', '/register'].includes(location.pathname)
    const displayCartCount = isAuthPage ? 0 : totalCount
    const formattedCount = displayCartCount > 99 ? '99+' : displayCartCount

    const isNewArrival = location.pathname === '/home'
    const isBestSeller = isShopPath && currentTag === 'best-seller'
    const isAll = isShopPath && !currentTag

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
                    {/* Nút Hamburger cho Mobile: Chỉ hiển thị khi KHÔNG BỊ ẨN NAV */}
                    {!hideNav && (
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

                    {/* Ô tìm kiếm dạng gạch chân tối giản - Mở Search Overlay */}
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden sm:flex items-center gap-2.5 border-b border-neutral-700 hover:border-white pb-1 max-w-[220px] w-full text-left transition-colors cursor-pointer group"
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
                            SEARCH ARCHIVE...
                        </span>
                    </button>
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

                {/* Cột phải: VN VIETNAM, Account, Giỏ hàng */}
                <div className="flex items-center justify-end gap-4 sm:gap-6">
                    {/* Nhãn VN VIETNAM */}
                    <span className="hidden lg:inline-block text-[11px] text-neutral-400 font-medium tracking-wider">
                        VN VIETNAM
                    </span>

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
                                                    SIGNED IN AS
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
                                                PROFILE
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                MY ORDERS
                                            </Link>
                                            <Link
                                                to="/following"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                FOLLOWING SHOPS
                                            </Link>
                                            {currentUser?.shopId ? (
                                                <Link
                                                    to="/seller/dashboard"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider font-semibold text-emerald-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                                >
                                                    SELLER DASHBOARD
                                                </Link>
                                            ) : (
                                                <Link
                                                    to="/become-seller"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider font-semibold text-white hover:bg-neutral-800 transition-colors"
                                                >
                                                    BECOME A SELLER
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
                                                SIGN OUT
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2.5 font-mono uppercase text-[11px] tracking-wider font-semibold text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                SIGN IN
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2.5 font-mono uppercase text-[11px] tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                CREATE AN ACCOUNT
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
                        NEW ARRIVAL
                    </Link>
                    <Link
                        to="/shop?tag=best-seller"
                        className={`transition-colors uppercase ${isBestSeller
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white font-medium'
                            }`}
                    >
                        BEST SELLER
                    </Link>
                    <Link
                        to="/shop"
                        className={`transition-colors uppercase ${isAll
                            ? 'text-white font-bold'
                            : 'text-neutral-400 hover:text-white font-medium'
                            }`}
                    >
                        ALL
                    </Link>
                </nav>
            )}

            {/* MOBILE DRAWER (ẨN KHI hideNav = true) */}
            {!hideNav && isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <aside className="relative z-10 w-[300px] max-w-[85vw] h-full bg-neutral-950 border-r border-neutral-800 shadow-2xl flex flex-col px-6 py-7 animate-in slide-in-from-left duration-200">
                        {/* 1. Header của Drawer */}
                        <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                            <span className="text-lg font-bold tracking-[0.28em] uppercase text-white">
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

                        {/* 2. Ô Tìm Kiếm (Mobile - Bấm mở Search Overlay) */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false)
                                setIsSearchOpen(true)
                            }}
                            className="mt-6 w-full relative flex items-center bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-lg px-3.5 py-2.5 transition-colors cursor-pointer text-left"
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
                                SEARCH ARCHIVE...
                            </span>
                        </button>

                        {/* 3. Navigation */}
                        <nav className="mt-8 flex flex-col gap-5">
                            <NavLink
                                to="/home"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                    }`
                                }
                            >
                                NEW ARRIVAL
                            </NavLink>
                            <NavLink
                                to="/shop?tag=best-seller"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                    }`
                                }
                            >
                                BEST SELLER
                            </NavLink>
                            <NavLink
                                to="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                    }`
                                }
                            >
                                ALL
                            </NavLink>
                            {isAuthenticated && (
                                <>
                                    <div className="my-2 border-t border-neutral-800" />
                                    <NavLink
                                        to="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                            }`
                                        }
                                    >
                                        PROFILE
                                    </NavLink>
                                    <NavLink
                                        to="/orders"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                            }`
                                        }
                                    >
                                        MY ORDERS
                                    </NavLink>
                                    <NavLink
                                        to="/following"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white font-medium'
                                            }`
                                        }
                                    >
                                        FOLLOWING SHOPS
                                    </NavLink>
                                </>
                            )}
                        </nav>
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
                                CONFIRM SIGN OUT
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-neutral-300 font-mono mb-6 leading-relaxed">
                            Are you sure you want to sign out of your FASHORA account? You will be redirected to the home page.
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsSignOutModalOpen(false)}
                                className="flex-1 py-2.5 border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSignOut}
                                className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                            >
                                SIGN OUT
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