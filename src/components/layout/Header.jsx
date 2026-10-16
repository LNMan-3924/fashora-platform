import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores'

function Header() {
    const [logoSrc, setLogoSrc] = useState('/assets/logo.png')
    const [logoError, setLogoError] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Đồng bộ số lượng sản phẩm trong giỏ hàng trực tiếp từ Zustand store (Single Source of Truth)
    const cartItems = useCartStore((state) => state.cartItems)
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = new URLSearchParams(location.search)
    const currentTag = searchParams.get('tag')
    const isShopPath = location.pathname === '/shop'

    const isNewArrival = location.pathname === '/'
    const isBestSeller = isShopPath && currentTag === 'best-seller'
    const isAll = isShopPath && !currentTag

    // Lắng nghe sự kiện storage để đồng bộ giỏ hàng khi người dùng mở nhiều tab trình duyệt
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'fashora-cart-storage') {
                useCartStore.persist?.rehydrate?.()
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // Đồng bộ ngược ra localStorage key fashora_cart để đảm bảo tương thích toàn hệ thống
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

    // Hiển thị số lượng sản phẩm trên icon giỏ hàng (VD: 3, 2, 1 hoặc 99+)
    const formattedCount = cartCount > 99 ? '99+' : cartCount

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
            {/* TẦNG 1: h-20, grid 3 cột */}
            <div className="h-20 grid grid-cols-3 items-center px-6 sm:px-10 lg:px-16">
                {/* Cột trái: Form ô tìm kiếm dạng gạch chân tối giản / Mobile menu toggle */}
                <div className="flex items-center">
                    {/* Nút Hamburger cho Mobile */}
                    <button
                        type="button"
                        aria-label="Mở menu"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden mr-3 p-1 text-neutral-800 hover:text-black focus:outline-none"
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

                    {/* Ô tìm kiếm dạng gạch chân tối giản */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="hidden sm:flex items-center gap-2 border-b border-neutral-200 pb-1 max-w-[220px] w-full"
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
                            className="w-full text-xs placeholder:text-neutral-400 tracking-[0.15em] bg-transparent focus:outline-none text-neutral-800 uppercase"
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
                            <span className="text-xl sm:text-2xl font-bold tracking-[0.35em] text-black">
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

                    {/* Icon Account (kèm dropdown menu tối giản) */}
                    <div
                        className="relative"
                        onMouseEnter={() => setAccountMenuOpen(true)}
                        onMouseLeave={() => setAccountMenuOpen(false)}
                    >
                        <Link
                            to="/"
                            aria-label="Tài khoản cá nhân"
                            className="p-1 text-neutral-700 hover:text-black transition-colors block"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.4"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        </Link>

                        {/* Dropdown Menu */}
                        {accountMenuOpen && (
                            <div className="absolute right-0 top-full pt-2 w-48 z-50">
                                <div className="bg-white border border-neutral-200/80 shadow-md py-2 text-xs">
                                    <Link
                                        to="/profile"
                                        onClick={() => setAccountMenuOpen(false)}
                                        className="block px-4 py-2 text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                                    >
                                        PROFILE
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setAccountMenuOpen(false)}
                                        className="block px-4 py-2 text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                                    >
                                        MY ORDER
                                    </Link>
                                    <div className="my-1 border-t border-neutral-100" />
                                    <Link
                                        to="/become-a-seller"
                                        onClick={() => setAccountMenuOpen(false)}
                                        className="block px-4 py-2 font-medium text-black hover:bg-neutral-50 transition-colors"
                                    >
                                        BECOME A SELLER
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Icon Giỏ hàng (shopping bag) - Chỉ hiện số khi giỏ có hàng */}
                    <Link
                        to="/cart"
                        aria-label="Giỏ hàng"
                        className="relative p-1 text-neutral-700 hover:text-black transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.4"
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.434 1.119 1.007z"
                            />
                        </svg>

                        {/* Chỉ render badge khi cartCount > 0 */}
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-black text-white text-[9px] font-semibold tracking-tighter min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-in fade-in duration-200">
                                {formattedCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* TẦNG 2: Navigation bar căn giữa bên dưới */}
            <nav className="hidden md:flex items-center justify-center gap-10 lg:gap-14 py-3 border-t border-neutral-100/70 text-xs tracking-[0.18em]">
                <Link
                    to="/"
                    className={`transition-colors uppercase ${isNewArrival
                        ? 'text-black font-bold'
                        : 'text-neutral-500 hover:text-black font-medium'
                        }`}
                >
                    NEW ARRIVAL
                </Link>
                <Link
                    to="/shop?tag=best-seller"
                    className={`transition-colors uppercase ${isBestSeller
                        ? 'text-black font-bold'
                        : 'text-neutral-500 hover:text-black font-medium'
                        }`}
                >
                    BEST SELLER
                </Link>
                <Link
                    to="/shop"
                    className={`transition-colors uppercase ${isAll
                        ? 'text-black font-bold'
                        : 'text-neutral-500 hover:text-black font-medium'
                        }`}
                >
                    ALL
                </Link>
            </nav>

            {/* MOBILE DRAWER */}
            {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div
                        className="fixed inset-0 bg-black/60 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <aside className="relative z-10 w-[300px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col px-6 py-7 animate-in slide-in-from-left duration-200">
                        {/* 1. Header của Drawer */}
                        <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                            <span className="text-lg font-bold tracking-[0.28em] uppercase text-black">
                                FASHORA
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1 text-black hover:opacity-60 transition-opacity"
                                aria-label="Close menu"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* 2. Ô Tìm Kiếm */}
                        <form onSubmit={handleSearchSubmit} className="mt-6 w-full">
                            <div className="relative flex items-center bg-[#f4f4f4] rounded-lg px-3.5 py-2.5">
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
                                    className="w-full bg-transparent text-[11px] tracking-[0.16em] uppercase placeholder:text-neutral-400 placeholder:tracking-[0.16em] focus:outline-none text-black"
                                />
                            </div>
                        </form>

                        {/* 3. Navigation */}
                        <nav className="mt-8 flex flex-col gap-5">
                            <NavLink
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-black font-semibold' : 'text-black hover:opacity-60 font-medium'
                                    }`
                                }
                            >
                                NEW ARRIVAL
                            </NavLink>
                            <NavLink
                                to="/shop?tag=best-seller"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-black font-semibold' : 'text-black hover:opacity-60 font-medium'
                                    }`
                                }
                            >
                                BEST SELLER
                            </NavLink>
                            <NavLink
                                to="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-[11px] tracking-[0.22em] uppercase transition-colors ${isActive ? 'text-black font-semibold' : 'text-black hover:opacity-60 font-medium'
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


/* ==========================================================================
   ADDED FOR FEATURE: Live Cart Counter Synchronization with Zustand Store
   - Giữ nguyên toàn bộ logic và JSX của Header gốc phía trên.
   - Kết nối với useCartStore để lấy tổng số lượng sản phẩm (cộng dồn số lượng).
   - Tự động đồng bộ số lượng tức thì khi Quick Add hoặc cập nhật giỏ hàng.
   - Hỗ trợ fallback tương thích ngược với localStorage và CustomEvent.
   ========================================================================== */

function HeaderWithLiveCart(props) {
    // 1. Lấy tổng số lượng từ Zustand store (tự động re-render khi store thay đổi)
    const storeCount = useCartStore((state) => {
        if (typeof state.getTotalItems === 'function') {
            return state.getTotalItems()
        }
        if (Array.isArray(state.cartItems)) {
            return state.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        }
        return 0
    })

    // 2. Kích hoạt sự kiện cartUpdated để cập nhật luôn state nội bộ của Header gốc
    useEffect(() => {
        try {
            // Đồng bộ sang fashora_cart cho các component cũ vẫn đọc từ localStorage
            const currentItems = useCartStore.getState().cartItems || []
            localStorage.setItem('fashora_cart', JSON.stringify(currentItems))
        } catch {
            // Bỏ qua nếu môi trường hạn chế localStorage
        }
        window.dispatchEvent(new Event('cartUpdated'))
    }, [storeCount])

    return <Header {...props} />
}

export default HeaderWithLiveCart