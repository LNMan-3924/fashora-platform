import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProducts, getShops } from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import QuickAddModal from '../../components/product/QuickAddModal';
import { Toast } from '../../components/common';
import { useCartStore } from '../../stores';

// Danh mục chuẩn theo hệ thống
const CATEGORIES = [
  { label: 'ALL', value: 'ALL' },
  { label: 'SET', value: 'SET' },
  { label: 'SHIRT', value: 'SHIRT' },
  { label: 'PANTS', value: 'PANTS' },
  { label: 'SHOES', value: 'SHOES' },
  { label: 'ACCESSORIES', value: 'ACCESSORIES' },
];

export function Shop() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = (searchParams.get('category') || 'ALL').toUpperCase();

  // Bộ lọc & Sắp xếp
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  // State phân trang: 16 sản phẩm / trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 16;

  // Quản lý Modal Quick Add
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const addToCartStore = useCartStore((state) => state.addToCart);

  // Fetch dữ liệu từ API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to load products. A connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động cuộn lên đầu trang khi vào trang Shop
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const response = await getProducts();
        if (isMounted) {
          setProducts(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fetch error:', err);
          setError('Unable to load products. A connection error occurred.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      try {
        const sRes = await getShops();
        if (isMounted && Array.isArray(sRes?.data)) {
          setShops(sRes.data);
        }
      } catch (sErr) {
        console.warn('Shop: Error loading shops:', sErr);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Nhận diện Shop nếu từ khóa tìm kiếm khớp với Tên Shop
  const matchedShop = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return shops.find(
      (s) =>
        s.status !== 'PAUSED' &&
        (s.name?.toLowerCase() === q ||
          s.slug?.toLowerCase() === q ||
          s.name?.toLowerCase().includes(q))
    );
  }, [searchQuery, shops]);

  // Bộ lọc đa điều kiện & Sắp xếp giá
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Loại bỏ hoàn toàn các sản phẩm Sold Out khỏi trang Shop chung
    result = result.filter((p) => {
      const isSoldOut = Boolean(
        p.isSoldOut ||
        (p.stock !== undefined && Number(p.stock) === 0) ||
        (typeof p.badge === 'string' &&
          (p.badge.trim().toUpperCase() === 'SOLDOUT' ||
           p.badge.trim().toUpperCase() === 'SOLD OUT'))
      );
      return !isSoldOut;
    });

    // Lọc theo Category
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (p) => p.category?.toUpperCase() === selectedCategory
      );
    }

    // Tìm kiếm theo tên sản phẩm, tên shop hoặc danh mục
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const shopMatch = p.shopName?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        return nameMatch || shopMatch || catMatch;
      });
    }

    // Lọc theo giá
    if (minPrice) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Sắp xếp
    if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  // Tính toán tổng số trang & lấy sản phẩm cho trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridElement = document.getElementById('fashora-product-grid');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleCategorySelect = (catValue) => {
    setCurrentPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (catValue !== 'ALL') next.set('category', catValue);
        else next.delete('category');
        return next;
      },
      { replace: true }
    );
  };

  const handleSearchChange = (val) => {
    setCurrentPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val.trim()) next.set('q', val.trim());
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };

  const handleMinPriceChange = (val) => {
    setMinPrice(val);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('RECOMMENDED');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="w-full">
      {/* 1. Breadcrumb */}
      <nav className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
        <Link to="/home" className="hover:text-black transition-colors">HOME</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{selectedCategory}</span>
      </nav>

      {/* 2. Tiêu đề trang */}
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight uppercase text-neutral-900">
          ALL PRODUCTS
        </h1>
        <p className="mt-1 text-xs tracking-widest uppercase text-neutral-400">
          EXPLORE THE FASHORA COLLECTION
        </p>
      </div>

      {/* 3. Category Tabs */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategorySelect(cat.value)}
              className={`h-9 min-w-[52px] px-3.5 rounded-md border text-xs font-medium tracking-wide transition-all uppercase cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-black border-black text-white'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4. Controls Bar: Search, Price, Sort */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 w-52 rounded-full border border-neutral-200 bg-neutral-50/50 pl-8 pr-4 text-xs uppercase placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs uppercase text-neutral-400">
            <span>PRICE:</span>
            <input
              type="number"
              placeholder="Min ₫"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="h-9 w-20 rounded-md border border-neutral-200 px-2 text-xs focus:border-black focus:outline-none"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max ₫"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="h-9 w-20 rounded-md border border-neutral-200 px-2 text-xs focus:border-black focus:outline-none"
            />
            <button
              onClick={handleResetFilters}
              className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-black cursor-pointer"
            >
              RESET
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="tracking-wider uppercase text-neutral-400">
            SHOWING {filteredProducts.length} PRODUCTS
          </span>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 uppercase">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 rounded-md border border-neutral-200 px-3 text-xs font-semibold uppercase focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="RECOMMENDED">RECOMMENDED</option>
              <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
              <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Vùng nội dung theo từng State */}
      <div className="mt-8 w-full">
        {loading && (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-[3/4] w-full bg-neutral-200/70 animate-pulse" />
                <div className="mt-3 h-3.5 w-3/4 bg-neutral-200/70 animate-pulse" />
                <div className="mt-1.5 h-3 w-1/3 bg-neutral-200/70 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500 text-red-500 text-xl font-bold">
              !
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-widest text-neutral-900">
              UNABLE TO LOAD PRODUCTS
            </h3>
            <p className="mt-2 max-w-md text-xs uppercase tracking-wider text-neutral-400">
              A CONNECTION ERROR OCCURRED WHILE QUERYING THE CATALOG ARCHIVE. PLEASE TRY RELOADING.
            </p>
            <button
              onClick={fetchProducts}
              className="mt-6 border border-black bg-white px-8 py-2.5 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:bg-black hover:text-white transition-colors"
            >
              RETRY
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-md border border-neutral-300 text-neutral-400">
              <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-bold uppercase tracking-widest text-neutral-900">
              NO PRODUCTS FOUND
            </h3>
            <p className="mt-2 max-w-md text-xs uppercase tracking-wider text-neutral-400">
              THERE ARE NO ITEMS MATCHING YOUR ACTIVE CATEGORY, SEARCH KEYWORD, OR PRICE RANGE FILTER.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 bg-black px-8 py-2.5 text-xs font-semibold tracking-widest uppercase text-white hover:bg-neutral-800 transition-colors"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        )}

        {/* BANNER ATELIER NỔI BẬT NẾU TÌM THẤY SHOP PHÙ HỢP */}
        {!loading && !error && matchedShop && (
          <div className="mb-8 p-4 sm:p-5 bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full border border-neutral-700 bg-black overflow-hidden shrink-0 flex items-center justify-center">
                {matchedShop.logo ? (
                  <img
                    src={matchedShop.logo}
                    alt={matchedShop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center bg-black text-white font-mono text-sm font-bold uppercase ${
                    matchedShop.logo ? 'hidden' : 'flex'
                  }`}
                >
                  {matchedShop.name ? matchedShop.name.charAt(0) : 'A'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  OFFICIAL ATELIER STOREFRONT
                </span>
                <h4 className="text-sm sm:text-base font-bold font-mono tracking-wider uppercase">
                  {matchedShop.name}
                </h4>
                <span className="text-[11px] text-neutral-400 font-mono block">
                  {matchedShop.category || 'INDEPENDENT ATELIER'}
                </span>
              </div>
            </div>
            <Link
              to={`/store/${matchedShop.slug || matchedShop.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors shrink-0"
            >
              <span>VISIT ATELIER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* LƯỚI SẢN PHẨM */}
        {!loading && !error && paginatedProducts.length > 0 && (
          <div id="fashora-product-grid" className="w-full">
            <ProductGrid
              products={paginatedProducts}
              onQuickAdd={(item) => {
                setQuickAddProduct(item);
              }}
            />
          </div>
        )}

        {/* CỤM PHÂN TRANG */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 border-t border-neutral-100 pt-8">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`h-9 w-9 rounded-md border text-xs flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-200 text-neutral-700 hover:border-black cursor-pointer'
              }`}
              title="Previous Page"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isCurrent = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`h-9 w-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`h-9 w-9 rounded-md border text-xs flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-200 text-neutral-700 hover:border-black cursor-pointer'
              }`}
              title="Next Page"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 6. Quick Add Modal */}
      <QuickAddModal
        key={quickAddProduct?.id || 'none'}
        product={quickAddProduct}
        isOpen={Boolean(quickAddProduct)}
        onClose={() => setQuickAddProduct(null)}
        onConfirm={(item) => {
          if (addToCartStore && quickAddProduct) {
            const result = addToCartStore(
              {
                ...quickAddProduct,
                images: quickAddProduct.images || (quickAddProduct.image ? [quickAddProduct.image] : []),
              },
              item.selectedSize || item.size || 'One Size',
              item.selectedColor || item.color || 'Standard',
              item.quantity || 1
            );
            if (result?.success === false) {
              setToastMessage(result.message);
            } else {
              setToastMessage(`Added ${quickAddProduct.name} to cart.`);
            }
          }
        }}
      />

      {/* 7. Toast thông báo */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}

