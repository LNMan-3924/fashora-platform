import { useTranslation } from 'react-i18next'

export default function SellerFooter({ shopName = 'MY ATELIER' }) {
  const { t } = useTranslation()
  return (
    <footer className="bg-black text-white px-4 sm:px-6 md:px-10 py-3.5 md:py-4 border-t border-neutral-900 text-[10px] md:text-[11px] text-neutral-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 text-center md:text-left">
        {/* Dòng trên khi mobile / Bên trái khi desktop */}
        <p className="tracking-wider">
          © 2026 FASHORA STUDIOS — {t('seller.center', 'SELLER CENTER')} ({shopName})
        </p>
      </div>
    </footer>
  )
}