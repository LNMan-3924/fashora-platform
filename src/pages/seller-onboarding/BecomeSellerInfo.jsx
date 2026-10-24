import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, X, AlertCircle } from 'lucide-react'
import { useOnboarding } from './BecomeSellerLayout'
import OnboardingStepper from './components/OnboardingStepper'
import UnifiedAccountBanner from './components/UnifiedAccountBanner'
import LiveStorefrontPreview from './components/LiveStorefrontPreview'

export default function BecomeSellerInfo() {
  const navigate = useNavigate()
  const { formData, updateFormData, currentUser } = useOnboarding()
  const fileInputRef = useRef(null)

  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [logoInputType, setLogoInputType] = useState('file') // 'file' | 'url'
  const [logoUrlInput, setLogoUrlInput] = useState('')

  const CATEGORIES = [
    'ALL-IN-ONE FASHION',
    'READY-TO-WEAR & APPAREL',
    'ATELIER & BESPOKE TAILORING',
    'FOOTWEAR & LEATHER GOODS',
    'ACCESSORIES & JEWELRY',
    'SUSTAINABLE & VINTAGE FASHION',
  ]

  // Validate form
  const validate = () => {
    const errs = {}
    const trimmedName = (formData.shopName || '').trim()

    if (!trimmedName) {
      errs.shopName = 'Please enter a shop name.'
    } else if (trimmedName.length < 3) {
      errs.shopName = 'Shop name must be at least 3 characters.'
    } else if (trimmedName.length > 50) {
      errs.shopName = 'Shop name cannot exceed 50 characters.'
    }

    if (formData.shopDescription && formData.shopDescription.length > 300) {
      errs.shopDescription = 'Description cannot exceed 300 characters.'
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

  // Helper: auto-compress image to fit under 2MB if needed
  const compressImageToUnder2MB = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.onload = (e) => {
        const img = new Image()
        img.onerror = () => reject(new Error('Failed to parse image'))
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            let { width, height } = img

            // Resize down if resolution is exceptionally high (>1600px)
            const maxDim = 1600
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              } else {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0, width, height)

            // Quality 0.85 delivers high visual fidelity at ~150-400KB
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
            resolve(dataUrl)
          } catch (err) {
            reject(err)
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle Logo file upload (Strictly adheres to 2MB storage)
  const handleFile = async (file) => {
    if (!file) return

    // 1. Recognize image by MIME type or file extension (handles Windows renamed JPG/JPEG)
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

    const MAX_SIZE = 2 * 1024 * 1024 // 2MB limit

    // 2. If already <= 2MB, store directly
    if (file.size <= MAX_SIZE) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result
        const sizeStr = `${(file.size / 1024).toFixed(0)} KB`
        updateFormData({
          shopLogo: dataUrl,
          shopLogoName: file.name,
          shopLogoSize: sizeStr,
        })
        setErrors((prev) => ({ ...prev, shopLogo: null }))
      }
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, shopLogo: 'Error reading image file.' }))
      }
      reader.readAsDataURL(file)
      return
    }

    // 3. If file exceeds 2MB, auto-compress to ensure it is strictly < 2MB
    try {
      const compressedDataUrl = await compressImageToUnder2MB(file)
      const approxBytes = Math.round((compressedDataUrl.length * 3) / 4)
      const sizeStr = `${(approxBytes / 1024).toFixed(0)} KB (Optimized to < 2MB)`
      updateFormData({
        shopLogo: compressedDataUrl,
        shopLogoName: file.name,
        shopLogoSize: sizeStr,
      })
      setErrors((prev) => ({ ...prev, shopLogo: null }))
    } catch {
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setErrors((prev) => ({
        ...prev,
        shopLogo: `File size (${originalSizeMB} MB) exceeds 2MB limit and could not be compressed.`,
      }))
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
            Set up your public storefront specifications and atelier brand profile.
          </p>
        </div>
      </div>

      {/* 2. Top User Identity Banner (Compact, without UNIFIED ACCOUNT badge) */}
      <UnifiedAccountBanner currentUser={currentUser} compact={true} />

      {/* 3. Stepper (Step 2 Active: 1 OVERVIEW, 2 SHOP INFORMATION, 3 REVIEW, 4 COMPLETE) */}
      <OnboardingStepper currentStep={2} />

      {/* 4. Form & Live Storefront Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-neutral-200 p-6 sm:p-8">
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
              rows={4}
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

            {/* Preview if logo exists */}
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
              /* Dropzone upload */
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
                        UPLOAD LOGO
                      </p>
                      <p className="text-[11px] font-mono text-neutral-400">
                        PNG / JPG / WEBP, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Cloud image URL */
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

          {/* Field: Category (6 items) */}
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

          {/* Form Actions: Back to Overview & Continue to Review */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/become-seller')}
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

      {/* Right Column: Live Storefront Preview (showLabel=false suppresses STOREFRONT SHOPPER VIEW PREVIEW title) */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <LiveStorefrontPreview
            shopName={formData.shopName}
            shopCategory={formData.shopCategory}
            shopDescription={formData.shopDescription}
            shopLogo={formData.shopLogo}
            currentUser={currentUser}
            showLabel={false}
          />
        </div>
      </div>
    </div>
    </div>
  )
}
