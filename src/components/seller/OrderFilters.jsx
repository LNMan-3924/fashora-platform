import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Component OrderFilters: Thanh tìm kiếm và bộ lọc trạng thái đơn hàng của Seller
 * - Tìm kiếm đơn hàng theo Mã đơn (ID / OrderNumber), Tên khách hàng, Email hoặc Tên sản phẩm.
 * - Lọc theo trạng thái đơn hàng (ALL, PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED).
 * - Hiển thị số lượng đơn hàng theo thời gian thực và phân trang.
 * - Thiết kế tối giản, đồng bộ với layout của Seller Dashboard và Products (khung viền border-neutral-200, bo góc rounded-[2px]).
 *
 * Props:
 * - searchQuery: Từ khóa tìm kiếm hiện tại
 * - onSearchChange: Callback cập nhật từ khóa tìm kiếm
 * - selectedStatus: Trạng thái đơn hàng đang lọc
 * - onStatusChange: Callback cập nhật trạng thái đơn hàng
 * - totalCount: Tổng số đơn hàng của shop
 * - filteredCount: Số đơn hàng sau khi lọc
 * - currentPage: Trang hiện tại
 * - itemsPerPage: Số đơn hàng mỗi trang (mặc định 10)
 * - onResetFilters: Callback đặt lại toàn bộ bộ lọc
 */
export default function OrderFilters({
  searchQuery = '',
  onSearchChange,
  selectedStatus = 'ALL',
  onStatusChange,
  totalCount = 0,
  filteredCount = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onResetFilters,
  shopName = '',
}) {
  const { t } = useTranslation()
  const isFilteringActive =
    Boolean(searchQuery.trim()) || selectedStatus !== 'ALL'

  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] p-4 sm:p-5 shadow-xs space-y-4">
      {/* HÀNG TRÊN: Ô tìm kiếm + Dropdown lọc trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 1. Ô tìm kiếm đơn hàng */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('seller.orders.searchPlaceholder', 'Search orders by ID, customer or item...')}
            className="w-full pl-9 pr-8 py-2 text-xs border border-neutral-200 rounded-[2px] bg-neutral-50/50 focus:bg-white focus:border-black focus:outline-none transition-colors font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Dropdown lọc theo trạng thái đơn hàng */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Order Status"
            className="px-3 py-2 text-xs border border-neutral-200 rounded-[2px] bg-white text-neutral-800 font-mono focus:border-black focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('seller.orders.allStatus', '[ ALL STATUS ▾ ]')}</option>
            <option value="PENDING">{t('seller.status.pending', 'PENDING')}</option>
            <option value="CONFIRMED">{t('seller.status.confirmed', 'CONFIRMED')}</option>
            <option value="SHIPPING">{t('seller.status.shipping', 'SHIPPING')}</option>
            <option value="COMPLETED">{t('seller.status.completed', 'COMPLETED')}</option>
            <option value="CANCELLED">{t('seller.status.cancelled', 'CANCELLED')}</option>
          </select>
        </div>
      </div>

      {/* HÀNG DƯỚI: Thống kê kết quả hiển thị & Nút Reset */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
        <div>
          {t('seller.orders.showing', 'Showing')}{' '}
          <span className="font-semibold text-black">
            {filteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredCount)}
          </span>{' '}
          {t('seller.orders.of', 'of')} <span className="font-semibold text-black">{filteredCount}</span> {t('seller.orders.ordersCount', 'orders')}{' '}
          <span className="text-neutral-400">
            {t('seller.orders.totalInShop', { total: totalCount, shop: shopName, defaultValue: `(Total ${totalCount} in ${shopName})` })}
          </span>
        </div>

        {isFilteringActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-neutral-600 hover:text-black underline cursor-pointer"
          >
            {t('seller.orders.resetFilters', 'Reset all filters')}
          </button>
        )}
      </div>
    </div>
  )
}

