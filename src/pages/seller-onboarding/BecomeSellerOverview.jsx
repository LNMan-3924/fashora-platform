import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Store, Layers, PackageCheck, Shield, CreditCard, Truck } from 'lucide-react'
import { useOnboarding } from './BecomeSellerLayout'
import UnifiedAccountBanner from './components/UnifiedAccountBanner'

export default function BecomeSellerOverview() {
  const navigate = useNavigate()
  const { currentUser } = useOnboarding()

  const valueCards = [
    {
      num: '01',
      tag: 'IDENTITY',
      title: 'YOUR STORE',
      description: 'Create and manage your own fashion store and showcase your curated collections.',
      footer: 'BRAND PRESENCE & ATELIER BIO',
      icon: Store,
    },
    {
      num: '02',
      tag: 'CATALOG',
      title: 'MANAGE PRODUCTS',
      description: 'Add and manage your fashion products, inventory, size variants, and lookbooks.',
      footer: 'SIZE, STOCK, VARIANTS & LOOKBOOKS',
      icon: Layers,
    },
    {
      num: '03',
      tag: 'OPERATIONS',
      title: 'TRACK ORDERS',
      description: 'Manage customer orders, update delivery status, and review real-time revenue logs.',
      footer: 'FULFILLMENT, DISPATCH & REAL-TIME LOGS',
      icon: PackageCheck,
    },
  ]

  const requirements = [
    {
      step: '1',
      title: 'SHOP NAME',
      desc: 'Your unique storefront and designer brand name on FASHORA.',
    },
    {
      step: '2',
      title: 'SHOP DESCRIPTION',
      desc: 'A short aesthetic bio or manifesto describing your design identity.',
    },
    {
      step: '3',
      title: 'SHOP LOGO',
      desc: 'A square high-contrast emblem or atelier logo (PNG/JPG format, max 2MB).',
    },
  ]

  const trustPoints = [
    {
      title: 'MULTI-CURRENCY PAYOUTS',
      desc: 'Flexible settlements in USD, EUR, or VND via global gateways (Payoneer, Stripe) with transparent conversion rates.',
      icon: CreditCard,
    },
    {
      title: 'CROSS-BORDER IP SAFEGUARDS',
      desc: 'Maximum intellectual property protection and authentic designer brand safeguards when entering new global markets.',
      icon: Shield,
    },
    {
      title: 'END-TO-END FULFILLMENT / LOCAL REACH',
      desc: 'Automated customs clearance, streamlined cross-border logistics, and seamless direct connection to domestic and international fashion consumers.',
      icon: Truck,
    },
  ]

  return (
    <div className="w-full space-y-10">
      {/* 1. Breadcrumb & Header Hero */}
      <div>
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
          <Link to="/home" className="hover:text-black transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-black transition-colors">ACCOUNT</Link>
          <span>/</span>
          <span className="text-black font-semibold">BECOME A SELLER</span>
        </nav>

        <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-widest text-black">
            BECOME A SELLER
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-light max-w-xl mx-auto">
            Start your own store on FASHORA and bring your fashion collection to more shoppers worldwide.
          </p>
        </div>
      </div>

      {/* 2. 3 Value Cards (Atelier Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {valueCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.num}
              className="group relative bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:border-black transition-colors duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-2xl font-mono font-light text-neutral-300 group-hover:text-neutral-900 transition-colors">
                    {card.num}
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                  {card.tag}
                </span>
                <h3 className="text-base font-bold uppercase tracking-wider text-black mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-100">
                <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">
                  {card.footer}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Registration Process & "What You'll Need" */}
      <div className="bg-[#fafafa] border border-neutral-200 p-6 sm:p-8 space-y-8">
        {/* Progress pills indicator */}
        <div className="border-b border-neutral-200 pb-5 space-y-4">
          <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            <span>REGISTRATION PROCESS</span>
            <span className="text-neutral-300">•</span>
            <span>STEP 1 OF 4</span>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono uppercase tracking-wider text-center">
              <span className="bg-black text-white py-2 px-3 text-center font-bold">
                01 OVERVIEW
              </span>
              <span className="bg-white border border-neutral-200 text-neutral-400 py-2 px-3 text-center">
                02 SHOP INFO
              </span>
              <span className="bg-white border border-neutral-200 text-neutral-400 py-2 px-3 text-center">
                03 REVIEW
              </span>
              <span className="bg-white border border-neutral-200 text-neutral-400 py-2 px-3 text-center">
                04 COMPLETE
              </span>
            </div>
          </div>
        </div>

        {/* What you'll need checklist */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-wider text-black">
              WHAT YOU'LL NEED
            </h3>
          </div>

          <div className="space-y-3">
            {requirements.map((item) => (
              <div
                key={item.step}
                className="bg-white border border-neutral-200 p-4 flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="text-center pt-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/become-seller/info')}
              className="inline-flex items-center justify-center gap-2.5 bg-black text-white px-8 py-4 text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer shadow-sm group w-full sm:w-auto"
            >
              <span>START REGISTRATION</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Notice Banner (Dual-Role Unified Account) placed directly above Trust Points */}
      <div className="pt-2">
        <UnifiedAccountBanner currentUser={currentUser} />
      </div>

      {/* 5. Trust Badges / International & Domestic Selling Protections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-neutral-200">
        {trustPoints.map((point, index) => {
          const Icon = point.icon
          return (
            <div key={index} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5 stroke-[1.5]" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-1">
                  {point.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
