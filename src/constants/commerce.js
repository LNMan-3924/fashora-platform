import {
  Clock,
  CheckCircle2,
  Truck,
  Check,
  Ban,
} from 'lucide-react'

/**
 * ============================================================================
 * COMMERCE CONSTANTS & SHARED HELPERS (Single Source of Truth)
 * Tập trung các hằng số, bộ định dạng và hàm xử lý dùng chung cho:
 * - Giỏ hàng (Cart)
 * - Đặt hàng & Thanh toán (Checkout, Order Success)
 * - Quản lý đơn hàng (My Orders)
 * - Chi tiết đơn hàng (Order Detail)
 * ============================================================================
 */

// 1. CÁC KHÓA LƯU TRỮ LOCALSTORAGE TOÀN HỆ THỐNG
export const COMMERCE_STORAGE_KEYS = {
  CART: 'fashora-cart-storage',
  USER_ORDERS: 'fashora_user_orders',
  LATEST_ORDER: 'fashora_latest_order',
  CHECKOUT_ITEMS: 'fashora_checkout_items',
  // Ghi chú: Dữ liệu hồ sơ người dùng (Profile) và địa chỉ nhận hàng (Shipping Addresses)
  // được quản lý tập trung 100% qua API backend (/users/:id) và AuthContext, hoàn toàn không lưu LocalStorage.
}

// 2. ẢNH DỰ PHÒNG MẶC ĐỊNH & XỬ LÝ LỖI ẢNH (FALLBACK IMAGE)
export const FALLBACK_IMAGE = '/assets/fallback.png'

/**
 * Tự động chuyển src sang ảnh fallback nếu ảnh sản phẩm bị lỗi 404 hoặc mất kết nối
 */
export const handleImageError = (e) => {
  if (e?.currentTarget && !e.currentTarget.src.includes(FALLBACK_IMAGE)) {
    e.currentTarget.src = FALLBACK_IMAGE
  }
}

// 3. BỘ ĐỊNH DẠNG TIỀN TỆ & THỜI GIAN (FORMATTERS)

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND)
 * Ví dụ: 1250000 -> "1.250.000₫", 0 -> "0₫"
 */
export const formatVND = (amount) => {
  return Number(amount || 0).toLocaleString('vi-VN') + '₫'
}

/**
 * Định dạng chuỗi ngày tháng sang chuẩn quốc tế (VD: "Oct 24, 2026")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return String(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  } catch {
    return String(dateStr)
  }
}

// 4. BỘ ĐỊNH DANH MÓN HÀNG DUY NHẤT (ITEM KEY GENERATOR)

/**
 * Tạo khóa duy nhất cho mỗi món hàng kết hợp (ID + Size + Màu sắc)
 * Dùng để đồng nhất giữa Cart, CartShopGroup, Checkout và Zustand Store
 */
export const getCartItemKey = (item) => {
  if (!item) return ''
  const id = item.id || ''
  const size = item.selectedSize || 'Standard'
  const color = item.selectedColor || 'Standard'
  return `${id}_${size}_${color}`
}

// 5. CẤU HÌNH TRẠNG THÁI ĐƠN HÀNG (ORDER STATUS CONFIGURATION)

export const STATUS_CONFIG = {
  PENDING: {
    label: 'PENDING',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-300',
    noticeBox: 'bg-amber-50/40 border-amber-100/60 text-amber-900',
    noticeText: 'Your order has just been placed. The shop is preparing your order for confirmation.',
    icon: Clock,
    stepIndex: 1,
  },
  CONFIRMED: {
    label: 'CONFIRMED',
    badgeClass: 'bg-sky-50 text-sky-800 border border-sky-300',
    noticeBox: 'bg-sky-50/40 border-sky-100/60 text-sky-900',
    noticeText: 'Your order is being prepared by the shop. Thank you for your patience.',
    icon: CheckCircle2,
    stepIndex: 2,
  },
  PROCESSING: {
    label: 'CONFIRMED',
    badgeClass: 'bg-sky-50 text-sky-800 border border-sky-300',
    noticeBox: 'bg-sky-50/40 border-sky-100/60 text-sky-900',
    noticeText: 'Your order is being prepared by the shop. Thank you for your patience.',
    icon: CheckCircle2,
    stepIndex: 2,
  },
  SHIPPING: {
    label: 'SHIPPING',
    badgeClass: 'bg-purple-50 text-purple-800 border border-purple-300',
    noticeBox: 'bg-purple-50/40 border-purple-100/60 text-purple-900',
    noticeText: 'Your order is on its way to you. Please wait for delivery.',
    icon: Truck,
    stepIndex: 3,
  },
  COMPLETED: {
    label: 'COMPLETED',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-300',
    noticeBox: 'bg-emerald-50/40 border-emerald-100/60 text-emerald-900',
    noticeText: 'Your order has been delivered to you. Thank you for shopping with us.',
    icon: Check,
    stepIndex: 4,
  },
  CANCELLED: {
    label: 'CANCELLED',
    badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-300',
    noticeBox: 'bg-neutral-100/70 border-neutral-200 text-neutral-600',
    noticeText: 'This order has been cancelled.',
    icon: Ban,
    stepIndex: -1,
  },
}

