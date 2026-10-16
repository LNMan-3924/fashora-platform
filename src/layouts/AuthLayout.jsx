import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111111]">
      {/* Ẩn Navigation và Hamburger menu theo đúng yêu cầu */}
      <Header hideNav={true} />

      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 bg-[#FFFFFF]">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}