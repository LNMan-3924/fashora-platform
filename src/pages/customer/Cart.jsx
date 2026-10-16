import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'

// Import store giỏ hàng toàn cục (quản lý bằng Zustand)
import { useCartStore } from '../../stores'
import { useAuth } from '../../contexts/AuthContext'

// Import các sub-component chuyên biệt của trang giỏ hàng
import {
  CartShopGroup,
  CartOrderSummary,
  CartEmptyState,
} from '../../components/cart'

// Import các component dùng chung (gợi ý phối đồ, modal thêm nhanh & toast)
import { Toast } from '../../components/common'
import {
  CompleteTheLook,
  QuickAddModal,
} from '../../components/product'
import { getCartItemKey, COMMERCE_STORAGE_KEYS } from '../../constants'

export default function Cart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()

  // =========================================================================
  // BƯỚC 1: LẤY DỮ LIỆU & CÁC HÀM XỬ LÝ TỪ ZUSTAND STORE
  // =========================================================================
  // cartItems: Danh sách tất cả các sản phẩm đang có trong giỏ hàng (lưu trong localStorage)
  const cartItems = useCartStore((state) => state.cartItems)
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  // =========================================================================
  // BƯỚC 2: QUẢN LÝ TRẠNG THÁI GIAO DIỆN (UI STATE)
  // =========================================================================
  // Lưu danh sách key của các sản phẩm được chọn để thanh toán (mặc định null = chọn tất cả)
  const [selectedKeys, setSelectedKeys] = useState(null)

  // Lưu thông tin món đồ đang được mở trong popup "Thêm nhanh" (Quick Add)
  const [quickAddProduct, setQuickAddProduct] = useState(null)

  // Nội dung thông báo Toast nổi góc màn hình
  const [toastMessage, setToastMessage] = useState('')

  // Tự động cuộn lên đầu trang khi vào giỏ hàng
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Hàm tiện ích: hiển thị thông báo Toast trong 3 giây rồi tự ẩn
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  // =========================================================================
  // BƯỚC 4: TÍNH TOÁN & XỬ LÝ DỮ LIỆU CHỌN SẢN PHẨM (SELECTION LOGIC)
  // =========================================================================
  // Tái sử dụng hàm tạo key duy nhất từ src/constants (ID + Size + Màu sắc)
  const getItemKey = getCartItemKey

  // Danh sách toàn bộ key của tất cả sản phẩm đang có trong giỏ
  const allItemKeys = useMemo(() => {
    return cartItems.map(getItemKey)
  }, [cartItems])

  // Danh sách các key thực sự đang được chọn:
  // - Nếu selectedKeys là null -> mặc định chọn toàn bộ sản phẩm
  // - Nếu người dùng đã click chọn/bỏ chọn -> lấy theo mảng selectedKeys
  const activeSelectedKeys = useMemo(() => {
    return selectedKeys !== null ? selectedKeys : allItemKeys
  }, [selectedKeys, allItemKeys])

  // Kiểm tra xem tất cả sản phẩm đã được chọn hết chưa
  const isAllSelected =
    cartItems.length > 0 && activeSelectedKeys.length === cartItems.length

  // =========================================================================
  // BƯỚC 5: GOM NHÓM SẢN PHẨM THEO SHOP & TÍNH TỔNG TIỀN TẠM TÍNH
  // =========================================================================
  // Gom nhóm sản phẩm theo tên thương hiệu (mặc định là 'M STUDIO')
  const groupedByShop = useMemo(() => {
    const groups = {}
    cartItems.forEach((item) => {
      const shopName = item.shopName || 'M STUDIO'
      if (!groups[shopName]) groups[shopName] = []
      groups[shopName].push(item)
    })
    return groups
  }, [cartItems])

  // Tính tổng tiền tạm tính (Subtotal) CHỈ DỰA TRÊN các sản phẩm đang được tick chọn
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const key = getItemKey(item)
      if (activeSelectedKeys.includes(key)) {
        return total + (item.price || 0) * (item.quantity || 1)
      }
      return total
    }, 0)
  }, [cartItems, activeSelectedKeys])

  // Danh sách các sản phẩm đang được tick chọn thực tế để chuyển sang trang Checkout
  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => activeSelectedKeys.includes(getItemKey(item)))
  }, [cartItems, activeSelectedKeys])

  // =========================================================================
  // BƯỚC 6: CÁC HÀM XỬ LÝ SỰ KIỆN TƯƠNG TÁC (HANDLERS)
  // =========================================================================
  // Chọn / Bỏ chọn một sản phẩm riêng lẻ
  const handleToggleItem = (itemKey) => {
    const isCurrentlySelected = activeSelectedKeys.includes(itemKey)
    if (isCurrentlySelected) {
      // Bỏ chọn món này: lọc món này ra khỏi danh sách chọn
      setSelectedKeys(activeSelectedKeys.filter((k) => k !== itemKey))
    } else {
      // Chọn món này: thêm key vào danh sách chọn
      setSelectedKeys([...activeSelectedKeys, itemKey])
    }
  }

  // Chọn / Bỏ chọn toàn bộ sản phẩm của một Gian hàng
  const handleToggleShop = (shopItems, selectAll) => {
    const shopKeys = shopItems.map(getItemKey)
    if (selectAll) {
      // Thêm toàn bộ sản phẩm của shop này vào danh sách được chọn
      const merged = Array.from(new Set([...activeSelectedKeys, ...shopKeys]))
      setSelectedKeys(merged)
    } else {
      // Bỏ toàn bộ sản phẩm của shop này ra khỏi danh sách được chọn
      setSelectedKeys(activeSelectedKeys.filter((k) => !shopKeys.includes(k)))
    }
  }

  // Nút "Select All": Chọn tất cả hoặc bỏ chọn tất cả
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Đang chọn hết thì bấm vào sẽ bỏ chọn toàn bộ
      setSelectedKeys([])
    } else {
      // Chưa chọn hết thì bấm vào sẽ chọn lại toàn bộ
      setSelectedKeys(allItemKeys)
    }
  }

  // Nút "Delete Selected": Xóa tất cả các sản phẩm đang được chọn
  const handleDeleteSelected = () => {
    if (activeSelectedKeys.length === 0) {
      showToast('No items currently selected.')
      return
    }

    // Duyệt qua giỏ hàng và xóa những món đang được chọn
    cartItems.forEach((item) => {
      const key = getItemKey(item)
      if (activeSelectedKeys.includes(key)) {
        removeFromCart(item.id, item.selectedSize, item.selectedColor)
      }
    })

    setSelectedKeys([])
    showToast('Selected items removed from cart.')
  }

  // Xóa một món hàng riêng lẻ và dọn dẹp key khỏi danh sách được chọn (nếu có)
  const handleRemoveSingleItem = (id, size, color) => {
    removeFromCart(id, size, color)
    if (selectedKeys !== null) {
      const removedKey = getCartItemKey({ id, selectedSize: size, selectedColor: color })
      setSelectedKeys((prev) => (prev ? prev.filter((k) => k !== removedKey) : null))
    }
    showToast('Item removed from cart.')
  }

  // Xác nhận thêm món đồ từ mục "Complete The Look" vào giỏ hàng
  const handleConfirmQuickAdd = (lookItem) => {
    const isLoggedIn = Boolean(currentUser?.id || localStorage.getItem('currentUserId'))
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } })
      return
    }
    addToCart(
      {
        ...lookItem,
        images: lookItem.images || [lookItem.image],
      },
      lookItem.selectedSize || 'One Size',
      lookItem.selectedColor || 'Standard',
      lookItem.quantity || 1
    )
    showToast(`Added ${lookItem.name} to cart.`)
  }

  // Xử lý chuyển sang trang Checkout chỉ với những món đang được tick chọn
  const handleProceedCheckout = () => {
    if (selectedCartItems.length === 0) {
      showToast('Please select at least one item to proceed to checkout.')
      return
    }

    try {
      sessionStorage.setItem(
        COMMERCE_STORAGE_KEYS.CHECKOUT_ITEMS,
        JSON.stringify(selectedCartItems)
      )
    } catch {
      // ignore
    }

    if (!currentUser) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/checkout',
          },
        },
      })
      return
    }

    navigate('/checkout', {
      state: {
        selectedItems: selectedCartItems,
      },
    })
  }

  // =========================================================================
  // BƯỚC 7: RENDER GIAO DIỆN
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. THANH ĐIỀU HƯỚNG BREADCRUMBS */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 mb-4 text-xs font-mono tracking-widest text-neutral-400 uppercase"
      >
        <Link to="/" className="hover:text-[#111111] transition-colors">
          HOME
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-[#111111] font-semibold">SHOPPING CART</span>
      </nav>

      {/* 2. TIÊU ĐỀ TRANG & NÚT TIẾP TỤC KHÁM PHÁ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-200 gap-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] uppercase">
          YOUR SHOPPING CART
        </h1>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-neutral-500 hover:text-[#111111] transition-colors group"
        >
          <span>CONTINUE EXPLORING COLLECTION</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 3. THANH CHỌN TẤT CẢ (SELECT ALL & DELETE SELECTED) */}
      {cartItems.length > 0 && (
        <div className="flex items-center justify-between py-3.5 px-4 my-6 bg-neutral-50 border border-neutral-200 rounded-[2px]">
          {/* Checkbox chọn tất cả */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 accent-[#111111] cursor-pointer rounded-none"
            />
            <span className="text-xs font-semibold tracking-wider text-[#111111] uppercase font-mono">
              [✓] SELECT ALL ({cartItems.length < 10 ? `0${cartItems.length}` : cartItems.length} ITEMS)
            </span>
          </label>

          {/* Nút xóa các mục đã chọn */}
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="text-xs font-medium tracking-wider text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">DELETE SELECTED</span>
          </button>
        </div>
      )}

      {/* 4. KHUNG BỐ CỤC CHÍNH (8 CỘT SẢN PHẨM + 4 CỘT TÓM TẮT ĐƠN HÀNG) */}
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI (8 cột): Danh sách sản phẩm gom nhóm theo từng Shop */}
          <div className="lg:col-span-8 space-y-6">
            {Object.entries(groupedByShop).map(([shopName, items]) => (
              <CartShopGroup
                key={shopName}
                shopName={shopName}
                items={items}
                selectedItemIds={activeSelectedKeys}
                onToggleShopSelect={handleToggleShop}
                onToggleItemSelect={handleToggleItem}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={handleRemoveSingleItem}
              />
            ))}
          </div>

          {/* CỘT PHẢI (4 cột): Bảng tóm tắt tiền và nút Checkout (nổi cố định khi cuộn trang) */}
          <div className="lg:col-span-4">
            <CartOrderSummary
              subtotal={subtotal}
              selectedCount={activeSelectedKeys.length}
              onProceedCheckout={handleProceedCheckout}
            />
          </div>
        </div>
      ) : (
        /* HIỂN THỊ KHI GIỎ HÀNG ĐANG TRỐNG */
        <CartEmptyState />
      )}

      {/* 5. GỢI Ý PHỐI ĐỒ (COMPLETE THE LOOK - COMPONENT DÙNG CHUNG) */}
      <CompleteTheLook
        onQuickAdd={(item) => {
          const isLoggedIn = Boolean(currentUser?.id || localStorage.getItem('currentUserId'))
          if (!isLoggedIn) {
            navigate('/login', { state: { from: location } })
            return
          }
          setQuickAddProduct(item)
        }}
      />

      {/* 6. CỬA SỔ POPUP THÊM NHANH (QUICK ADD MODAL) */}
      <QuickAddModal
        key={quickAddProduct?.id || 'none'}
        isOpen={Boolean(quickAddProduct)}
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        onConfirm={handleConfirmQuickAdd}
      />

      {/* 7. TOAST THÔNG BÁO TÁI SỬ DỤNG TỪ COMMON */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  )
}