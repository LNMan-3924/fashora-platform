import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload, AlertCircle, Phone, MapPin, Save, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateShop } from '../../services/api'
import { uploadImage } from '../../utils/imageUpload'
import { Toast } from '../../components/common'

const CATEGORIES = [
  'ALL-IN-ONE FASHION',
  'READY-TO-WEAR & APPAREL',
  'ATELIER & BESPOKE TAILORING',
  'FOOTWEAR & LEATHER GOODS',
  'ACCESSORIES & JEWELRY',
  'SUSTAINABLE & VINTAGE FASHION',
]

const getCategoryLabel = (category, lang) => {
  if (lang !== 'vi') return category
  const map = {
    'ALL-IN-ONE FASHION': 'THỜI TRANG TỔNG HỢP',
    'READY-TO-WEAR & APPAREL': 'THỜI TRANG MAY SẴN & TRANG PHỤC',
    'ATELIER & BESPOKE TAILORING': 'MAY ĐO CAO CẤP ATELIER',
    'FOOTWEAR & LEATHER GOODS': 'GIÀY DÉP & ĐỒ DA THỦ CÔNG',
    'ACCESSORIES & JEWELRY': 'PHỤ KIỆN & TRANG SỨC',
    'SUSTAINABLE & VINTAGE FASHION': 'THỜI TRANG BỀN VỮNG & CỔ ĐIỂN',
  }
  return map[category] || category
}

const BANKS = [
  'Vietcombank (VCB)',
  'Techcombank (TCB)',
  'MB Bank (MB)',
  'VPBank',
  'ACB',
  'BIDV',
  'VietinBank',
  'TPBank',
  'Sacombank',
  'HDBank',
]

