import { Link, useLocation } from 'react-router-dom'

export default function SellerHeader({
    shopName = 'MY ATELIER',
    pageTitle = 'DASHBOARD',
    status = 'ACTIVE',
    onToggleStatus,
    onOpenMobile,
    shopSlug = ''
}) {
    const location = useLocation()
    const isActive = status === 'ACTIVE'

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

                {/* Logo FASHORA CĂN GIỮA TUYỆT ĐỐI - Bấm chuyển về trang chủ (/) */}
                <Link
                    to="/home"
                    className="absolute left-1/2 -translate-x-1/2 font-bold tracking-[0.25em] text-sm uppercase text-black select-none hover:opacity-80 transition-opacity"
                    title="Back to Home (/home)"
                >
                    FASHORA
                </Link>

                {/* Cụm trạng thái & Badge tên Shop bên phải */}
                <div className="flex items-center gap-2 z-10">
                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded text-[10px] font-semibold tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${isActive
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
                        <span>{isActive ? 'ACTIVE' : 'PAUSED'}</span>
                    </button>

                    <div className="inline-flex items-center px-2 py-0.5 border border-neutral-300 rounded text-[10px] font-medium text-neutral-700 bg-neutral-50">
                        <span className="truncate max-w-[80px]">{shopName}</span>
                    </div>
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
                        <span>Overview of your shop</span>
                    </div>
                </div>

                {/* Cụm trạng thái bên phải: Nút chuyển đổi Active / Tạm ngưng hoạt động */}
                <div className="flex items-center gap-3">
                    {shopSlug && (
                        <Link
                            to={`/store/${shopSlug}`}
                            state={{ from: `${location.pathname}${location.search}` }}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white rounded text-[11px] font-mono tracking-wider transition-colors"
                            title="View Public Storefront"
                        >
                            <span>VIEW PUBLIC SHOP</span>
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
                        {/* Chấm tròn báo trạng thái nhấp nháy khi active */}
                        <span className="relative flex h-2 w-2">
                            {isActive && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                            />
                        </span>

                        {/* Nhãn trạng thái */}
                        <span className="transition-colors">
                            {isActive ? (
                                'ACTIVE'
                            ) : (
                                <>
                                    PAUSED
                                </>
                            )}
                        </span>

                        {/* Nút gạt chuyển đổi mini (Toggle Switch Pill) */}
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
