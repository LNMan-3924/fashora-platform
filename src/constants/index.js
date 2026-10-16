export * from './model'
export * from './commerce'

// Các tùy chọn Sort ở trang danh mục sản phẩm (Shop)
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

// Bộ lọc khoảng giá mẫu
export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-1m', label: 'Under 1.000.000₫', min: 0, max: 1000000 },
  { id: '1m-2m', label: '1.000.000₫ - 2.000.000₫', min: 1000000, max: 2000000 },
  { id: 'over-2m', label: 'Over 2.000.000₫', min: 2000000, max: Infinity },
]