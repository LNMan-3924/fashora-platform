import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Component BecomeSellerBanner: Khung quảng bá chương trình mở gian hàng người bán (Become A Seller)
 */
export default function BecomeSellerBanner() {
  return (
    <section
      aria-label="Become a Seller Promotion"
      className="w-full bg-[#111111] text-white rounded-[2px] px-6 sm:px-10 md:px-12 py-6 md:py-8 mb-6 transition-all shadow-xs"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A3A3A3] mb-1 font-mono">
            BECOME A SELLER
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-white leading-tight mb-1.5 font-sans">
            YOUR STYLE. YOUR STORE. YOUR FASHORA.
          </h2>
          <p className="text-xs sm:text-sm text-[#D4D4D4] font-normal leading-relaxed">
            Join FASHORA and bring your fashion collection to more shoppers.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            to="/become-seller"
            className="inline-flex items-center justify-center gap-1.5 bg-white text-[#111111] hover:bg-[#F0F0F0] text-xs font-bold uppercase tracking-[0.18em] px-7 py-3 rounded-[2px] transition-colors whitespace-nowrap"
          >
            <span>BECOME A SELLER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

