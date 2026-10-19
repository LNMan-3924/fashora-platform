import { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { deleteProduct } from '../../services/api'
import { formatVND, handleImageError, FALLBACK_IMAGE } from '../../constants/commerce'

/**
 * Component ProductDeleteModal: Hộp thoại xác nhận trước khi xóa sản phẩm khỏi kho
 * - Gọi trực tiếp API DELETE /products/:id.
 * - Hiển thị ảnh và thông tin chi tiết sản phẩm sắp bị xóa để tránh thao tác nhầm.
 * - Tích hợp xử lý lỗi ảnh sản phẩm (onError={handleImageError}).
 *
 * Props:
 * - isOpen: Trạng thái hiển thị modal
 * - onClose: Hàm đóng modal hủy thao tác
 * - product: Đối tượng sản phẩm đang được chọn để xóa
 * - onDeleteSuccess: Callback khi xóa thành công để gỡ khỏi danh sách trên giao diện
 */
export default function ProductDeleteModal({
  isOpen = false,
  onClose,
  product = null,
  onDeleteSuccess,
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen || !product) return null

  const productImage =
    product.images?.[0] || product.image || FALLBACK_IMAGE

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setErrorMessage('')

    try {
      await deleteProduct(product.id)
      if (onDeleteSuccess) {
        onDeleteSuccess(product.id)
      }
      onClose()
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err)
      setErrorMessage('Không thể xóa sản phẩm lúc này. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-[2px] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Tiêu đề cảnh báo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-red-50/50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] font-mono">
              CONFIRM DELETION
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung xác nhận */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-[2px] font-mono">
              {errorMessage}
            </div>
          )}

          <p className="text-neutral-600">
            Bạn có chắc chắn muốn xóa sản phẩm này khỏi bộ sưu tập atelier của cửa hàng?
            Hành động này <span className="font-semibold text-black">không thể hoàn tác</span>.
          </p>

          {/* Chi tiết sản phẩm bị xóa */}
          <div className="flex items-center gap-3.5 p-3 bg-neutral-50 border border-neutral-200 rounded-[2px]">
            <div className="w-12 h-14 bg-neutral-200 border border-neutral-300 rounded-[2px] overflow-hidden shrink-0">
              <img
                src={productImage}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-black truncate text-xs">
                {product.name}
              </h4>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                ID: {product.id} • {product.category}
              </p>
              <p className="text-xs font-mono font-bold text-black mt-1">
                {formatVND(product.price)}
              </p>
            </div>
          </div>

          {/* Nút thao tác xác nhận hoặc hủy */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-neutral-200 text-neutral-700 rounded-[2px] hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white rounded-[2px] hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Garment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