/* ==========================================================================
   Wrapper: ShopWithViewControls
   - Giới hạn độ rộng: max-w-7xl mx-auto
   - Padding responsive: px-4 sm:px-6 lg:px-8 py-8 sm:py-12
   ========================================================================== */
function ShopWithViewControls(props) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const [viewCols, setViewCols] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewCols((prev) => {
        if (mobile && prev === 4) return 2;
        if (!mobile && prev === 1) return 2;
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTargetGrid = () => {
      const container = document.getElementById('fashora-product-grid');
      if (!container) return;

      const targetGrid = container.querySelector('.grid') || container;

      targetGrid.classList.remove(
        'grid-cols-1',
        'grid-cols-2',
        'sm:grid-cols-2',
        'sm:grid-cols-3',
        'lg:grid-cols-4'
      );

      if (viewCols === 1) {
        targetGrid.classList.add('grid-cols-1');
      } else if (viewCols === 2) {
        targetGrid.classList.add('grid-cols-2');
      } else if (viewCols === 4) {
        targetGrid.classList.add('grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-4');
      }
    };

    updateTargetGrid();
    const timer = setTimeout(updateTargetGrid, 100);
    return () => clearTimeout(timer);
  }, [viewCols, isMobile]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Nút VIEW căn góc phải của container chuẩn */}
      <div className="flex justify-end -mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">
            VIEW
          </span>

          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setViewCols(1)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors cursor-pointer ${
                  viewCols === 1
                    ? 'border-black bg-black font-bold text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-black'
                }`}
                title="View 1-column layout"
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setViewCols(2)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors cursor-pointer ${
                  viewCols === 2
                    ? 'border-black bg-black font-bold text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-black'
                }`}
                title="View 2-column layout"
              >
                2
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setViewCols(2)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors cursor-pointer ${
                  viewCols === 2
                    ? 'border-black bg-black font-bold text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-black'
                }`}
                title="View 2-column layout"
              >
                2
              </button>

              <button
                type="button"
                onClick={() => setViewCols(4)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors cursor-pointer ${
                  viewCols === 4
                    ? 'border-black bg-black font-bold text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-black'
                }`}
                title="View 4-column layout"
              >
                4
              </button>
            </>
          )}

          <button
            type="button"
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:border-black transition-colors cursor-pointer"
            title="Filter products"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
          </button>
        </div>
      </div>

      <Shop {...props} />
    </div>
  );
}

export default ShopWithViewControls;