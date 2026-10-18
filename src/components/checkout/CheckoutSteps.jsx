import { Link } from 'react-router-dom'

/**
 * Component CheckoutSteps: Hiển thị thanh breadcrumb và tiến trình 3 bước đặt hàng.
 * Bao gồm:
 * 1. Breadcrumbs điều hướng: HOME / SHOPPING CART / CHECKOUT
 * 2. Tiêu đề trang CHECKOUT phong cách tối giản chữ hoa
 * 3. Chỉ báo 3 bước: 1 Delivery Details, 2 Payment, 3 Review
 */
export default function CheckoutSteps() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
      {/* 1. Breadcrumb & Tiêu đề trang */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1 font-mono flex items-center gap-1.5"
        >
          <Link to="/home" className="hover:text-[#111111] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#111111] transition-colors">
            SHOPPING CART
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-semibold">CHECKOUT</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] uppercase text-[#111111]">
          CHECKOUT
        </h1>
      </div>

      {/* 2. Chỉ báo các bước tiến trình đặt hàng */}
      <div className="flex items-center gap-2 sm:gap-6 text-[11px] uppercase tracking-[0.2em] overflow-x-auto no-scrollbar py-1">
        {/* Bước 1: Thông tin giao hàng */}
        <div className="flex items-center gap-2 text-[#111111] font-semibold shrink-0">
          <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono">
            1
          </span>
          <span>Delivery Details</span>
        </div>

        <span className="text-neutral-300 shrink-0">———</span>

        {/* Bước 2: Thanh toán */}
        <div className="flex items-center gap-2 text-neutral-400 shrink-0">
          <span className="w-5 h-5 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center text-[10px] font-mono">
            2
          </span>
          <span>Payment</span>
        </div>

        <span className="text-neutral-300 shrink-0">———</span>

        {/* Bước 3: Xem lại đơn hàng */}
        <div className="flex items-center gap-2 text-neutral-400 shrink-0">
          <span className="w-5 h-5 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center text-[10px] font-mono">
            3
          </span>
          <span>Review</span>
        </div>
      </div>
    </div>
  )
}

