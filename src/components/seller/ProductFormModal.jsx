import { useState, useRef } from 'react'
import { X, Check, Upload, Loader2, Trash2, Plus, Star } from 'lucide-react'
import { createProduct, updateProduct } from '../../services/api'
import { handleImageError } from '../../constants/commerce'
import { uploadImage } from '../../utils/imageUpload'

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size']
const PRESET_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Navy', hex: '#1B263B' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Brown', hex: '#6F4E37' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Cream', hex: '#FFFDD0' },
]

function getColorHex(colorStr) {
  if (!colorStr) return '#111111'
  if (colorStr.startsWith('#')) return colorStr
  const found = PRESET_COLORS.find((c) => c.name.toLowerCase() === colorStr.toLowerCase())
  return found ? found.hex : colorStr
}

/**
 * Component ProductFormContent: Nội dung biểu mẫu tạo mới hoặc chỉnh sửa sản phẩm
 * - Khởi tạo state trực tiếp từ props mà không cần useEffect (chuẩn React pattern).
 * - Tải ảnh từ máy tính cá nhân sử dụng module Node.js fs qua API chung (hỗ trợ chọn nhiều ảnh đồng thời).
 * - Hỗ trợ đầy đủ các trường dữ liệu khớp chuẩn db.json:
 *   + sizes: Danh sách kích thước tùy chọn linh hoạt (XS, S, M, L, XL, Free Size...)
 *   + colors: Danh sách phân loại màu sắc (Black, White, Charcoal...)
 *   + images: Mảng danh sách đường dẫn ảnh [path1, path2, ...]
 *   + careInstructions: Hướng dẫn bảo quản / giặt ủi
 *   + details.material: Thành phần chất liệu
 *   + details.specifications: Danh sách thông số kỹ thuật (dạng gạch đầu dòng)
 *   + details.origin: Nguồn gốc, xuất xứ hoặc xưởng chế tác
 */
