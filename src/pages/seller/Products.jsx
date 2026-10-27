import { useState, useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Package, CheckCircle2, AlertTriangle, Layers, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProductsByShop } from '../../services/api'
import { Pagination } from '../../components/common'
import {
  MetricCard,
  ProductFilters,
  ProductTable,
  ProductFormModal,
  ProductDeleteModal,
} from '../../components/seller'

// Số lượng sản phẩm hiển thị trên mỗi trang theo yêu cầu (10 sản phẩm/trang)
const ITEMS_PER_PAGE = 10

/**
 * Trang Quản lý Sản phẩm Kênh Người bán (Seller Products Page):
 * - Chia thành các component độc lập, tái sử dụng cao trong src/components/seller:
 *   + MetricCard: Khung hiển thị các chỉ số kho hàng (Total, In Stock, Low Stock, Out of Stock).
 *   + ProductFilters: Thanh tìm kiếm từ khóa, bộ lọc danh mục và trạng thái kho.
 *   + ProductTable: Bảng sản phẩm hiển thị ảnh (kèm onError), thông tin, giá, tồn kho và các nút thao tác.
 *   + ProductFormModal: Modal Thêm mới hoặc Cập nhật sản phẩm qua API (POST/PUT).
 *   + ProductDeleteModal: Hộp thoại xác nhận xóa sản phẩm qua API (DELETE).
 * - Tự động nhận diện Shop ID và Shop Name từ SellerLayout / AuthContext (Hỗ trợ đa shop độc lập).
 * - Tối ưu hiệu năng: Lấy trực tiếp danh sách sản phẩm theo ID Shop qua API (GET /products?shopId=...),
 *   thay vì tải toàn bộ kho dữ liệu rồi lọc ở client.
 * - Loại bỏ lạm dụng useMemo cho các phép tính mảng nhỏ để tối ưu hóa bộ nhớ RAM.
 * - Xử lý bắt lỗi ảnh tự động (handleImageError / FALLBACK_IMAGE) trên toàn bộ sản phẩm.
 * - Không dùng chấm tròn trạng thái, các badge đều có kích thước cố định, căn chuẩn thiết kế tối giản Fashora.
 */
