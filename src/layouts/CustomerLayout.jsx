import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function CustomerLayout() {
  const location = useLocation();
  // Ẩn thanh sub-navigation bar (NEW ARRIVAL, BEST SELLER, ALL) trên các route Explore (gồm cả route gốc / và /explore)
  const isExploreRoute = location.pathname === '/' || location.pathname.startsWith('/explore');

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Header hideNav={isExploreRoute} />

      {/* ==========================================================================
         [GHI CHÚ CẬP NHẬT - 14/10/2026]
         - Chức năng: Mở rộng chiều ngang toàn màn hình (w-full).
         - Mục đích: Bỏ max-w-7xl, mx-auto và padding cứng để các trang con như Shop
           có thể hiển thị tràn viền (Edge-to-Edge) theo chuẩn editorial.
         ========================================================================== */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}