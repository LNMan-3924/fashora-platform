import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckSquare, Square, Edit3, CheckCircle2, AlertCircle, Phone, MapPin, CreditCard } from 'lucide-react'
import { useOnboarding } from './BecomeSellerLayout'
import OnboardingStepper from './components/OnboardingStepper'
import UnifiedAccountBanner from './components/UnifiedAccountBanner'
import LiveStorefrontPreview from './components/LiveStorefrontPreview'
import { updateUserRoleToSeller, createOrUpdateShop, getShops } from '../../services/api'
import { safeBack } from '../../utils'

export default function BecomeSellerReview() {
  const navigate = useNavigate()
  const { formData, updateFormData, currentUser, updateCurrentUser, clearDraft } = useOnboarding()

  const [agreed, setAgreed] = useState(formData.agreedToTerms || false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Guard: If shopName is invalid, return to step 2
  useEffect(() => {
    if (!formData.shopName || formData.shopName.trim().length < 3) {
      navigate('/become-seller/info', { replace: true })
    }
  }, [formData.shopName, navigate])

  const cleanName = (formData.shopName || '').trim()
  const slug = cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'atelier-shop'

  const handleAgreementToggle = () => {
    const nextVal = !agreed
    setAgreed(nextVal)
    updateFormData({ agreedToTerms: nextVal })
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = async () => {
    if (!agreed) {
      setErrorMsg("Please acknowledge and agree to FASHORA's designer curation guidelines and terms.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // 0. Double-check collision with existing shops
      try {
        const shopsRes = await getShops()
        const existingShops = Array.isArray(shopsRes?.data) ? shopsRes.data : []
        const isCollision = existingShops.some(
          (s) =>
            (s.slug && s.slug === slug) ||
            (s.name && s.name.trim().toLowerCase() === cleanName.toLowerCase())
        )
        if (isCollision) {
          setErrorMsg(`The shop name "${cleanName}" or URL slug "${slug}" has already been claimed by another merchant. Please go back and pick a different name.`)
          setIsSubmitting(false)
          return
        }
      } catch (checkErr) {
        console.warn('Collision check notice:', checkErr)
      }

      const shopId = `shop_${slug}_${Date.now().toString().slice(-4)}`
      const sellerCode = 'SELLER #' + (slug || 'SHOP').toUpperCase().slice(0, 3) + '-' + Math.floor(1000 + Math.random() * 9000)
      const fullLocation = formData.shopAddress
        ? `${formData.shopAddress}, ${formData.shopCity || 'Vietnam'}`
        : (formData.shopCity || 'Vietnam')

      const shopData = {
        id: shopId,
        sellerCode: sellerCode,
        currency: 'VND (₫)',
        name: cleanName,
        slug: slug,
        tagline: formData.shopDescription ? formData.shopDescription.slice(0, 80) : 'Atelier Designer House',
        description: formData.shopDescription || `${cleanName} - Independent designer atelier on FASHORA.`,
        logo: formData.shopLogo || '/assets/logo.png',
        category: formData.shopCategory || 'FASHION & APPAREL',
        rating: 5.0,
        reviewsCount: 0,
        location: fullLocation,
        phone: formData.shopPhone || currentUser?.phoneNumber || '',
        payoutAccount: {
          bankName: formData.bankName || 'Vietcombank',
          accountNumber: formData.bankAccountNumber || '',
          accountName: formData.bankAccountName || currentUser?.fullName || '',
        },
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        status: 'ACTIVE',
        ownerId: currentUser?.id,
        ownerName: currentUser?.fullName,
        ownerEmail: currentUser?.email,
      }

      // 1. Tạo hoặc cập nhật Shop trên backend trước tiên để lấy đúng ID thực tế
      let savedShopId = shopId
      try {
        const shopRes = await createOrUpdateShop(shopData)
        if (shopRes?.data?.id) {
          savedShopId = shopRes.data.id
          shopData.id = savedShopId
        }
      } catch (shopErr) {
        console.warn('Shop sync backend notice:', shopErr)
      }

      // 2. Cập nhật quyền người dùng với chính xác ID shop vừa lưu
      if (currentUser?.id) {
        await updateUserRoleToSeller(currentUser.id, savedShopId)
      }

      // 3. Save to sessionStorage for Success screen
      sessionStorage.setItem('fashora_newly_registered_shop', JSON.stringify({
        ...shopData,
        id: savedShopId,
        sellerCode: sellerCode,
      }))

      // 4. Clear draft for current user
      if (clearDraft) {
        clearDraft()
      }

      // 5. Update AuthContext currentUser với savedShopId chính xác
      updateCurrentUser({
        roles: ['customer', 'seller'],
        shopId: savedShopId,
      })

      // 6. Navigate to Success screen
      navigate('/become-seller/success')
    } catch (err) {
      console.error('Error completing seller registration:', err)
      setErrorMsg('An error occurred while connecting to the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* 1. Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
          <Link to="/home" className="hover:text-black transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/become-seller" className="hover:text-black transition-colors">BECOME A SELLER</Link>
          <span>/</span>
          <span className="text-black font-semibold">REVIEW & SUBMIT</span>
        </nav>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-black">
            REVIEW YOUR SHOP
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Make sure everything looks correct before submitting your registration.
          </p>
        </div>
      </div>

      {/* 2. Top User Identity Banner */}
      <UnifiedAccountBanner currentUser={currentUser} compact={true} />

      {/* 3. Stepper */}
      <OnboardingStepper currentStep={3} />

      {/* 4. Review Content */}
      <div className="space-y-8">
        {/* Section 1: Storefront Shopper View Preview */}
        <div className="space-y-3">
          <LiveStorefrontPreview
            shopName={formData.shopName}
            shopCategory={formData.shopCategory}
            shopDescription={formData.shopDescription}
            shopLogo={formData.shopLogo}
            shopCity={formData.shopCity}
            shopPhone={formData.shopPhone}
            currentUser={currentUser}
            showLabel={false}
          />
        </div>

        {/* Section 2: Submitted Specifications Table */}
        <div className="border border-neutral-200 bg-white">
          <div className="px-5 py-3.5 bg-[#fafafa] border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-black">
              SUBMITTED SPECIFICATIONS
            </span>
            <button
              type="button"
              onClick={() => safeBack(navigate, '/become-seller/info')}
              className="text-xs font-mono text-neutral-600 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT ALL</span>
            </button>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {/* Shop Name */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0">
                SHOP NAME
              </span>
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="font-bold text-black uppercase tracking-wider">
                  {cleanName}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  SLUG: {slug}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0">
                CATEGORY
              </span>
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="font-medium text-black">
                  {formData.shopCategory || 'FASHION & APPAREL'}
                </span>
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 border border-neutral-200">
                  PRIMARY DISCIPLINE
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0 pt-0.5">
                DESCRIPTION
              </span>
              <div className="flex-1">
                <p className="text-neutral-700 leading-relaxed font-light">
                  {formData.shopDescription ? formData.shopDescription.trim() : 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Brand Emblem */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0">
                BRAND EMBLEM
              </span>
              <div className="flex-1 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white shrink-0 overflow-hidden">
                    {formData.shopLogo ? (
                      <img
                        src={formData.shopLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-serif font-bold">
                        {cleanName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-black truncate max-w-[200px]">
                      {formData.shopLogoName || (formData.shopLogo ? 'brand-emblem.png' : 'Monogram Iconogram')}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {formData.shopLogoSize || 'Auto-generated atelier identity'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </span>
              </div>
            </div>

            {/* Hotline Phone */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>HOTLINE</span>
              </span>
              <div className="flex-1">
                <span className="font-semibold text-black font-mono">
                  {formData.shopPhone || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Warehouse Dispatch Location */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>DISPATCH WAREHOUSE</span>
              </span>
              <div className="flex-1">
                <span className="text-black font-medium">
                  {formData.shopAddress ? `${formData.shopAddress}, ` : ''}{formData.shopCity || 'Vietnam'}
                </span>
              </div>
            </div>

            {/* Bank Payout Account */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>PAYOUT ACCOUNT</span>
              </span>
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="font-mono text-black font-medium">
                  {formData.bankName} • {formData.bankAccountNumber} ({formData.bankAccountName})
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  AUTO-SETTLEMENT
                </span>
              </div>
            </div>

            {/* Owner */}
            <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-neutral-500 font-mono uppercase text-[11px] w-48 shrink-0">
                LINKED OWNER
              </span>
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="font-medium text-black">
                  {currentUser?.fullName} ({currentUser?.email || currentUser?.phoneNumber})
                </span>
                <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5">
                  DUAL-ROLE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Agreement Notice & Checkbox */}
        <div
          onClick={handleAgreementToggle}
          className={`border p-4 sm:p-5 flex items-start gap-3.5 cursor-pointer transition-colors duration-150 select-none ${
            agreed ? 'border-black bg-neutral-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
          }`}
        >
          <div className="mt-0.5 text-black shrink-0">
            {agreed ? (
              <CheckSquare className="w-5 h-5 fill-black text-white" />
            ) : (
              <Square className="w-5 h-5 text-neutral-400" />
            )}
          </div>
          <div className="text-xs leading-relaxed">
            <p className="text-neutral-800 font-medium">
              By submitting your registration, you acknowledge that <span className="font-bold uppercase text-black">{cleanName}</span> will adhere to FASHORA's independent designer curation guidelines and automated settlement terms.
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 font-mono flex items-center gap-1.5 p-3 bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </p>
        )}

        {/* Section 4: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => navigate('/become-seller/info')}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-xs font-mono uppercase tracking-wider text-black hover:border-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EDIT DETAILS</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 group shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>PROCESSING REGISTRATION...</span>
              </>
            ) : (
              <>
                <span>SUBMIT REGISTRATION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