export default function Products() {
  const outletContext = useOutletContext() || {}
  const { currentUser } = useAuth()

  // 1. Xác định Shop ID và Shop Name từ SellerLayout (Single Source of Truth suy từ currentUser)
  const sellerInfo = outletContext.sellerInfo || {}
  const currentShopId = outletContext.currentShopId || sellerInfo.shopId || sellerInfo.id || currentUser?.shopId || ''
  const shopName = sellerInfo.shopName || currentUser?.shopName || ''

  // 2. State lưu trữ dữ liệu sản phẩm từ API
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState('')

  // 3. Đồng bộ bộ lọc, tìm kiếm & phân trang với URL Search Params (Dynamic Navigation)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('category') || 'ALL'
  const selectedStockStatus = searchParams.get('stock') || 'ALL'
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateFilters = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(newParams).forEach(([key, val]) => {
          if (
            val === undefined ||
            val === null ||
            val === '' ||
            val === 'ALL' ||
            (key === 'page' && Number(val) <= 1)
          ) {
            next.delete(key)
          } else {
            next.set(key, String(val))
          }
        })
        return next
      },
      { replace: true }
    )
  }

  // 4. State điều khiển các modal Thêm / Sửa / Xóa
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // 5. Tải danh sách sản phẩm từ API theo ID Shop (tối ưu hiệu năng, giảm tải mạng và RAM)
  useEffect(() => {
    let isMounted = true

    getProductsByShop(currentShopId)
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res || []
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('Error loading products from API by Shop ID:', err)
        if (isMounted) {
          setError('Unable to load products from API server. Please check json-server.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentShopId])

  // Tự động tắt thông báo thành công sau 4 giây
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successToast])

  // 6. Trích xuất danh sách tất cả các danh mục độc nhất (unique categories)
  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).sort()

  // 7. Tính toán 4 chỉ số thống kê kho hàng (KPIs)
  const stats = {
    total: products.length,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  }

  products.forEach((p) => {
    const stock = Number(p.stock || 0)
    if (p.isSoldOut || stock <= 0) {
      stats.outOfStock++
    } else if (stock <= 5) {
      stats.lowStock++
    } else {
      stats.inStock++
    }
  })

  // 8. Lọc danh sách sản phẩm theo Search Query, Category và Stock Status
  const filteredProducts = products.filter((p) => {
    // Lọc theo từ khóa tìm kiếm (tên sản phẩm, danh mục, giá)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchName = (p.name || '').toLowerCase().includes(query)
      const matchCategory = (p.category || '').toLowerCase().includes(query)
      const matchPrice = String(p.price || '').includes(query)
      const matchId = String(p.id || '').toLowerCase().includes(query)

      if (!matchName && !matchCategory && !matchPrice && !matchId) {
        return false
      }
    }

    // Lọc theo Danh mục
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
      return false
    }

    // Lọc theo Trạng thái kho hàng
    const stock = Number(p.stock || 0)
    const isOut = p.isSoldOut || stock <= 0
    const isLow = !isOut && stock <= 5
    const isIn = !isOut && stock > 5

    if (selectedStockStatus === 'IN_STOCK' && !isIn) return false
    if (selectedStockStatus === 'LOW_STOCK' && !isLow) return false
    if (selectedStockStatus === 'OUT_OF_STOCK' && !isOut) return false

    return true
  })

  // 9. Cập nhật bộ lọc qua URL SearchParams -> tự động quay về trang 1
  const handleSearchChange = (query) => {
    updateFilters({ q: query, page: 1 })
  }

  const handleCategoryChange = (category) => {
    updateFilters({ category, page: 1 })
  }

  const handleStockStatusChange = (status) => {
    updateFilters({ stock: status, page: 1 })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handlePageChange = (page) => {
    updateFilters({ page })
  }

  // 10. Tính toán phân trang: Chỉ hiển thị đúng 10 sản phẩm cho trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 11. Xử lý mở modal Thêm mới sản phẩm
  const handleOpenAddModal = () => {
    setProductToEdit(null)
    setIsFormModalOpen(true)
  }

  // 12. Xử lý mở modal Sửa sản phẩm
  const handleOpenEditModal = (product) => {
    setProductToEdit(product)
    setIsFormModalOpen(true)
  }

  // 13. Xử lý mở modal Xóa sản phẩm
  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  // 14. Xử lý sau khi lưu thành công (Thêm mới hoặc Cập nhật)
  const handleSaveSuccess = (savedProduct, isEditMode) => {
    if (isEditMode) {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      )
      setSuccessToast(`Product "${savedProduct.name}" updated successfully.`)
    } else {
      setProducts((prev) => [savedProduct, ...prev])
      setSuccessToast(`New piece "${savedProduct.name}" added to catalog.`)
    }
  }

  // 15. Xử lý sau khi xóa sản phẩm thành công
  const handleDeleteSuccess = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId))
    setSuccessToast('Product removed from shop catalog successfully.')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Thông báo thông điệp thành công dạng Toast tối giản */}
      {successToast && (
        <div className="flex items-center justify-between p-3.5 bg-neutral-900 text-white text-xs rounded-[2px] font-mono tracking-wide shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast('')}
            className="text-neutral-400 hover:text-white text-xs uppercase px-2 py-0.5 ml-4"
          >
            Close
          </button>
        </div>
      )}

      {/* Thông báo lỗi tải dữ liệu nếu có */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] font-mono">
          {error}
        </div>
      )}

      {/* 1. HÀNG 4 THẺ CHỈ SỐ KHO HÀNG (KPI METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="TOTAL PRODUCTS"
          value={stats.total}
          subtext="Catalog product designs"
          icon={Package}
          loading={isLoading}
        />

        <MetricCard
          label="IN STOCK"
          value={stats.inStock}
          subtext="Ready for dispatch (>5)"
          icon={CheckCircle2}
          loading={isLoading}
        />

        <MetricCard
          label="LOW STOCK"
          value={stats.lowStock}
          subtext="Attention required (<=5)"
          icon={AlertTriangle}
          loading={isLoading}
        />

        <MetricCard
          label="OUT OF STOCK"
          value={stats.outOfStock}
          subtext="Depleted inventory items"
          icon={Layers}
          loading={isLoading}
        />
      </div>

      {/* 2. THANH BỘ LỌC, TÌM KIẾM & NÚT THÊM MỚI */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={uniqueCategories}
        selectedStockStatus={selectedStockStatus}
        onStockStatusChange={handleStockStatusChange}
        onAddNewProduct={handleOpenAddModal}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onResetFilters={handleResetFilters}
      />

      {/* 3. BẢNG DANH SÁCH SẢN PHẨM (HIỂN THỊ 10 SẢN PHẨM / TRANG) */}
      <ProductTable
        products={paginatedProducts}
        loading={isLoading}
        onEditProduct={handleOpenEditModal}
        onDeleteProduct={handleOpenDeleteModal}
      />

      {/* 4. ĐIỀU HƯỚNG PHÂN TRANG (10 SẢN PHẨM / TRANG) - KHỚP THIẾT KẾ PREVIOUS [1] 2 3 ... 8 NEXT */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          handlePageChange(page)
          window.scrollTo({ top: 250, behavior: 'smooth' })
        }}
      />

      {/* 4. MODAL THÊM MỚI / CHỈNH SỬA SẢN PHẨM */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        onSaveSuccess={handleSaveSuccess}
        shopId={currentShopId}
        shopName={shopName}
      />

      {/* 5. MODAL XÁC NHẬN XÓA SẢN PHẨM */}
      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
