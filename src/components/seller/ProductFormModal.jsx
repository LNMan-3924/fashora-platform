import { useState, useRef } from 'react'
import { X, Check, Upload, Loader2, Image as ImageIcon, Trash2, Plus, Star } from 'lucide-react'
import { createProduct, updateProduct } from '../../services/api'
import { handleImageError } from '../../constants/commerce'
import { uploadImage } from '../../utils/imageUpload'

/**
 * Component ProductFormContent: Nội dung biểu mẫu tạo mới hoặc chỉnh sửa sản phẩm
 * - Khởi tạo state trực tiếp từ props mà không cần useEffect (chuẩn React pattern).
 * - Tải ảnh từ máy tính cá nhân sử dụng module Node.js fs qua API chung (hỗ trợ chọn nhiều ảnh đồng thời).
 * - Hỗ trợ đầy đủ các trường dữ liệu khớp chuẩn db.json:
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

    return {
      name: productToEdit?.name || '',
      category: productToEdit?.category || 'SHIRT',
      price: productToEdit?.price || '',
      originalPrice: productToEdit?.originalPrice || '',
      stock: productToEdit?.stock ?? 10,
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

  /**
   * Xử lý tải nhiều ảnh từ máy tính cá nhân lên thư mục public/ qua Node.js fs:
   * - Hỗ trợ chọn đồng thời nhiều file cùng lúc (<input type="file" multiple />).
   * - Sử dụng hàm dùng chung uploadImage() từ src/utils/imageUpload.js.
   * - Node.js fs sẽ tự động lưu vào public/images/products/<category>/<tên-file>.jpg.
   * - Thêm các đường dẫn ảnh mới vào mảng formData.images.
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
      console.error('Lỗi khi tải ảnh sản phẩm lên Node.js fs:', err)
      setErrorMessage(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.')
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

  // Đặt một ảnh làm ảnh bìa chính (Cover) - đưa lên vị trí đầu tiên trong mảng
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

    // Kiểm tra tính hợp lệ cơ bản
    if (!formData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm / trang phục.')
      return
    }

    const priceNum = Number(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Giá bán phải là số hợp lệ và lớn hơn 0.')
      return
    }

    const stockNum = Number(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMessage('Số lượng tồn kho không được âm.')
      return
    }

    if (!formData.images || formData.images.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất một hình ảnh sản phẩm từ máy tính.')
      return
    }

    setIsSubmitting(true)

    try {
      // Phân tách specifications từ chuỗi nhập nhiều dòng thành mảng string
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
        // Cập nhật sản phẩm qua API PUT /products/:id (bảo toàn sizes, colors hoặc các trường mở rộng cũ)
        res = await updateProduct(productToEdit.id, {
          ...productToEdit,
          ...payload,
          details: {
            ...(productToEdit.details || {}),
            ...payload.details,
          },
        })
      } else {
        // Tạo sản phẩm mới qua API POST /products
        payload.id = `prd_${Date.now()}`
        payload.sizes = ['One Size']
        payload.colors = ['Black']
        res = await createProduct(payload)
      }

      const savedData = res?.data || res || payload
      if (onSaveSuccess) {
        onSaveSuccess(savedData, isEditMode)
      }
      onClose()
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err)
      setErrorMessage('Không thể lưu sản phẩm. Vui lòng kiểm tra API json-server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Tiêu đề Modal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 sticky top-0 z-10 backdrop-blur-xs">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black font-mono">
            {isEditMode ? 'EDIT GARMENT' : 'ADD NEW GARMENT'}
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {isEditMode
              ? `Updating ID: ${productToEdit.id}`
              : `Create a new design piece for ${shopName} catalog`}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-[2px] font-mono">
            {errorMessage}
          </div>
        )}

        {/* Tên sản phẩm */}
        <div className="space-y-1">
          <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
            Garment Title *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Asymmetrical Tailored Blazer"
            className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] focus:border-black focus:outline-none"
            required
          />
        </div>

        {/* Hàng 2: Danh mục + Huy hiệu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] bg-white font-mono focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="SHIRT">SHIRT</option>
              <option value="SET">SET</option>
              <option value="PANTS">PANTS</option>
              <option value="ACCESSORIES">ACCESSORIES</option>
              <option value="SHOES">SHOES</option>
              <option value="DRESS">DRESS</option>
              <option value="JACKET">JACKET</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Badge (Optional)
            </label>
            <select
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] bg-white font-mono focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="">None</option>
              <option value="NEW">NEW</option>
              <option value="HOT">HOT</option>
              <option value="LIMITED">LIMITED</option>
              <option value="SALE">SALE</option>
            </select>
          </div>
        </div>

        {/* Hàng 3: Giá bán + Giá gốc + Tồn kho */}
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
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Original Price (₫)
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono focus:border-black focus:outline-none"
            />
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

        {/* Hàng 4: Bộ sưu tập ảnh sản phẩm (Chọn nhiều ảnh từ máy tính qua Node.js fs) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Garment Images *
              </label>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-[2px] border border-neutral-200">
                {formData.images.length} {formData.images.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
              Folder: public/images/products/{formData.category.toLowerCase()}
            </span>
          </div>

          {/* Input file ẩn hỗ trợ chọn nhiều ảnh (multiple) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="product-image-file-input"
            onChange={handleImageUpload}
            disabled={isUploading || isSubmitting}
          />

          {formData.images.length > 0 ? (
            <div className="space-y-2.5">
              {/* Lưới hiển thị danh sách các ảnh đã chọn */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-50/80 border border-neutral-200 rounded-[2px]">
                {formData.images.map((imgUrl, idx) => {
                  const isCover = idx === 0
                  return (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="group relative aspect-3/4 bg-neutral-100 border border-neutral-200 rounded-[2px] overflow-hidden shadow-xs hover:border-black transition-colors"
                    >
                      <img
                        src={imgUrl}
                        alt={`Garment view ${idx + 1}`}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />

                      {/* Huy hiệu COVER cho ảnh đầu tiên */}
                      {isCover ? (
                        <div className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 bg-black text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-[1px] tracking-wider uppercase shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>COVER</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          disabled={isUploading || isSubmitting}
                          title="Đặt làm ảnh bìa chính (Cover)"
                          className="absolute top-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 hover:bg-white text-black text-[9px] font-mono px-1.5 py-0.5 rounded-[1px] tracking-wider uppercase shadow-xs cursor-pointer hover:font-bold"
                        >
                          Set Cover
                        </button>
                      )}

                      {/* Nút xóa ảnh */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={isUploading || isSubmitting}
                        title="Xóa ảnh này"
                        className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-[2px] shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Số thứ tự ảnh góc dưới */}
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 py-0.5 rounded-[1px]">
                        #{idx + 1}
                      </div>
                    </div>
                  )
                })}

                {/* Ô nút Thêm ảnh bổ sung trong lưới */}
                <label
                  htmlFor="product-image-file-input"
                  className={`aspect-3/4 flex flex-col items-center justify-center p-3 border-2 border-dashed border-neutral-300 hover:border-black rounded-[2px] bg-white hover:bg-neutral-50 cursor-pointer transition-colors text-center ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  title="Chọn thêm ảnh từ máy tính (Có thể chọn nhiều ảnh)"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1 text-neutral-600">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">
                        {uploadProgressText || 'Uploading...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-600 group-hover:text-black">
                      <div className="p-1.5 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <Plus className="w-4 h-4 text-neutral-800" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider mt-1 text-neutral-800">
                        Add Photos
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        Multi-select
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Thanh thao tác dưới lưới ảnh */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-0.5 px-1">
                <span className="text-[10px]">
                  Tip: Ảnh đầu tiên (COVER) được chọn làm ảnh hiển thị chính trong danh mục.
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, images: [] }))}
                  disabled={isUploading || isSubmitting}
                  className="text-red-500 hover:text-red-700 hover:underline uppercase text-[10px] tracking-wider cursor-pointer disabled:opacity-50"
                >
                  Clear All Photos
                </button>
              </div>
            </div>
          ) : (
            /* Khi chưa có ảnh nào: Khung dropzone kích thước lớn hướng dẫn chọn nhiều ảnh */
            <label
              htmlFor="product-image-file-input"
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 hover:border-black rounded-[2px] bg-neutral-50/60 hover:bg-neutral-50 cursor-pointer transition-colors ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-neutral-600">
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {uploadProgressText || 'Uploading images to Node.js fs...'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-white border border-neutral-200 rounded-[2px] shadow-xs">
                    <ImageIcon className="w-6 h-6 text-neutral-700" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-black uppercase tracking-wider block">
                      Upload photos from computer (Multi-select)
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Hold Ctrl or Shift to select multiple images at once (PNG, JPG, WEBP)
                    </span>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-wider rounded-[2px] hover:bg-neutral-800 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Browse Image Files</span>
                  </span>
                </div>
              )}
            </label>
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

        {/* =========================================================================
            KHỐI DỮ LIỆU BỔ SUNG: DETAILS & CARE INSTRUCTIONS (KHỚP CHUẨN DB.JSON)
            ========================================================================= */}
        <div className="pt-3 border-t border-neutral-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-mono">
              SPECIFICATIONS & CARE (KHỚP DB.JSON)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Rendered on product page tabs
            </span>
          </div>

          {/* Hàng: Material (Chất liệu) + Origin (Xuất xứ / Xưởng chế tác) */}
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
                Origin (details.origin)
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

          {/* Thông số kỹ thuật chi tiết (details.specifications - Mỗi dòng 1 mục) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
                Specifications (details.specifications)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                One bullet point per line
              </span>
            </div>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              placeholder={`Asymmetrical multi-panel geometric silhouette.\nConcealed front zipper with branded metal pull.\nReinforced stitching at stress points.`}
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none leading-relaxed"
            />
          </div>

          {/* Hướng dẫn bảo quản / giặt ủi (careInstructions) */}
          <div className="space-y-1">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Care Instructions (careInstructions)
            </label>
            <textarea
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleChange}
              rows="2"
              placeholder="e.g. Dry clean only. Store in protective garment dust bag. Do not tumble dry."
              className="w-full px-3 py-2 border border-neutral-200 rounded-[2px] font-mono text-[11px] focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {/* Nút hành động */}
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
