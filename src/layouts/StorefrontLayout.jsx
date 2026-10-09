import { Outlet, Link } from 'react-router-dom'

function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      {/* Header Storefront */}
      <header className="sticky top-0 z-50 h-16 px-8 md:px-12 border-b border-border bg-background/90 backdrop-blur flex items-center justify-between">
        {/* Thông tin Storefront */}
        <div className="flex items-center gap-4">
          <Link to="/store/m-studio" className="flex items-center gap-2">
            <span className="font-bold text-heading-2 tracking-tight text-primary">
              M STUDIO
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-surface border border-border text-secondary font-medium px-2 py-0.5 rounded-sm">
              STOREFRONT
            </span>
          </Link>
          <span className="hidden sm:inline text-caption text-secondary">
            Minimalist Contemporary Fashion
          </span>
        </div>

        {/* Nút chuyển đổi góc nhìn hoặc quay lại Fashora Platform */}
        <div className="flex items-center gap-4 text-caption">
          {/* Nút chuyển đổi góc nhìn quản trị */}
          <Link
            to="/seller/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm text-secondary hover:text-primary hover:bg-surface transition-colors font-medium"
          >
            <span>Quản trị gian hàng</span>
            <span className="text-[10px] bg-primary text-background px-1.5 py-0.2 rounded-xs">Seller</span>
          </Link>

          {/* Nút quay lại nền tảng chính */}
          <Link
            to="/shop"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface hover:bg-border/40 text-primary transition-colors font-medium border border-border"
          >
            <span>← Quay lại Fashora</span>
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="p-1.5 text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.434 1.119 1.007z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Storefront Footer */}
      <footer className="border-t border-border bg-surface text-secondary py-8 px-8 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-caption">
          <p>© 2026 M Studio Storefront. Được vận hành trên nền tảng FASHORA.</p>
          <div className="flex items-center gap-4">
            <Link to="/seller/dashboard" className="hover:text-primary transition-colors">
              Kênh người bán
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Fashora Platform
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default StorefrontLayout
