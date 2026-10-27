import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, X, AlertCircle, Phone, MapPin, CreditCard } from 'lucide-react'
import { useOnboarding } from './BecomeSellerLayout'
import OnboardingStepper from './components/OnboardingStepper'
import UnifiedAccountBanner from './components/UnifiedAccountBanner'
import LiveStorefrontPreview from './components/LiveStorefrontPreview'
import { getShops } from '../../services/api'
import { safeBack } from '../../utils'
import { uploadImage } from '../../utils/imageUpload'

export default function BecomeSellerInfo() {
  const navigate = useNavigate()
  const { formData, updateFormData, currentUser } = useOnboarding()
  const fileInputRef = useRef(null)

  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoInputType, setLogoInputType] = useState('file') // 'file' | 'url'
  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [existingShops, setExistingShops] = useState([])

  const CATEGORIES = [
    'ALL-IN-ONE FASHION',
    'READY-TO-WEAR & APPAREL',
    'ATELIER & BESPOKE TAILORING',
    'FOOTWEAR & LEATHER GOODS',
    'ACCESSORIES & JEWELRY',
    'SUSTAINABLE & VINTAGE FASHION',
  ]

  const CITIES = [
    'Ho Chi Minh City',
    'Ha Noi',
    'Da Nang',
    'Can Tho',
    'Hai Phong',
    'Binh Duong',
    'Dong Nai',
    'Hue',
    'Nha Trang',
    'Quang Ninh',
  ]

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

  // Tải danh sách các shop hiện có để kiểm tra trùng tên / slug (Collision check)
  useEffect(() => {
    let isMounted = true
    getShops()
      .then((res) => {
        if (!isMounted) return
        const list = Array.isArray(res?.data) ? res.data : []
        setExistingShops(list)
      })
      .catch((err) => {
        console.warn('Could not fetch existing shops for uniqueness check:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Helper chuyển đổi tên sang slug
  const generateSlug = (name) => {
    return (name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Validate form
  const validate = () => {
    const errs = {}
    const trimmedName = (formData.shopName || '').trim()

    // 1. Tên shop
    if (!trimmedName) {
      errs.shopName = 'Please enter a shop name.'
    } else if (trimmedName.length < 3) {
      errs.shopName = 'Shop name must be at least 3 characters.'
    } else if (trimmedName.length > 50) {
      errs.shopName = 'Shop name cannot exceed 50 characters.'
    } else {
      const candidateSlug = generateSlug(trimmedName)
      const isTaken = existingShops.some(
        (s) =>
          (s.slug && s.slug === candidateSlug) ||
          (s.name && s.name.trim().toLowerCase() === trimmedName.toLowerCase())
      )
      if (isTaken) {
        errs.shopName = `The shop name "${trimmedName}" or slug "${candidateSlug}" is already taken by another merchant.`
      }
    }

    // 2. Mô tả
    if (formData.shopDescription && formData.shopDescription.length > 300) {
      errs.shopDescription = 'Description cannot exceed 300 characters.'
    }

    // 3. Số điện thoại hotline
    const phone = (formData.shopPhone || '').trim()
    if (!phone) {
      errs.shopPhone = 'Please enter a shop contact hotline.'
    } else if (!/^[0-9+() -]{8,15}$/.test(phone)) {
      errs.shopPhone = 'Please enter a valid phone number (8-15 digits).'
    }

    // 4. Địa chỉ kho lấy hàng
    const address = (formData.shopAddress || '').trim()
    if (!address) {
      errs.shopAddress = 'Please enter a warehouse / pickup dispatch address.'
    } else if (address.length < 5) {
      errs.shopAddress = 'Detailed address must be at least 5 characters.'
    }

    // 5. Tài khoản ngân hàng nhận tiền quyết toán
    const bankAcc = (formData.bankAccountNumber || '').trim()
    if (!bankAcc) {
      errs.bankAccountNumber = 'Please enter a bank account number for payouts.'
    } else if (bankAcc.length < 6) {
      errs.bankAccountNumber = 'Bank account number must be at least 6 digits.'
    }

    const bankAccName = (formData.bankAccountName || '').trim()
    if (!bankAccName) {
      errs.bankAccountName = 'Please enter the bank account holder name.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Real-time validation for Shop Name
  const handleNameChange = (e) => {
    const value = e.target.value
    if (value.length <= 50) {
      updateFormData({ shopName: value })
      const trimmed = value.trim()
      if (trimmed.length > 0 && trimmed.length < 3) {
        setErrors((prev) => ({ ...prev, shopName: 'Shop name must be at least 3 characters.' }))
      } else if (trimmed.length >= 3) {
        const candidateSlug = generateSlug(trimmed)
        const isTaken = existingShops.some(
          (s) =>
            (s.slug && s.slug === candidateSlug) ||
            (s.name && s.name.trim().toLowerCase() === trimmed.toLowerCase())
        )
        if (isTaken) {
          setErrors((prev) => ({
            ...prev,
            shopName: `The shop name "${trimmed}" or slug "${candidateSlug}" is already taken.`,
          }))
        } else {
          setErrors((prev) => ({ ...prev, shopName: null }))
        }
      } else {
        setErrors((prev) => ({ ...prev, shopName: null }))
      }
    }
  }

  const handleDescriptionChange = (e) => {
    const value = e.target.value
    if (value.length <= 300) {
      updateFormData({ shopDescription: value })
      if (errors.shopDescription) {
        setErrors((prev) => ({ ...prev, shopDescription: null }))
      }
    }
  }

  // Handle Logo file upload (Lưu file tĩnh vào public/images/shops/ thay vì Base64 khổng lồ)
  const handleFile = async (file) => {
    if (!file) return

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name)

    if (!isImage) {
      setErrors((prev) => ({
        ...prev,
        shopLogo: 'Please upload a valid image file (.jpg, .jpeg, .png, .webp).',
      }))
      return
    }

    setIsUploadingLogo(true)
    setErrors((prev) => ({ ...prev, shopLogo: null }))

    try {
      // 1. Tải ảnh lên máy chủ lưu vào thư mục public/images/shops/
      const result = await uploadImage(file, { folder: 'shops' })
      if (result?.url) {
        updateFormData({
          shopLogo: result.url,
          shopLogoName: file.name,
          shopLogoSize: `${(file.size / 1024).toFixed(0)} KB (Saved as static asset)`,
        })
      }
    } catch (uploadErr) {
      console.warn('Vite upload middleware notice, falling back to data URL:', uploadErr)
      // Dự phòng an toàn nếu upload endpoint không phản hồi
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result
        updateFormData({
          shopLogo: dataUrl,
          shopLogoName: file.name,
          shopLogoSize: `${(file.size / 1024).toFixed(0)} KB`,
        })
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleUrlSubmit = () => {
    if (!logoUrlInput.trim()) return
    updateFormData({
      shopLogo: logoUrlInput.trim(),
      shopLogoName: 'Cloud Logo Emblem',
      shopLogoSize: 'External URL',
    })
    setLogoUrlInput('')
  }

  const handleRemoveLogo = () => {
    updateFormData({
      shopLogo: '',
      shopLogoName: '',
      shopLogoSize: '',
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      navigate('/become-seller/review')
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
          <span className="text-black font-semibold">SHOP INFORMATION</span>
        </nav>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-black">
            SHOP INFORMATION
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light">
            Set up your public storefront specifications, operational dispatch address, and atelier payout details.
          </p>
        </div>
      </div>

      {/* 2. Top User Identity Banner */}
      <UnifiedAccountBanner currentUser={currentUser} compact={true} />

      {/* 3. Stepper */}
      <OnboardingStepper currentStep={2} />

      {/* 4. Form & Live Storefront Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-neutral-200 p-6 sm:p-8">
            {/* PHẦN 1: THƯƠNG HIỆU GIAN HÀNG */}
            <div className="border-b border-neutral-100 pb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                01 • BRAND SPECIFICATIONS
              </span>
            </div>

            {/* Field: Shop Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="shopName"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                >
                  SHOP NAME <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  {(formData.shopName || '').length} / 50
                </span>
              </div>
              <input
                id="shopName"
                type="text"
                value={formData.shopName || ''}
                onChange={handleNameChange}
                placeholder="e.g. ATELIER VANCE, MAISON NOIR..."
                className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors ${
                  errors.shopName ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                }`}
              />
              {errors.shopName && (
                <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.shopName}
                </p>
              )}
            </div>

            {/* Field: Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="shopCategory"
                className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
              >
                SHOP CATEGORY <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="shopCategory"
                  value={formData.shopCategory || CATEGORIES[0]}
                  onChange={(e) => updateFormData({ shopCategory: e.target.value })}
                  className="w-full bg-white border border-neutral-300 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase tracking-wider appearance-none cursor-pointer truncate"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field: Shop Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="shopDescription"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2"
                >
                  <span>SHOP DESCRIPTION</span>
                  <span className="text-[10px] font-mono text-neutral-400 border border-neutral-200 px-1.5 py-0.2">
                    OPTIONAL
                  </span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  {(formData.shopDescription || '').length} / 300
                </span>
              </div>
              <textarea
                id="shopDescription"
                rows={3}
                value={formData.shopDescription || ''}
                onChange={handleDescriptionChange}
                placeholder="Brief description of your brand aesthetic, design philosophy, and curated collections..."
                className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors resize-none ${
                  errors.shopDescription ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                }`}
              />
              {errors.shopDescription && (
                <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.shopDescription}
                </p>
              )}
            </div>

            {/* Field: Shop Logo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <span>SHOP LOGO</span>
                  <span className="text-[10px] font-mono text-neutral-400 border border-neutral-200 px-1.5 py-0.2">
                    OPTIONAL
                  </span>
                </label>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setLogoInputType('file')}
                    className={`cursor-pointer underline-offset-2 ${
                      logoInputType === 'file' ? 'underline font-bold text-black' : 'text-neutral-400'
                    }`}
                  >
                    Upload File
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() => setLogoInputType('url')}
                    className={`cursor-pointer underline-offset-2 ${
                      logoInputType === 'url' ? 'underline font-bold text-black' : 'text-neutral-400'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {formData.shopLogo ? (
                <div className="bg-[#fbfbfb] border border-neutral-300 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 bg-black border border-neutral-800 shrink-0 overflow-hidden">
                      <img
                        src={formData.shopLogo}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-black truncate">
                        {formData.shopLogoName || 'brand-emblem.jpg'}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        {formData.shopLogoSize || 'Uploaded'} • Verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveLogo()
                        setTimeout(() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                            fileInputRef.current.click()
                          }
                        }, 50)
                      }}
                      className="text-[10px] font-mono uppercase underline text-neutral-500 hover:text-black cursor-pointer px-1 py-1"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : logoInputType === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      const selected = e.target.files?.[0]
                      if (selected) {
                        handleFile(selected)
                      }
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                        fileInputRef.current.click()
                      }
                    }}
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors duration-150 ${
                      isDragging
                        ? 'border-black bg-neutral-50'
                        : 'border-neutral-300 hover:border-black bg-[#fafafa]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-2xs">
                        <Upload className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-black">
                          {isUploadingLogo ? 'UPLOADING STATIC FILE...' : 'UPLOAD LOGO EMBLEM'}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-400">
                          PNG / JPG / WEBP, saved directly to atelier storage
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 bg-white border border-neutral-300 px-3.5 py-2.5 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="bg-black text-white px-4 py-2.5 text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
              )}

              {errors.shopLogo && (
                <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.shopLogo}
                </p>
              )}
            </div>

            {/* PHẦN 2: THÔNG TIN VẬN HÀNH & KHO HÀNG */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <div className="border-b border-neutral-100 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                  02 • LOGISTICS & WAREHOUSE DISPATCH
                </span>
              </div>

              {/* Hotline Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="shopPhone"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>HOTLINE / CONTACT PHONE</span> <span className="text-red-500">*</span>
                </label>
                <input
                  id="shopPhone"
                  type="tel"
                  value={formData.shopPhone || ''}
                  onChange={(e) => {
                    updateFormData({ shopPhone: e.target.value })
                    if (errors.shopPhone) setErrors((prev) => ({ ...prev, shopPhone: null }))
                  }}
                  placeholder="e.g. +84 912 345 678"
                  className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors ${
                    errors.shopPhone ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                  }`}
                />
                {errors.shopPhone && (
                  <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.shopPhone}
                  </p>
                )}
              </div>

              {/* City Selection */}
              <div className="space-y-1.5">
                <label
                  htmlFor="shopCity"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>CITY / PROVINCE</span> <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="shopCity"
                    value={formData.shopCity || CITIES[0]}
                    onChange={(e) => updateFormData({ shopCity: e.target.value })}
                    className="w-full bg-white border border-neutral-300 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase tracking-wider appearance-none cursor-pointer truncate"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Detailed Warehouse Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="shopAddress"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                >
                  <span>PICKUP / WAREHOUSE DISPATCH ADDRESS</span> <span className="text-red-500">*</span>
                </label>
                <input
                  id="shopAddress"
                  type="text"
                  value={formData.shopAddress || ''}
                  onChange={(e) => {
                    updateFormData({ shopAddress: e.target.value })
                    if (errors.shopAddress) setErrors((prev) => ({ ...prev, shopAddress: null }))
                  }}
                  placeholder="e.g. 128 Le Duan Boulevard, Ben Nghe Ward, District 1"
                  className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors ${
                    errors.shopAddress ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                  }`}
                />
                {errors.shopAddress && (
                  <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.shopAddress}
                  </p>
                )}
              </div>
            </div>

            {/* PHẦN 3: TÀI KHOẢN NGÂN HÀNG QUYẾT TOÁN */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <div className="border-b border-neutral-100 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                  03 • AUTOMATED PAYOUT & SETTLEMENT ACCOUNT
                </span>
              </div>

              {/* Bank Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="bankName"
                  className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>SETTLEMENT BANK</span> <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="bankName"
                    value={formData.bankName || BANKS[0]}
                    onChange={(e) => updateFormData({ bankName: e.target.value })}
                    className="w-full bg-white border border-neutral-300 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-black focus:outline-none focus:border-black uppercase tracking-wider appearance-none cursor-pointer truncate"
                  >
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Account Number & Account Holder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="bankAccountNumber"
                    className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                  >
                    <span>ACCOUNT NUMBER</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bankAccountNumber"
                    type="text"
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => {
                      updateFormData({ bankAccountNumber: e.target.value })
                      if (errors.bankAccountNumber) setErrors((prev) => ({ ...prev, bankAccountNumber: null }))
                    }}
                    placeholder="e.g. 0123456789"
                    className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors ${
                      errors.bankAccountNumber ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.bankAccountNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="bankAccountName"
                    className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1"
                  >
                    <span>ACCOUNT HOLDER NAME</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bankAccountName"
                    type="text"
                    value={formData.bankAccountName || ''}
                    onChange={(e) => {
                      updateFormData({ bankAccountName: e.target.value })
                      if (errors.bankAccountName) setErrors((prev) => ({ ...prev, bankAccountName: null }))
                    }}
                    placeholder="e.g. NGUYEN VAN A"
                    className={`w-full bg-white border px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none transition-colors uppercase ${
                      errors.bankAccountName ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {errors.bankAccountName && (
                    <p className="text-[11px] text-red-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.bankAccountName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => safeBack(navigate, '/become-seller')}
                className="w-full sm:w-auto px-6 py-3.5 border border-neutral-300 text-xs font-mono uppercase tracking-wider text-black hover:border-black transition-colors flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO OVERVIEW</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm group order-1 sm:order-2"
              >
                <span>CONTINUE TO REVIEW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Storefront Preview */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
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
        </div>
      </div>
    </div>
  )
}