/**
 * Danh sách các trạng thái được phép yêu cầu Hủy đơn
 */
export const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING']

/**
 * Kiểm tra xem một trạng thái đơn hàng có được phép hủy hay không
 */
export const canCancelOrder = (status) => {
  const normalized = (status || '').toUpperCase()
  return CANCELLABLE_STATUSES.includes(normalized)
}

/**
 * Danh sách các tab trạng thái dùng cho thanh OrderStatusTabs
 */
export const ORDER_TABS = [
  { key: 'all', label: 'ALL ORDERS' },
  { key: 'pending', label: 'PENDING' },
  { key: 'confirmed', label: 'CONFIRMED' },
  { key: 'shipping', label: 'SHIPPING' },
  { key: 'completed', label: 'COMPLETED' },
  { key: 'cancelled', label: 'CANCELLED' },
]

// 6. BỘ ĐỊNH DẠNG ĐỊA CHỈ NGƯỜI NHẬN

/**
 * Ghép chuỗi địa chỉ đầy đủ từ đối tượng người nhận 3 cấp
 */
export const formatFullAddress = (recipient) => {
  if (!recipient) return 'No address provided'
  if (typeof recipient === 'string') return recipient
  const parts = [
    recipient.address || recipient.street,
    recipient.ward,
    recipient.district,
    recipient.city,
  ].filter((p) => p && String(p).trim().length > 0)
  return parts.length > 0 ? parts.join(', ') : 'No address provided'
}

// 7. TIỆN ÍCH QUẢN LÝ ĐƠN HÀNG TRÊN LOCALSTORAGE (OFFLINE-FIRST STORE)

/**
 * Lấy danh sách đơn hàng thực tế của người dùng từ LocalStorage
 */
export const getStoredUserOrders = () => {
  try {
    const raw = localStorage.getItem(COMMERCE_STORAGE_KEYS.USER_ORDERS)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn('Error reading orders from LocalStorage:', err)
    return []
  }
}

/**
 * Lưu hoặc cập nhật một đơn hàng vào LocalStorage
 */
export const storeUserOrder = (order) => {
  if (!order) return
  try {
    const existing = getStoredUserOrders()
    const orderNumber = order.orderNumber || order.id
    const filtered = existing.filter(
      (o) => (o.orderNumber || o.id) !== orderNumber
    )
    const updated = [order, ...filtered]
    localStorage.setItem(
      COMMERCE_STORAGE_KEYS.USER_ORDERS,
      JSON.stringify(updated)
    )
    localStorage.setItem(
      COMMERCE_STORAGE_KEYS.LATEST_ORDER,
      JSON.stringify(order)
    )
  } catch (err) {
    console.warn('Error storing order to LocalStorage:', err)
  }
}

/**
 * Cập nhật trạng thái một đơn hàng trong LocalStorage (ví dụ: CANCELLED)
 */
export const updateStoredOrderStatus = (orderIdOrNumber, newStatus) => {
  if (!orderIdOrNumber) return
  try {
    const existing = getStoredUserOrders()
    const target = String(orderIdOrNumber).toLowerCase()
    const updated = existing.map((o) => {
      const match =
        String(o.id || '').toLowerCase() === target ||
        String(o.orderNumber || '').toLowerCase() === target ||
        String(o.orderNumber || '').toLowerCase() === `#${target}`
      return match ? { ...o, status: newStatus } : o
    })
    localStorage.setItem(
      COMMERCE_STORAGE_KEYS.USER_ORDERS,
      JSON.stringify(updated)
    )
  } catch (err) {
    console.warn('Error updating order status in LocalStorage:', err)
  }
}

/**
 * Tra cứu đơn hàng theo ID hoặc OrderNumber trong LocalStorage
 */
