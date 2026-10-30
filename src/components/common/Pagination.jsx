/**
 * Component Pagination: Điều hướng phân trang theo thiết kế tối giản Fashora (Atelier Monochromatic)
 * - Khớp 100% thiết kế: PREVIOUS [1] 2 3 ... 8 NEXT
 * - Nút PREVIOUS / NEXT dạng chữ hoa, tự động làm mờ khi ở trang đầu/cuối.
 * - Trang hiện tại được làm nổi bật bằng khối vuông bo góc đen tuyền (bg-black text-white rounded-[4px]).
 * - Các trang khác là chữ số thanh mảnh (font-mono text-xs), có hiệu ứng hover nhẹ.
 * - Tự động rút gọn dấu ba chấm (...) khi có nhiều hơn 7 trang.
 *
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Callback khi người dùng chuyển trang
 * @param {string} className - Class tùy biến bổ sung
 */
import { useTranslation } from 'react-i18next'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  // Thuật toán tính toán danh sách số trang hiển thị (hỗ trợ dấu ...)
  const getPageItems = () => {
    // Nếu tổng số trang nhỏ hơn hoặc bằng 7, hiển thị toàn bộ
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Nếu đang ở gần đầu trang (1..4)
    if (currentPage <= 4) {
      return [1, 2, 3, 4, '...', totalPages]
    }

    // Nếu đang ở gần cuối trang
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    // Nếu đang ở giữa danh sách trang
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  const pageItems = getPageItems()

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-2 sm:gap-3 py-6 font-mono text-xs select-none ${className}`}
    >
      {/* Nút PREVIOUS */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="uppercase tracking-widest font-semibold transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed text-neutral-500 hover:text-black cursor-pointer px-1 py-1"
        aria-label="Previous Page"
      >
        {t('common.previous', 'PREVIOUS')}
      </button>

      {/* Danh sách các số trang */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pageItems.map((item, index) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-400 font-mono tracking-widest text-xs pointer-events-none"
              >
                ...
              </span>
            )
          }

          const isActive = currentPage === item

          return (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => onPageChange && onPageChange(item)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-mono transition-all rounded-[4px] cursor-pointer ${
                isActive
                  ? 'bg-black text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          )
        })}
      </div>

      {/* Nút NEXT */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="uppercase tracking-widest font-semibold transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed text-black hover:opacity-75 cursor-pointer px-1 py-1"
        aria-label="Next Page"
      >
        {t('common.next', 'NEXT')}
      </button>
    </nav>
  )
}