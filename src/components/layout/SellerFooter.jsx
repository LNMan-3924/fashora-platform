export default function SellerFooter({ shopName = 'M STUDIO', currency = 'VND (₫)' }) {
  return (
    <footer className="bg-black text-white px-4 sm:px-6 md:px-10 py-3.5 md:py-4 border-t border-neutral-900 text-[10px] md:text-[11px] text-neutral-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 text-center md:text-left">
        {/* Dòng trên khi mobile / Bên trái khi desktop */}
        <p className="tracking-wider">
          © 2026 FASHORA STUDIOS • SELLER CENTER ({shopName})
        </p>

        {/* Dòng dưới khi mobile / Bên phải khi desktop */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 tracking-wider uppercase text-[9px] md:text-[10px]">
          <span>CURRENCY: {currency}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-emerald-400">STORE STATUS: VERIFIED SELLER</span>
        </div>
      </div>
    </footer>
  )
}