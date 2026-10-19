export default function SellerHeader({
    shopName = 'M STUDIO',
    pageTitle = 'DASHBOARD',
    onOpenMobile
}) {
    return (
        <>
            {/* 1. THANH TRÊN CÙNG CHO MOBILE (< md) */}
            <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between relative">
                {/* Nút Hamburger bên trái */}
                <button
                    type="button"
                    onClick={onOpenMobile}
                    className="p-1.5 text-neutral-800 hover:text-black focus:outline-none z-10"
                    aria-label="Open sidebar menu"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo FASHORA CĂN GIỮA TUYỆT ĐỐI */}
                <span className="absolute left-1/2 -translate-x-1/2 font-bold tracking-[0.25em] text-sm uppercase text-black pointer-events-none select-none">
                    FASHORA
                </span>

                {/* Badge tên Shop bên phải */}
                <div className="inline-flex items-center px-2 py-0.5 border border-neutral-300 rounded text-[10px] font-medium text-neutral-700 bg-neutral-50 z-10">
                    <span className="truncate max-w-[90px]">{shopName}</span>
                </div>
            </header>

            {/* 2. THANH BANNER ĐEN HEADER DESKTOP (KHỚP 100% [ẢNH 1]) */}
            <div className="bg-[#0e0e0e] text-white px-6 sm:px-10 py-6 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Cụm chữ bên trái */}
                <div>
                    <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-neutral-400 uppercase font-medium">
                        <span>SELLER CENTER</span>
                        <span>/</span>
                        <span className="text-white font-semibold">{shopName}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[0.08em] uppercase text-white mt-1">
                        {pageTitle}
                    </h2>

                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-200">{shopName}</span>
                        <span className="text-neutral-500">—</span>
                        <span>Overview of your shop</span>
                    </div>
                </div>

                {/* Cụm trạng thái bên phải */}
                <div className="flex items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-neutral-700/80 rounded text-[11px] font-medium text-neutral-300 tracking-wider">
                        <span className="font-semibold text-emerald-400">ACTIVE</span>
                    </div>
                </div>
            </div>
        </>
    )
}