import { Search, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ProductFilters({
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'ALL',
  onCategoryChange,
  categories = [],
  selectedStockStatus = 'ALL',
  onStockStatusChange,
  onAddNewProduct,
  totalCount = 0,
  filteredCount = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onResetFilters,
}) {
  const { t } = useTranslation()
  const isFilteringActive =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'ALL' ||
    selectedStockStatus !== 'ALL'

  return (
    <div className="bg-white border border-neutral-200 rounded-[2px] p-4 sm:p-5 shadow-xs space-y-4">
      {/* HÀNG TRÊN: Ô tìm kiếm + Bộ lọc + Nút thêm mới */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* 1. Ô tìm kiếm sản phẩm theo tên hoặc mã */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('seller.products.searchPlaceholder', 'Search products by name or code...')}
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

        {/* 2. Cụm bộ lọc Category & Stock + Nút thêm sản phẩm */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc theo danh mục sản phẩm */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Category"
            className="px-3 py-2 text-xs border border-neutral-200 rounded-[2px] bg-white text-neutral-800 font-mono focus:border-black focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('seller.products.allCategories', 'ALL CATEGORIES')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Lọc theo tình trạng tồn kho */}
          <select
            value={selectedStockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
            aria-label="Filter by Stock Status"
            className="px-3 py-2 text-xs border border-neutral-200 rounded-[2px] bg-white text-neutral-800 font-mono focus:border-black focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('seller.products.allStock', 'ALL STOCK STATUS')}</option>
            <option value="IN_STOCK">{t('seller.products.stockIn', 'IN STOCK (> 5)')}</option>
            <option value="LOW_STOCK">{t('seller.products.stockLow', 'LOW STOCK (<= 5)')}</option>
            <option value="OUT_OF_STOCK">{t('seller.products.stockOut', 'OUT OF STOCK (0)')}</option>
          </select>

          {/* Nút thêm mới sản phẩm */}
          <button
            type="button"
            onClick={onAddNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] hover:bg-neutral-800 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('seller.products.addProduct', 'ADD PRODUCT')}</span>
          </button>
        </div>
      </div>

      {/* HÀNG DƯỚI: Thống kê kết quả tìm kiếm và nút Reset */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
        <div>
          {t('seller.products.showing', 'Showing')}{' '}
          <span className="font-semibold text-black">
            {filteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredCount)}
          </span>{' '}
          {t('seller.products.of', 'of')}{' '}
          <span className="font-semibold text-black">{filteredCount}</span>{' '}
          {t('seller.products.productsCount', 'products')}{' '}
          <span className="text-neutral-400">
            {t('seller.products.totalInCatalog', { total: totalCount, defaultValue: `(Total ${totalCount} in catalog)` })}
          </span>
        </div>

        {isFilteringActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-neutral-600 hover:text-black underline cursor-pointer"
          >
            {t('seller.products.resetFilters', 'Reset all filters')}
          </button>
        )}
      </div>
    </div>
  )
}

