import { Link } from 'react-router-dom'

/**
 * Component ProfileHeader: Thanh điều hướng breadcrumb và tiêu đề trang Hồ sơ khách hàng
 */
export default function ProfileHeader() {
  return (
    <div className="mb-8 md:mb-12 border-b border-[#E5E5E5] pb-6">
      {/* 1. Thanh Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#888888] font-mono">
          <Link to="/home" className="hover:text-black transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">PROFILE</span>
        </div>
      </nav>

      {/* 2. Tiêu đề chính trang Profile và Lối tắt đến Following Shops */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight mb-2 uppercase">
            PROFILE
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] font-normal leading-relaxed">
            Manage your personal information and account details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/following"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:border-black text-xs font-mono uppercase tracking-wider text-neutral-700 hover:text-black transition-colors"
          >
            <span>FOLLOWING SHOPS</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
