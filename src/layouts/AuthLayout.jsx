import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111111]">
      {/* Ẩn Navigation và Hamburger menu theo đúng yêu cầu */}
      <Header hideNav={true} />

      <main className="relative flex-1 flex items-center justify-center py-10 sm:py-16 px-4 bg-neutral-950 overflow-hidden">
        {/* Ảnh nền thời trang cao cấp: dàn đều toàn màn hình (bg-cover bg-center) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: "url('/images/background/authentication_bg.jpg')" }}
        />

        {/* Lớp phủ mờ bóng đen tăng cường tạo độ sâu và tương phản sắc sảo */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />

        {/* Nội dung form Login / Register */}
        <div className="relative z-10 w-full flex justify-center">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}