export const findStoredOrder = (idOrNumber) => {
  if (!idOrNumber) return null
  const target = String(idOrNumber).trim().toLowerCase()
  const orders = getStoredUserOrders()
  return (
    orders.find(
      (o) =>
        String(o.id || '').toLowerCase() === target ||
        String(o.orderNumber || '').toLowerCase() === target ||
        String(o.orderNumber || '').toLowerCase() === `#${target}`
    ) || null
  )
}

// ============================================================================
// 7. TIỆN ÍCH DÙNG CHUNG CHO SHOP, PHÂN NHÓM & PHÂN QUYỀN ĐƠN HÀNG (SSOT)
// ============================================================================

/**
 * Trích xuất Shop ID và Shop Name chuẩn từ đối tượng sản phẩm hoặc item trong giỏ/đơn
 */
export const getShopInfoFromItem = (item) => {
  const shopId = item?.shopId || ''
  const shopName =
    item?.shopName || ''
  return { shopId, shopName }
}

/**
 * Gom nhóm danh sách sản phẩm theo từng Shop (Mô hình Multi-Shop Split Orders)
 * @param {Array} items - Danh sách sản phẩm trong giỏ hoặc checkout
 * @returns {Record<string, { shopId: string, shopName: string, items: Array }>}
 */
export const groupItemsByShop = (items = []) => {
  const groups = {}
  if (!Array.isArray(items)) return groups

  items.forEach((item) => {
    const { shopId, shopName } = getShopInfoFromItem(item)
    if (!groups[shopId]) {
      groups[shopId] = {
        shopId,
        shopName,
        items: [],
      }
    }
    groups[shopId].items.push(item)
  })
  return groups
}

/**
 * Lọc danh sách đơn hàng thuộc về một Shop cụ thể (Seller Portal)
 */
export const filterOrdersByShop = (orders = [], shopId = '', shopName = '') => {
  if (!Array.isArray(orders)) return []
  const normalizedShopName = (shopName || '').trim().toLowerCase()
  return orders.filter((o) => {
    if (o.shopId && shopId && o.shopId === shopId) return true
    if (Array.isArray(o.items) && shopId && o.items.some((item) => item.shopId === shopId)) return true
    if (o.shopName && normalizedShopName && o.shopName.trim().toLowerCase() === normalizedShopName) return true
    return false
  })
}

/**
 * Kiểm tra xem một đơn hàng có thuộc quyền sở hữu của người dùng đang đăng nhập hay không
 */
export const isOrderOwnedByUser = (order, user) => {
  if (!order || !user) return false
  const matchUserId = Boolean(order.userId && String(order.userId) === String(user.id))
  const matchEmail = Boolean(
    user.email &&
    order.customerEmail &&
    order.customerEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  )
  return matchUserId || matchEmail
}


/**
 * Danh sách lý do hủy đơn hàng chuẩn hóa cho Người mua (Customer)
 */
export const CUSTOMER_CANCEL_REASONS = [
  'Muốn thay đổi sản phẩm (kích thước, màu sắc, số lượng)',
  'Muốn cập nhật lại địa chỉ nhận hàng hoặc số điện thoại',
  'Đổi ý, không còn nhu cầu mua sản phẩm này nữa',
  'Tìm thấy sản phẩm ở nơi khác với mức giá phù hợp hơn',
  'Thời gian giao hàng dự kiến quá lâu',
  'Lý do khác',
]

/**
 * Danh sách lý do hủy đơn hàng chuẩn hóa cho Người bán (Seller)
 */
export const SELLER_CANCEL_REASONS = [
  'Sản phẩm tạm thời hết hàng trong kho atelier',
  'Không thể liên hệ được với người mua để xác nhận thông tin đơn',
  'Địa chỉ nhận hàng của khách không hợp lệ hoặc ngoài vùng hỗ trợ',
  'Phát hiện sự cố chất lượng hoặc lỗi hoàn thiện trong khâu đóng gói',
  'Khách hàng chủ động yêu cầu shop hủy đơn qua tin nhắn',
  'Lý do khác',
]


/**
 * 8. TIỆN ÍCH CHUẨN HÓA SLUG TÊN GIAN HÀNG (ATELIER SLUGIFY)
 * Chuẩn hóa tên thương hiệu sang slug URL an toàn:
 * - Chuyển sang chữ thường
 * - Loại bỏ dấu tiếng Việt (NFD)
 * - Xóa bỏ dấu nháy đơn, kép, ký tự đặc biệt (VD: "L'OBSCUR ATELIER" -> "l-obscur-atelier")
 * - Loại bỏ gạch nối thừa ở đầu và cuối
 */
export const toShopSlug = (val) => {
  if (!val) return ''
  return String(val)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
