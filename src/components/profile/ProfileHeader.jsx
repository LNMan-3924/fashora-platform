import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Component ProfileHeader: Thanh điều hướng breadcrumb và tiêu đề trang Hồ sơ khách hàng
 */
export default function ProfileHeader() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const followingCount = Array.isArray(currentUser?.followingShops)
    ? currentUser.followingShops.length
    : 0

  return (
    <div className="mb-8 md:mb-12 border-b border-[#E5E5E5] pb-6">
      {/* 1. Thanh Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#888888] font-mono">
          <Link to="/home" className="hover:text-black transition-colors">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">{t('profile.pageTitle')}</span>
        </div>
      </nav>

      {/* 2. Tiêu đề chính trang Profile và Lối tắt đến Following Shops */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111111] tracking-tight mb-2 uppercase font-sans">
            {t('profile.pageTitle')}
          </h1>
          <p className="text-sm sm:text-base text-[#666666] font-normal leading-relaxed mt-1">
            {t('profile.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/following"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:border-black text-xs font-mono uppercase tracking-wider text-neutral-700 hover:text-black transition-colors rounded-[2px]"
          >
            <span>{t('profile.followingShops', { count: followingCount })}</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