function ProductFormContent({
  productToEdit,
  onClose,
  onSaveSuccess,
  shopId = '',
  shopName = '',
}) {
  const isEditMode = Boolean(productToEdit?.id)
  const fileInputRef = useRef(null)

  // Khởi tạo state form từ productToEdit nếu có (images luôn là mảng chuẩn)
  const [formData, setFormData] = useState(() => {
    let initialImages = []
    if (Array.isArray(productToEdit?.images) && productToEdit.images.length > 0) {
      initialImages = productToEdit.images.filter(Boolean)
    } else if (productToEdit?.image) {
      initialImages = [productToEdit.image]
    }

    const initialSizes =
      Array.isArray(productToEdit?.sizes) && productToEdit.sizes.length > 0
        ? productToEdit.sizes
        : ['S', 'M', 'L']

    const initialColors =
      Array.isArray(productToEdit?.colors) && productToEdit.colors.length > 0
        ? productToEdit.colors
        : ['Black']

    return {
      name: productToEdit?.name || '',
      category: productToEdit?.category || 'SHIRT',
      price: productToEdit?.price || '',
      originalPrice: productToEdit?.originalPrice || '',
      stock: productToEdit?.stock ?? 10,
      sizes: initialSizes,
      colors: initialColors,
      images: initialImages,
      badge: productToEdit?.badge || '',
      description: productToEdit?.description || '',
      careInstructions: productToEdit?.careInstructions || '',
      material: productToEdit?.details?.material || '',
      specifications: Array.isArray(productToEdit?.details?.specifications)
        ? productToEdit.details.specifications.join('\n')
        : '',
      origin: productToEdit?.details?.origin || '',
    }
  })

  const [customColorInput, setCustomColorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgressText, setUploadProgressText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Xử lý thay đổi dữ liệu các trường input text / select / textarea
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Bật/tắt kích thước (Sizes)
  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size)
      const nextSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size]
      return { ...prev, sizes: nextSizes.length > 0 ? nextSizes : [size] }
    })
  }

  // Thêm màu sắc mới
  const handleAddColor = (colorName) => {
    const trimmed = (colorName || '').trim()
    if (!trimmed) return
    setFormData((prev) => {
      if (prev.colors.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
        return prev
      }
      return { ...prev, colors: [...prev.colors, trimmed] }
    })
    setCustomColorInput('')
  }

  // Xóa màu sắc
  const handleRemoveColor = (colorName) => {
    setFormData((prev) => {
      const filtered = prev.colors.filter((c) => c !== colorName)
      return { ...prev, colors: filtered.length > 0 ? filtered : ['Standard'] }
    })
  }

  /**
   * Xử lý tải nhiều ảnh từ máy tính cá nhân lên thư mục public/ qua Node.js fs:
   */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    setErrorMessage('')
    setUploadProgressText(`Uploading 1/${files.length}...`)

    try {
      const newUrls = []
      for (let i = 0; i < files.length; i++) {
        setUploadProgressText(`Uploading ${i + 1}/${files.length}...`)
        const result = await uploadImage(files[i], { category: formData.category })
        if (result?.url) {
          newUrls.push(result.url)
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }))
      }
    } catch (err) {
      console.error('Error uploading product image to Node.js fs:', err)
      setErrorMessage(err.message || 'Unable to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgressText('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Xóa một ảnh cụ thể khỏi mảng images
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }))
  }

  // Đặt một ảnh làm ảnh bìa chính (Cover)
  const handleSetCoverImage = (index) => {
    if (index === 0) return
    setFormData((prev) => {
      const updated = [...prev.images]
      const [chosen] = updated.splice(index, 1)
      updated.unshift(chosen)
      return { ...prev, images: updated }
    })
  }

  // Xử lý gửi form lên API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim()) {
      setErrorMessage('Please enter product name.')
      return
    }

    const priceNum = Number(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Price must be a valid number greater than 0.')
      return
    }

    if (formData.originalPrice !== '' && formData.originalPrice !== null && formData.originalPrice !== undefined) {
      const origPriceNum = Number(formData.originalPrice)
      if (isNaN(origPriceNum) || origPriceNum <= 0) {
        setErrorMessage('Original price must be a valid number greater than 0.')
        return
      }
      if (origPriceNum <= priceNum) {
        setErrorMessage('Original price must be greater than the selling price.')
        return
      }
    }

    const stockNum = Number(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMessage('Inventory stock quantity cannot be negative.')
      return
    }

    if (!formData.images || formData.images.length === 0) {
      setErrorMessage('Please upload at least one product photo from your device.')
      return
    }

    setIsSubmitting(true)

    try {
      const specsArray = formData.specifications
        ? formData.specifications
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : []

      const cleanImages = formData.images.map((img) => img.trim()).filter(Boolean)

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: stockNum,
        isSoldOut: stockNum === 0,
        sizes: formData.sizes && formData.sizes.length > 0 ? formData.sizes : ['One Size'],
        colors: formData.colors && formData.colors.length > 0 ? formData.colors : ['Black'],
        badge: formData.badge || null,
        description: formData.description.trim(),
        careInstructions: formData.careInstructions.trim() || null,
        details: {
          material: formData.material.trim() || null,
          specifications: specsArray,
          origin: formData.origin.trim() || null,
        },
        shopId: productToEdit?.shopId || shopId,
        shopName: productToEdit?.shopName || shopName,
        images: cleanImages,
      }

      let res
      if (isEditMode) {
        res = await updateProduct(productToEdit.id, {
          ...productToEdit,
          ...payload,
          details: {
            ...(productToEdit.details || {}),
            ...payload.details,
          },
        })
      } else {
        payload.id = `prd_${Date.now()}`
        res = await createProduct(payload)
      }

      const savedData = res?.data || res || payload
      if (onSaveSuccess) {
        onSaveSuccess(savedData, isEditMode)
      }
      onClose()
    } catch (err) {
      console.error('Error saving product:', err)
      setErrorMessage('Unable to save product. Please check API server connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentPriceNum = Number(formData.price) || 0
  const currentOrigPriceNum = Number(formData.originalPrice) || 0
  const isOriginalPriceInvalid =
    formData.originalPrice !== '' &&
    formData.originalPrice !== null &&
    formData.originalPrice !== undefined &&
    currentPriceNum > 0 &&
    currentOrigPriceNum <= currentPriceNum
  const discountPercent =
    currentOrigPriceNum > currentPriceNum && currentOrigPriceNum > 0
      ? Math.round(((currentOrigPriceNum - currentPriceNum) / currentOrigPriceNum) * 100)
      : 0

  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Tiêu đề Modal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 sticky top-0 z-10 backdrop-blur-xs">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
            {isEditMode ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
          </h3>
          {isEditMode && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Updating ID: {productToEdit.id}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-[2px]">
            {errorMessage}
          </div>
        )}

        {/* Hàng 1: Tên sản phẩm */}
        <div className="space-y-1">
          <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Sculptural Raw-Edge Denim Jacket"
            className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] focus:border-black focus:outline-none"
            required
          />
        </div>

        {/* Hàng 2: Danh mục & Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] focus:border-black focus:outline-none font-mono"
            >
              <option value="SHIRT">SHIRT</option>
              <option value="PANTS">PANTS</option>
              <option value="SET">SET</option>
              <option value="SHOES">SHOES</option>
              <option value="ACCESSORIES">ACCESSORIES</option>
              <option value="DRESS">DRESS</option>
              <option value="JACKET">JACKET</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Badge / Edition (Optional)
              </label>
              {formData.badge?.trim() && (
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] transition-all ${
                    formData.badge.trim().toUpperCase().includes('SALE')
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-black text-white'
                  }`}
                >
                  PREVIEW: {formData.badge.trim()}
                </span>
              )}
            </div>
            <input
              type="text"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              placeholder="e.g. SALE, ARCHIVE, CAPSULE"
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono focus:border-black focus:outline-none"
            />
            {/* Quick Badge Presets (Đồng bộ kiểu dáng tối giản monochrome cho tất cả nút) */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-neutral-400">Quick:</span>
              {['SALE', 'NEW', 'ARCHIVE', 'CAPSULE'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, badge: preset }))}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] uppercase tracking-wider cursor-pointer transition-colors ${
                    formData.badge?.trim().toUpperCase() === preset
                      ? 'bg-black text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-black hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
              {formData.badge && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, badge: '' }))}
                  className="text-[10px] font-mono text-neutral-400 hover:text-black underline ml-auto cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hàng 3: Giá bán, Giá gốc, Tồn kho */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Price (₫) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="680000"
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono focus:border-black focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Original Price (₫)
              </label>
              {discountPercent > 0 && (
                <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-[2px]">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="Optional"
              className={`w-full px-3 py-2 border rounded-[2px] font-mono focus:outline-none transition-colors ${
                isOriginalPriceInvalid
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-neutral-200 focus:border-black'
              }`}
            />
            {isOriginalPriceInvalid && (
              <p className="text-[10px] font-mono text-red-600 mt-0.5">
                Must be greater than selling price ({formData.price || 0}₫)
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Stock Units *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono focus:border-black focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Hàng 3.5: Available Sizes (Kích cỡ) */}
        <div className="space-y-1.5 pt-1">
          <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
            Available Sizes *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SIZES.map((size) => {
              const active = formData.sizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-[2px] transition-colors cursor-pointer ${
                    active
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>

        {/* Hàng 3.6: Available Colorways (Màu sắc) */}
        <div className="space-y-2 pt-1">
          <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
            Available Colorways ({formData.colors.length})
          </label>

          {/* Dropdown Quick Add & Ô nhập màu tự do */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddColor(e.target.value)
                }
              }}
              className="w-full px-3 py-1.5 border border-neutral-200 rounded-[2px] text-xs font-mono bg-white focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="">+ Select preset color to add...</option>
              {PRESET_COLORS.map((c) => {
                const isAdded = formData.colors.map((col) => col.toLowerCase()).includes(c.name.toLowerCase())
                return (
                  <option key={c.name} value={c.name} disabled={isAdded}>
                    {c.name} {isAdded ? '(Added)' : ''}
                  </option>
                )
              })}
            </select>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddColor(customColorInput)
                  }
                }}
                placeholder="Or type custom color..."
                className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-[2px] text-xs font-mono focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddColor(customColorInput)}
                className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-mono uppercase tracking-wider hover:bg-black rounded-[2px] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Danh sách các màu đã chọn hiển thị dạng chấm tròn swatch giống ProductDetail */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {formData.colors.map((color) => {
              const hex = getColorHex(color)
              return (
                <div
                  key={color}
                  className="group inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-black rounded-[2px] transition-all shadow-2xs"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: hex }}
                    title={color}
                  />
                  <span className="text-xs font-mono font-medium text-neutral-800 uppercase">
                    {color}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="text-neutral-400 hover:text-black cursor-pointer ml-1"
                    title={`Remove ${color}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hàng 4: Bộ sưu tập ảnh sản phẩm */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Product Images *
              </label>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-[2px] border border-neutral-200">
                {formData.images.length} {formData.images.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            {isUploading && (
              <span className="text-[11px] font-mono text-black flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadProgressText || 'Uploading...'}</span>
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {formData.images.map((imgUrl, index) => {
                const isCover = index === 0
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    className="group relative aspect-3/4 bg-neutral-100 border border-neutral-200 rounded-[2px] overflow-hidden shadow-xs hover:border-black transition-colors"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />

                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-black/90 text-white text-[9px] font-mono uppercase tracking-wider rounded-[2px]">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Cover
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(index)}
                          className="px-2 py-1 bg-white text-black text-[10px] font-mono uppercase tracking-wider rounded-[2px] hover:bg-neutral-100 cursor-pointer shadow-xs"
                          title="Set as Cover"
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1 bg-red-600 text-white rounded-[2px] hover:bg-red-700 cursor-pointer shadow-xs"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-3/4 flex flex-col items-center justify-center p-3 border-2 border-dashed border-neutral-300 hover:border-black rounded-[2px] bg-white hover:bg-neutral-50 cursor-pointer transition-colors text-center"
              >
                <Plus className="w-5 h-5 text-neutral-400 group-hover:text-black mb-1" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-bold">
                  Add Photo
                </span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 hover:border-black rounded-[2px] bg-neutral-50/60 hover:bg-neutral-50 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2 shadow-2xs">
                <Upload className="w-4 h-4 stroke-[1.5]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-black font-mono">
                Upload Product Images
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Supports multiple files (JPG, PNG, WEBP)
              </p>
            </div>
          )}
        </div>

        {/* Mô tả sản phẩm (Description) */}
        <div className="space-y-1">
          <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Detailed description of tailoring, silhouette and hardware..."
            className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] focus:border-black focus:outline-none"
          />
        </div>

        {/* Details & Care Instructions */}
        <div className="pt-3 border-t border-neutral-100 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Material (details.material)
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. 100% Raw Japanese Selvedge Cotton"
                className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Provenance & Craftsmanship (details.origin)
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g. Crafted at Atelier, HCMC"
                className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Specifications (Hiển thị dạng gạch đầu dòng ở mục Material & Specifications) */}
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Specifications (details.specifications)
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              placeholder={`Asymmetrical multi-panel geometric silhouette.\nConcealed front zipper with branded metal pull.\nReinforced stitching at stress points.`}
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none leading-relaxed"
            />
          </div>

          {/* Care & Preservation (Hiển thị ở Tab Care Guide: Maintenance & Preservation) */}
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Care & Preservation (Care Guide)
            </label>
            <textarea
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleChange}
              rows="2"
              placeholder="e.g. Dry clean only. Store in protective dust bag. Do not tumble dry."
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none"
            />
          </div>


        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-neutral-200 text-neutral-700 rounded-[2px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-black text-white rounded-[2px] hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * Component ProductFormModal: Bọc ngoài quản lý backdrop và reset form khi mở
 */
export default function ProductFormModal({
  isOpen = false,
  onClose,
  productToEdit = null,
  onSaveSuccess,
  shopId = '',
  shopName = '',
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <ProductFormContent
        key={productToEdit?.id || 'new-product-form'}
        productToEdit={productToEdit}
        onClose={onClose}
        onSaveSuccess={onSaveSuccess}
        shopId={shopId}
        shopName={shopName}
      />
    </div>
  )
}