function SettingsForm({ sellerInfo, setSellerInfo, currentShopId, currentUser }) {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [formData, setFormData] = useState(() => ({
    name: sellerInfo?.shopName || '',
    tagline: sellerInfo?.tagline || '',
    description: sellerInfo?.description || '',
    category: sellerInfo?.category || 'ALL-IN-ONE FASHION',
    logo: sellerInfo?.logo || '/assets/logo.png',
    coverImage: sellerInfo?.coverImage || '',
    phone: sellerInfo?.phone || '',
    location: sellerInfo?.location || '',
    bankName: sellerInfo?.payoutAccount?.bankName || 'Vietcombank (VCB)',
    bankAccountNumber: sellerInfo?.payoutAccount?.accountNumber || '',
    bankAccountName: sellerInfo?.payoutAccount?.accountName || currentUser?.fullName || '',
  }))

  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isCoverRemoved, setIsCoverRemoved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogoUpload = async (file) => {
    if (!file) return
    setIsUploading(true)
    setErrorMessage('')

    try {
      const res = await uploadImage(file, { folder: 'shops' })
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          logo: res.url,
        }))
      }
    } catch (err) {
      console.warn('Upload image fallback:', err)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          logo: e.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverUpload = async (file) => {
    if (!file) return
    setIsUploadingCover(true)
    setIsCoverRemoved(false)
    setErrorMessage('')

    try {
      const res = await uploadImage(file, { folder: 'shops' })
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: res.url,
        }))
      }
    } catch (err) {
      console.warn('Upload cover image fallback:', err)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          coverImage: e.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleRemoveCover = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: '',
    }))
    setIsCoverRemoved(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const trimmedName = formData.name.trim()
    if (!trimmedName || trimmedName.length < 3) {
      setErrorMessage(t('seller.settings.errorName', 'Shop name must be at least 3 characters.'))
      return
    }

    setIsSaving(true)

    try {
      // Giữ nguyên ảnh bìa hiện tại nếu người dùng không chủ động nhấn REMOVE
      let resolvedCover = formData.coverImage
      if (!isCoverRemoved && !resolvedCover && sellerInfo?.coverImage) {
        resolvedCover = sellerInfo.coverImage
      }

      const payload = {
        name: trimmedName,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        category: formData.category,
        logo: formData.logo,
        coverImage: resolvedCover || '',
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        payoutAccount: {
          bankName: formData.bankName,
          accountNumber: formData.bankAccountNumber.trim(),
          accountName: formData.bankAccountName.trim(),
        },
      }

      const shopId = currentShopId || sellerInfo?.shopId || sellerInfo?.id
      if (shopId) {
        await updateShop(shopId, payload)
      }

      if (setSellerInfo) {
        setSellerInfo({
          shopName: trimmedName,
          ...payload,
        })
      }

      setToastMessage(t('seller.settings.successToast', 'Store settings updated successfully!'))
    } catch (err) {
      console.error('Error updating shop settings:', err)
      setErrorMessage(t('seller.settings.errorSave', 'Failed to save shop settings. Please check backend connection.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">


      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Brand & Atelier Specifications */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
              {t('seller.settings.brandSection', '01 • BRAND PROFILE')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.shopName', 'SHOP NAME')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.category', 'PRIMARY CATEGORY')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c, i18n.language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tagline */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.tagline', 'TAGLINE')}
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder={t('seller.settings.taglinePlaceholder', 'e.g. Modern Tailoring & Monochromatic Atelier')}
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.description', 'STORE BIO & DESCRIPTION')}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black resize-none"
              />
            </div>

            {/* Logo Emblem Upload */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.logo', 'SHOP LOGO EMBLEM')}
              </label>
              <div className="flex items-center gap-4 pt-1">
                <div className="w-14 h-14 bg-black text-white shrink-0 overflow-hidden flex items-center justify-center border border-neutral-300 rounded-[2px] shadow-2xs">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold font-serif">
                      {formData.name.charAt(0) || 'F'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer rounded-[2px]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? t('seller.products.form.uploading', 'Uploading...') : t('seller.settings.uploadAvatar', 'UPLOAD NEW AVATAR')}</span>
                  </button>
                  <p className="text-[11px] font-mono text-neutral-400">
                    {t('seller.settings.uploadAvatarHint', 'PNG, JPG, or WEBP (Saved directly to atelier storage)')}
                  </p>
                </div>
              </div>
            </div>
            {/* Storefront Cover Banner Upload */}
            <div className="space-y-2 md:col-span-2 pt-4 border-t border-neutral-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black block">
                  {t('seller.settings.cover', 'STOREFRONT COVER BANNER')}
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {t('seller.settings.coverHint', 'Recommended: Widescreen Landscape (16:9 or 21:9)')}
                </span>
              </div>

              {/* Cover Preview Box */}
              <div className="relative w-full h-56 sm:h-64 md:h-72 aspect-[21/9] min-h-[220px] sm:min-h-[260px] bg-neutral-900 border border-neutral-300 rounded-[2px] overflow-hidden flex items-center justify-center group">
                {formData.coverImage ? (
                  <>
                    <img
                      src={formData.coverImage}
                      alt="Storefront Cover Banner"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer rounded-[2px] shadow-sm font-semibold"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('seller.settings.changeBanner', 'CHANGE BANNER')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white text-xs font-mono uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer rounded-[2px] shadow-sm font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('seller.settings.remove', 'REMOVE')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto" />
                    <p className="text-xs font-mono text-neutral-400">
                      {t('seller.settings.noCover', 'No cover banner uploaded. Your atelier will display a minimalist dark background.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer rounded-[2px] font-semibold mt-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingCover ? t('seller.products.form.uploading', 'UPLOADING...') : t('seller.settings.uploadCover', 'UPLOAD COVER BANNER')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden file input for cover */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverUpload(file)
                  e.target.value = ''
                }}
                className="hidden"
              />

              <p className="text-[11px] font-mono text-neutral-400">
                {t('seller.settings.coverNotice', 'This banner will showcase your atelier lookbook across your Public Shop header and the Home page carousel.')}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Logistics & Operations */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
              {t('seller.settings.contactSection', '02 • CONTACT & SHIPPING LOCATION')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Hotline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{t('seller.settings.hotline', 'HOTLINE / CONTACT PHONE')}</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+84 912 345 678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Location Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('seller.settings.warehouse', 'DISPATCH / WAREHOUSE LOCATION')}</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="128 Le Duan, District 1, Ho Chi Minh City"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Settlement Bank Account */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
              {t('seller.settings.payoutSection', '03 • PAYOUT SETTINGS')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bank Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.bank', 'SETTLEMENT BANK')}
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase"
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.accountNumber', 'ACCOUNT NUMBER')}
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                placeholder="e.g. 0123456789"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black font-mono"
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {t('seller.settings.accountName', 'ACCOUNT HOLDER NAME')}
              </label>
              <input
                type="text"
                value={formData.bankAccountName}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankAccountName: e.target.value }))}
                placeholder="e.g. NGUYEN VAN A"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('seller.settings.saving', 'SAVING CHANGES...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('seller.settings.save', 'SAVE CHANGES')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const { sellerInfo, setSellerInfo, currentShopId } = useOutletContext() || {}
  const { currentUser } = useAuth()

  if (!sellerInfo) {
    return (
      <div className="p-12 text-center text-xs font-mono text-neutral-400">
        {t('seller.settings.loading', 'LOADING ATELIER PROFILE...')}
      </div>
    )
  }

  return (
    <SettingsForm
      key={sellerInfo.id || sellerInfo.shopId || 'settings-form'}
      sellerInfo={sellerInfo}
      setSellerInfo={setSellerInfo}
      currentShopId={currentShopId}
      currentUser={currentUser}
    />
  )
}
