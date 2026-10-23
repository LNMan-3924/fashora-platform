import { Store, CheckCircle2, ExternalLink } from 'lucide-react'

export default function LiveStorefrontPreview({
  shopName = '',
  shopCategory = 'FASHION & APPAREL',
  shopDescription = '',
  shopLogo = '',
  currentUser,
  showLabel = true,
}) {
  const cleanName = shopName.trim() || 'YOUR STORE NAME'
  const initial = cleanName.charAt(0).toUpperCase() || 'F'
  const ownerName = currentUser?.fullName || 'Helena Vance'
  const slug = cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'your-shop-slug'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-neutral-800" />
            STOREFRONT SHOPPER VIEW PREVIEW
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            REAL-TIME ATELIER APPEARANCE
          </span>
        </div>
      )}

      {/* Storefront Shopper View Preview Card */}
      <div className="relative overflow-hidden bg-white border border-neutral-300 p-5 sm:p-6 shadow-xs transition-all duration-300">

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo or Auto-generated Monogram */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden text-white shadow-xs">
            {shopLogo ? (
              <img
                src={shopLogo}
                alt={cleanName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-serif font-black tracking-widest">
                  {initial}
                </span>
                <span className="text-[8px] font-mono tracking-widest uppercase opacity-60 mt-0.5">
                  EMBLEM
                </span>
              </div>
            )}
          </div>

          {/* Simulated Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-black truncate">
                {cleanName}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider bg-black text-white px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED ATELIER
              </span>
              <span className="text-[10px] font-mono tracking-wider border border-neutral-300 text-neutral-600 px-1.5 py-0.5">
                {shopCategory}
              </span>
            </div>

            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-3">
              {shopDescription.trim() ||
                'Brief description of your brand aesthetic, design philosophy, and curated collections...'}
            </p>

            {/* Sub-specs */}
            <div className="pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-neutral-500">
              <div>
                <span className="text-neutral-400">OWNER:</span>{' '}
                <span className="text-neutral-900 font-medium">{ownerName}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div>
                <span className="text-neutral-400">CURRENCY:</span>{' '}
                <span className="text-neutral-900 font-medium">VND (₫)</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1 text-neutral-700">
                <ExternalLink className="w-3 h-3 text-neutral-400" />
                <span>fashora.vn/store/{slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
