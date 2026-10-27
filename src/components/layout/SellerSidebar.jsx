import { NavLink, Link } from 'react-router-dom'

export default function SellerSidebar({ sellerInfo, onCloseMobile }) {
  const shopName = sellerInfo?.shopName || 'MY ATELIER'
  const sellerCode = sellerInfo?.sellerCode || 'SELLER'
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
    },
    {
      name: 'Settings',
      path: '/seller/settings',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Back to Home',
      path: '/home',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                className="p-1 text-neutral-500 hover:text-black md:hidden cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Link
            to="/home"
            onClick={onCloseMobile}
            className="text-xl font-bold tracking-[0.25em] uppercase text-black mt-1 block hover:opacity-80 transition-opacity"
            title="Go to Fashora Home (/home)"
          >
            FASHORA
          </Link>

          {/* BADGE TỰ ĐỘNG ĐỔI TÊN SHOP KHI ĐĂNG KÝ */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded text-[11px] font-semibold text-neutral-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                sellerInfo?.status === 'PAUSED' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="truncate max-w-[130px]">{shopName}</span>
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
                  `flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider transition-colors ${
                    isActive && item.path !== '/' && item.path !== '/home'
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

      {/* 3. PROFILE DƯỚI ĐÁY TỰ ĐỘNG LẤY CHỮ CÁI ĐẦU VÀ TÊN SHOP */}
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
