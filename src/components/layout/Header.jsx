import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores'
import { useAuth } from '../../contexts/AuthContext'

function Header({ hideNav = false }) {
    const [logoSrc, setLogoSrc] = useState('/assets/logo.png')
    const [logoError, setLogoError] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Lấy trạng thái đăng nhập từ AuthContext
    const { currentUser, isAuthenticated, logoutUser } = useAuth()

    // Đồng bộ số lượng sản phẩm từ Zustand store
    const cartItems = useCartStore((state) => state.cartItems) || []
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

    // Nghiệp vụ: Ở trang Auth (hideNav = true) hoặc chưa đăng nhập thì giỏ hàng hiển thị trống (0)
    const displayCartCount = hideNav ? 0 : totalCount
    const formattedCount = displayCartCount > 99 ? '99+' : displayCartCount

    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = new URLSearchParams(location.search)
    const currentTag = searchParams.get('tag')
    const isShopPath = location.pathname === '/shop'

    const isNewArrival = location.pathname === '/'
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

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
            setIsMobileMenuOpen(false)
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
                            aria-label="Mở menu"
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

                    {/* Ô tìm kiếm dạng gạch chân tối giản */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="hidden sm:flex items-center gap-2 border-b border-neutral-700 pb-1 max-w-[220px] w-full"
                    >
                        <svg
                            className="w-3.5 h-3.5 text-neutral-400 shrink-0"
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
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH..."
                            className="w-full text-xs placeholder:text-neutral-500 tracking-[0.15em] bg-transparent focus:outline-none text-white uppercase"
                        />
                    </form>
                </div>

                {/* Cột giữa: Logo FASHORA căn chính giữa */}
                <div className="flex items-center justify-center">
                    <Link to="/" className="inline-flex items-center justify-center">
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
                                                to="/become-seller"
                                                onClick={() => setAccountMenuOpen(false)}
                                                className="block px-4 py-2 font-mono uppercase text-[11px] tracking-wider font-semibold text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                BECOME A SELLER
                                            </Link>
                                            <div className="my-1 border-t border-neutral-800" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    logoutUser()
                                                    setAccountMenuOpen(false)
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
                        aria-label="Giỏ hàng"
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
                        to="/"
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

                        {/* 2. Ô Tìm Kiếm */}
                        <form onSubmit={handleSearchSubmit} className="mt-6 w-full">
                            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5">
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
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH ARCHIVE..."
                                    className="w-full bg-transparent text-[11px] tracking-[0.16em] uppercase placeholder:text-neutral-500 placeholder:tracking-[0.16em] focus:outline-none text-white"
                                />
                            </div>
                        </form>

                        {/* 3. Navigation */}
                        <nav className="mt-8 flex flex-col gap-5">
                            <NavLink
                                to="/"
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
                        </nav>
                    </aside>
                </div>,
                document.body
            )}
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