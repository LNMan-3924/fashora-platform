/**
 * Component ProductStockBadge: Hiển thị huy hiệu trạng thái tồn kho của sản phẩm
 * - Cố định kích thước (w-28, căn giữa) giúp các hàng trong bảng luôn thẳng tắp.
 * - Không sử dụng chấm tròn theo đúng quy chuẩn thiết kế tối giản của Fashora.
 * - Tự động phân loại 3 trạng thái:
 *   + IN STOCK: Còn hàng dồi dào (stock > 5)
 *   + LOW STOCK: Sắp hết hàng (stock > 0 và <= 5)
 *   + OUT OF STOCK: Hết hàng (stock <= 0 hoặc isSoldOut = true)
 *
 * @param {number} stock - Số lượng sản phẩm còn lại trong kho
 * @param {boolean} isSoldOut - Cờ đánh dấu sản phẩm đã bán hết
 * @param {string} className - Class tùy biến bổ sung nếu có
 */
import { useTranslation } from 'react-i18next'

/**
 * Component ProductStockBadge: Hiển thị huy hiệu trạng thái tồn kho của sản phẩm
 */
export default function ProductStockBadge({
  stock = 0,
  isSoldOut = false,
  className = '',
}) {
  const { t } = useTranslation()
  const stockNum = Number(stock || 0)

  // 1. Xác định cấu hình hiển thị trạng thái tồn kho
  let config = {
    labelKey: 'inStock',
    defaultLabel: 'IN STOCK',
    styleClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  }

  if (isSoldOut || stockNum <= 0) {
    config = {
      labelKey: 'outOfStock',
      defaultLabel: 'OUT OF STOCK',
      styleClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
    }
  } else if (stockNum <= 5) {
    config = {
      labelKey: 'lowStock',
      defaultLabel: 'LOW STOCK',
      styleClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[6.5rem] px-2 shrink-0 py-1 text-[11px] font-medium font-mono border rounded-[2px] tracking-wider select-none text-center ${config.styleClass} ${className}`}
      title={`${t('seller.products.table.stock', 'STOCK')}: ${stockNum} ${t('seller.products.units', 'units')}`}
    >
      <span>{t(`seller.stockStatus.${config.labelKey}`, config.defaultLabel)}</span>
    </span>
  )
}

