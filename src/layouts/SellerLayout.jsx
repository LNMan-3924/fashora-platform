import { Outlet, NavLink, Link } from 'react-router-dom'

function SellerLayout() {
  const navItems = [
    {
      to: '/seller/dashboard',
      label: 'Tổng quan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
    },
    {
      to: '/seller/products',
      label: 'Quản lý sản phẩm',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      ),
    },
    {
      to: '/seller/orders',
      label: 'Quản lý đơn hàng',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
          />
        </svg>
      ),
    },
    {
      to: '/store/m-studio',
      label: 'Xem Storefront',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex bg-background text-primary">
      {/* Sidebar Cố định w-64 */}
      <aside className="w-64 border-r border-border bg-surface shrink-0 min-h-screen sticky top-0 h-screen flex flex-col justify-between">
        <div>
          {/* Header Sidebar: Logo & Tag */}
          <div className="p-6 border-b border-border flex flex-col gap-2">
            <Link to="/seller/dashboard" className="flex items-center gap-2">
              <span className="font-bold text-heading-2 tracking-tight text-primary">FASHORA</span>
              <span className="text-[10px] uppercase tracking-wider bg-primary text-background font-semibold px-2 py-0.5 rounded-sm">
                SELLER CENTER
              </span>
            </Link>
            <span className="text-caption text-secondary">Cửa hàng: M Studio</span>
          </div>

          {/* Menu Sidebar */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-sm text-body transition-colors ${
                    isActive
                      ? 'bg-background text-primary font-medium border border-border shadow-xs'
                      : 'text-secondary hover:text-primary hover:bg-background/50'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Link quay về cửa hàng chính */}
        <div className="p-4 border-t border-border">
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 text-caption text-secondary hover:text-primary transition-colors"
          >
            <span>← Về cửa hàng chính</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border px-8 flex items-center justify-between bg-background sticky top-0 z-30">
          <div className="text-body font-medium text-primary">Kênh Quản Trị Người Bán</div>
          <div className="flex items-center gap-4 text-caption text-secondary">
            <span>M Studio (Verified)</span>
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-semibold text-primary">
              M
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SellerLayout
