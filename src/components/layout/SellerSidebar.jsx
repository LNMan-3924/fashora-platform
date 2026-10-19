import { NavLink } from 'react-router-dom'

export default function SellerSidebar({ sellerInfo, onCloseMobile }) {
  const shopName = sellerInfo?.shopName || 'M STUDIO'
  const sellerCode = sellerInfo?.sellerCode || 'SELLER #MS-8021'
  const firstLetter = shopName.charAt(0).toUpperCase()

  const navItems = [
    {
      name: 'Dashboard',
      path: '/seller/dashboard',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Products',
      path: '/seller/products',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Orders',
      path: '/seller/orders',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full justify-between bg-white text-black select-none border-r border-neutral-200">
      <div>
        {/* 1. TOP HEADER CỦA SIDEBAR */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] font-medium text-neutral-400 uppercase">
              SELLER CENTER
            </span>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 text-neutral-500 hover:text-black md:hidden"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-[0.25em] uppercase text-black mt-1">
            FASHORA
          </h1>

          {/* BADGE TỰ ĐỘNG ĐỔI TÊN SHOP KHI ĐĂNG KÝ */}
          <div className="mt-3 inline-flex items-center px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded text-[11px] font-semibold text-neutral-800">
            <span className="truncate max-w-[140px]">{shopName}</span>
          </div>
        </div>

        {/* 2. NAVIGATION */}
        <div className="px-4 py-6">
          <div className="px-3 pb-3 text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider transition-colors ${isActive
                    ? 'bg-neutral-100 font-bold text-black border-l-4 border-black -ml-4 pl-3'
                    : 'font-medium text-neutral-600 hover:bg-neutral-50 hover:text-black'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>


      </div>

      {/* 4. PROFILE DƯỚI ĐÁY TỰ ĐỘNG LẤY CHỮ CÁI ĐẦU VÀ TÊN SHOP */}
      <div className="p-4 border-t border-neutral-200/80 flex items-center gap-3 bg-neutral-50/50">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
          {firstLetter}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-neutral-900 truncate">
            {shopName}
          </p>
          <p className="text-[10px] text-neutral-500 tracking-wider truncate">
            {sellerCode}
          </p>
        </div>
      </div>
    </div>
  )
}