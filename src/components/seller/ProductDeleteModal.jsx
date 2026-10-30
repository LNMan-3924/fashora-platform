import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { deleteProduct } from '../../services/api'
import { formatVND, handleImageError, FALLBACK_IMAGE } from '../../constants/commerce'
import { getLocalizedProductName } from '../../utils/productLocalization'

export default function ProductDeleteModal({
  isOpen = false,
  onClose,
  product = null,
  onDeleteSuccess,
}) {
  const { t, i18n } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen || !product) return null

  const productImage =
    product.images?.[0] || product.image || FALLBACK_IMAGE
  const productName = getLocalizedProductName(product, i18n.language)

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
      console.error('Error deleting product:', err)
      setErrorMessage(t('seller.products.deleteModal.error', 'Unable to delete product at this time. Please try again.'))
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
              {t('seller.products.deleteModal.title', 'CONFIRM DELETION')}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
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
            {t('seller.products.deleteModal.confirm', 'Are you sure you want to remove this product from your shop catalog? This action cannot be undone.')}
          </p>

          {/* Chi tiết sản phẩm bị xóa */}
          <div className="flex items-center gap-3.5 p-3 bg-neutral-50 border border-neutral-200 rounded-[2px]">
            <div className="w-12 h-14 bg-neutral-200 border border-neutral-300 rounded-[2px] overflow-hidden shrink-0">
              <img
                src={productImage}
                alt={productName}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-black truncate text-xs">
                {productName}
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
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-neutral-200 text-neutral-700 rounded-[2px] hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              {t('seller.products.deleteModal.cancel', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white rounded-[2px] hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? t('seller.products.deleteModal.deleting', 'Deleting...') : t('seller.products.deleteModal.delete', 'Delete Product')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

