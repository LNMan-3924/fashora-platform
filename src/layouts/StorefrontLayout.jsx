import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

/**
 * Layout cho trang Cửa hàng công khai (Public Storefront):
 * - Sử dụng Header và Footer dùng chung chuẩn của toàn bộ hệ thống FASHORA.
 * - Cho phép khách hàng tìm kiếm sản phẩm, xem giỏ hàng và đăng nhập/tài khoản đồng bộ.
 * - Phần nội dung trang con (Storefront) hiển thị Edge-to-Edge tràn viền linh hoạt.
 */
export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      {/* 1. Header dùng chung của dự án */}
      <Header />

      {/* 2. Nội dung trang Public Shop */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* 3. Footer dùng chung của dự án */}
      <Footer />
    </div>
  )
}
