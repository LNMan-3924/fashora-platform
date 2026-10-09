import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'

function CustomerLayout() {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 h-16 px-8 md:px-12 border-b border-border bg-background/90 backdrop-blur flex items-center justify-between">
        {/* Cụm Trái: Logo & Navigation */}
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="font-bold text-heading-2 tracking-tight text-primary">
            FASHORA
          </Link>

          <nav className="hidden md:flex items-center gap-8 md:gap-12 text-body">
            <NavLink
              to="/shop?tag=new"
              className={({ isActive }) =>
                `transition-colors hover:text-primary ${
                  isActive ? 'text-primary font-medium' : 'text-secondary'
                }`
              }
            >
              New Arrival
            </NavLink>
            <NavLink
              to="/shop?tag=best-seller"
              className={({ isActive }) =>
                `transition-colors hover:text-primary ${
                  isActive ? 'text-primary font-medium' : 'text-secondary'
                }`
              }
            >
              Best Seller
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `transition-colors hover:text-primary ${
                  isActive ? 'text-primary font-medium' : 'text-secondary'
                }`
              }
            >
              Shop
            </NavLink>
          </nav>
        </div>

        {/* Cụm Giữa/Phụ: Thanh Search tối giản */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-8">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-3 py-1.5 text-body bg-surface border border-border rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary text-primary"
            />
          </div>
        </div>

        {/* Cụm Phải: Vietnam, Wishlist, Cart, Account */}
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline text-caption text-secondary">Vietnam</span>

          {/* Wishlist / Heart */}
          <button
            type="button"
            aria-label="Danh sách yêu thích"
            className="p-1.5 text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* Cart Icon trỏ về /cart */}
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="p-1.5 text-secondary hover:text-primary transition-colors relative"
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

          {/* Account Icon trỏ về /profile kèm Menu chuyển đến Kênh người bán */}
          <div
            className="relative"
            onMouseEnter={() => setIsAccountMenuOpen(true)}
            onMouseLeave={() => setIsAccountMenuOpen(false)}
          >
            <Link
              to="/profile"
              aria-label="Tài khoản cá nhân"
              className="p-1.5 flex items-center text-secondary hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>

            {/* Menu chuyển nhanh khi tương tác */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full pt-2 w-48 z-50">
                <div className="bg-background border border-border shadow-sm rounded-sm py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-caption text-primary hover:bg-surface transition-colors"
                  >
                    Tài khoản của tôi
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-caption text-primary hover:bg-surface transition-colors"
                  >
                    Đơn hàng đã mua
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <Link
                    to="/seller/dashboard"
                    className="block px-4 py-2 text-caption font-medium text-primary hover:bg-surface transition-colors"
                  >
                    🏪 Kênh người bán
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer tối giản: Trắng/Đen/Xám */}
      <footer className="border-t border-border bg-surface text-secondary py-12 px-8 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-bold text-heading-2 text-primary tracking-tight block mb-3">
              FASHORA
            </span>
            <p className="text-caption text-secondary leading-relaxed">
              Nền tảng thời trang cao cấp với thiết kế tối giản, tinh tế và bền vững.
            </p>
          </div>

          <div>
            <h4 className="text-body font-semibold text-primary mb-3">Cửa hàng</h4>
            <ul className="space-y-2 text-caption">
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/shop?tag=new" className="hover:text-primary transition-colors">
                  Sản phẩm mới
                </Link>
              </li>
              <li>
                <Link to="/shop?tag=best-seller" className="hover:text-primary transition-colors">
                  Bán chạy nhất
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-body font-semibold text-primary mb-3">Khách hàng</h4>
            <ul className="space-y-2 text-caption">
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Thông tin cá nhân
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-body font-semibold text-primary mb-3">Tài khoản & Đối tác</h4>
            <ul className="space-y-2 text-caption">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Đăng nhập / Đăng ký
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-primary transition-colors">
                  Kênh người bán (Seller Center)
                </Link>
              </li>
              <li>
                <Link to="/store/m-studio" className="hover:text-primary transition-colors">
                  Public Storefront (M Studio)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-secondary">
          <p>© 2026 FASHORA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/shop" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/shop" className="hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomerLayout
