import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Header />

      {/* Thêm container giới hạn độ rộng để nội dung không bị bè ngang trên màn hình lớn */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}