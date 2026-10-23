import { useState, useRef } from 'react'
import { X, Check, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { createProduct, updateProduct } from '../../services/api'
import { handleImageError } from '../../constants/commerce'
import { uploadImage } from '../../utils/imageUpload'

/**
 * Component ProductFormContent: Nội dung biểu mẫu tạo mới hoặc chỉnh sửa sản phẩm
 * - Khởi tạo state trực tiếp từ props mà không cần useEffect (chuẩn React pattern).
 * - Tải ảnh từ máy tính cá nhân sử dụng module Node.js fs qua API chung (không dùng ô nhập URL thủ công).
 * - Hỗ trợ đầy đủ các trường dữ liệu khớp chuẩn db.json:
 *   + careInstructions: Hướng dẫn bảo quản / giặt ủi
 *   + details.material: Thành phần chất liệu
 *   + details.specifications: Danh sách thông số kỹ thuật (dạng gạch đầu dòng)
 *   + details.origin: Nguồn gốc, xuất xứ hoặc xưởng chế tác
 */
function ProductFormContent({
  productToEdit,
  onClose,
  onSaveSuccess,
  shopId = 'shop_m_studio',
  shopName = 'M STUDIO',
}) {
  const isEditMode = Boolean(productToEdit?.id)
  const fileInputRef = useRef(null)

  // Khởi tạo state form từ productToEdit nếu có
  const [formData, setFormData] = useState(() => ({
    name: productToEdit?.name || '',
    category: productToEdit?.category || 'SHIRT',
    price: productToEdit?.price || '',
    originalPrice: productToEdit?.originalPrice || '',
    stock: productToEdit?.stock ?? 10,
    imageUrl: productToEdit?.images?.[0] || productToEdit?.image || '',
    badge: productToEdit?.badge || '',
    description: productToEdit?.description || '',
    careInstructions: productToEdit?.careInstructions || '',
    material: productToEdit?.details?.material || '',
    specifications: Array.isArray(productToEdit?.details?.specifications)
      ? productToEdit.details.specifications.join('\n')
      : '',
    origin: productToEdit?.details?.origin || '',
  }))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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
   * Xử lý tải ảnh từ máy tính cá nhân lên thư mục public/ qua Node.js fs:
   * - Sử dụng hàm dùng chung uploadImage() từ src/utils/imageUpload.js.
   * - Truyền vào tham số category (SHIRT, PANTS, SET, SHOES, ACCESSORIES, DRESS, JACKET...).
   * - Node.js fs sẽ tự động tạo thư mục con (nếu chưa có) và ghi file nhị phân vào:
   *   public/images/products/<category>/<tên-file-timestamp>.jpg
   * - Nhận lại đường dẫn web tĩnh và tự động gán vào formData.imageUrl.
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMessage('')

    try {
      const result = await uploadImage(file, { category: formData.category })
      if (result?.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: result.url,
        }))
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh sản phẩm lên Node.js fs:', err)
      setErrorMessage(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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

    if (!formData.imageUrl.trim()) {
      setErrorMessage('Vui lòng tải lên hình ảnh sản phẩm từ máy tính.')
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
        images: [formData.imageUrl.trim()],
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

        {/* Hàng 4: Tải ảnh sản phẩm từ máy tính qua Node.js fs (Không dùng ô nhập URL) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block font-semibold uppercase tracking-wider text-neutral-700 font-mono text-[11px]">
              Garment Image *
            </label>
            <span className="text-[10px] text-neutral-400 font-mono">
              Auto-saves to: public/images/products/{formData.category.toLowerCase()}
            </span>
          </div>

          {/* Input file ẩn kích hoạt bởi nhãn tải ảnh */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="product-image-file-input"
            onChange={handleImageUpload}
            disabled={isUploading || isSubmitting}
          />

          {formData.imageUrl ? (
            /* Khi đã có ảnh: Hiển thị khung xem trước kèm đường dẫn và nút đổi ảnh / xóa */
            <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-[2px]">
              <div className="w-14 h-16 bg-neutral-100 border border-neutral-200 rounded-[2px] overflow-hidden shrink-0">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[11px] font-mono text-neutral-700 truncate" title={formData.imageUrl}>
                  {formData.imageUrl}
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="product-image-file-input"
                    className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-black hover:underline cursor-pointer ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        <span>Change Photo</span>
                      </>
                    )}
                  </label>

                  <span className="text-neutral-300">|</span>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                    disabled={isUploading || isSubmitting}
                    className="text-[11px] font-mono uppercase tracking-wider text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Khi chưa có ảnh: Khung chọn tệp từ máy tính */
            <label
              htmlFor="product-image-file-input"
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 hover:border-black rounded-[2px] bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-colors ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-neutral-600">
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    Uploading image to Node.js fs...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="p-2.5 bg-white border border-neutral-200 rounded-[2px] shadow-xs">
                    <ImageIcon className="w-5 h-5 text-neutral-700" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-black uppercase tracking-wider mt-1">
                    Upload from computer
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    PNG, JPG, WEBP (Max 10MB) — Saves to /public/images/products/{formData.category.toLowerCase()}
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
                placeholder="e.g. Crafted at M STUDIO Atelier, HCMC"
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
  shopId = 'shop_m_studio',
  shopName = 'M STUDIO',
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
