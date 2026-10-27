import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, ArrowRight, Home, ExternalLink } from 'lucide-react'
import { useOnboarding } from './BecomeSellerLayout'
import OnboardingStepper from './components/OnboardingStepper'

export default function BecomeSellerSuccess() {
  const navigate = useNavigate()
  const { formData, clearDraft, currentUser } = useOnboarding()

  const [shopDetails] = useState(() => {
    try {
      const saved = sessionStorage.getItem('fashora_newly_registered_shop')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return {
      name: formData.shopName || 'YOUR STORE',
      category: formData.shopCategory || 'FASHION & APPAREL',
      slug: (formData.shopName || 'atelier').toLowerCase().replace(/\s+/g, '-'),
      logo: formData.shopLogo || '',
      location: formData.shopCity || 'Vietnam',
      phone: formData.shopPhone || '',
      sellerCode: 'SELLER #FS-2026',
    }
  })

  // Clean up draft upon successful activation
  useEffect(() => {
    clearDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initial = (shopDetails.name || 'F').charAt(0).toUpperCase()
  const displayName = currentUser?.fullName || 'Valued Member'
  const displayEmail = currentUser?.email || currentUser?.phoneNumber || 'customer@fashora.com'

  return (
    <div className="w-full space-y-8">
      {/* 1. Emerald Top Banner */}
      <div className="w-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-mono tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="uppercase font-semibold">
          UNIFIED ATELIER PORTAL: CUSTOMER & MERCHANT DUAL-MODE ACTIVE
        </span>
      </div>

      {/* 2. Breadcrumb */}
      <div>
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
          <Link to="/home" className="hover:text-black transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-black transition-colors">ACCOUNT</Link>
          <span>/</span>
          <span className="text-black font-semibold">SUCCESS</span>
        </nav>
      </div>

      {/* 3. Stepper */}
      <OnboardingStepper currentStep={4} />

      {/* 4. Hero Completion Check */}
      <div className="text-center max-w-xl mx-auto space-y-4 pt-2">
        <div className="w-16 h-16 bg-black text-white rounded-full mx-auto flex items-center justify-center shadow-md animate-in zoom-in-50 duration-300">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Check className="w-3.5 h-3.5" />
          <span>CUSTOMER + SELLER ACCOUNT ACTIVE</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-black">
            YOU'RE READY TO SELL!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-md mx-auto">
            Your seller account has been created.
            Your shop <span className="font-bold text-black uppercase">"{shopDetails.name}"</span> is ready to use.
          </p>
        </div>
      </div>

      {/* 5. Summary Card: Atelier Identity */}
      <div className="max-w-2xl mx-auto bg-white border border-neutral-300 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-white flex items-center justify-center shrink-0 overflow-hidden">
              {shopDetails.logo ? (
                <img
                  src={shopDetails.logo}
                  alt={shopDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-serif font-black">{initial}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-black">
                  {shopDetails.name}
                </h3>
                <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5">
                  DESIGNER ATELIER
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
                CATEGORY: {shopDetails.category}
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-mono text-neutral-400 block">SELLER CODE</span>
            <span className="text-xs font-mono font-bold text-black">{shopDetails.sellerCode}</span>
          </div>
        </div>

        {/* Details Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono border-b border-neutral-100 pb-5">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">MERCHANT OWNER</span>
            <span className="font-bold text-black text-xs mt-0.5 block">{displayName}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">LINKED CUSTOMER ID</span>
            <span className="font-medium text-neutral-700 text-xs mt-0.5 block truncate">{displayEmail}</span>
          </div>
          {shopDetails.location && (
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">DISPATCH LOCATION</span>
              <span className="font-medium text-neutral-800 text-xs mt-0.5 block truncate">{shopDetails.location}</span>
            </div>
          )}
          {shopDetails.payoutAccount?.bankName && (
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">PAYOUT BANK</span>
              <span className="font-medium text-neutral-800 text-xs mt-0.5 block truncate">{shopDetails.payoutAccount.bankName}</span>
            </div>
          )}
          <div className="sm:col-span-2">
            <span className="text-neutral-400 block text-[10px] uppercase">ATELIER URI</span>
            <Link
              to={`/store/${shopDetails.slug}`}
              className="inline-flex items-center gap-1.5 text-black hover:underline mt-0.5 font-bold"
            >
              <span>fashora.vn/store/{shopDetails.slug}</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* 3 Active Privileges */}
        <div className="space-y-2.5 text-xs text-neutral-700">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-black font-semibold">Product Catalog:</strong> 0 Active Items (Ready to publish first collection)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-black font-semibold">Settlement & Payouts:</strong> Automated VND (₫) Settlement Enabled
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-black font-semibold">Unified Privileges:</strong> Continue shopping and check out using the same profile
            </span>
          </div>
        </div>
      </div>

      {/* 6. Dual Action Buttons */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate('/seller/dashboard')}
          className="w-full sm:w-auto px-8 py-4 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
        >
          <span>GO TO SELLER DASHBOARD</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="w-full sm:w-auto px-8 py-4 border border-neutral-300 text-black text-xs font-mono uppercase tracking-widest hover:border-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </button>
      </div>

      {/* Footer Subtext */}
      <div className="text-center text-[10px] font-mono text-neutral-400">
        NO SECONDARY LOGIN REQUIRED • SESSION ACTIVE AS {displayName.toUpperCase()}
      </div>
    </div>
  )
}
