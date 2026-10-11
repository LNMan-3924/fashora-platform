/**
 * FASHORA DATA STRUCTURES & SCHEMAS
 * Tuân thủ quy chuẩn Monochromatic Atelier và luồng nghiệp vụ FASHORA
 */

// 1. USER SCHEMA (Khách hàng & Người bán)
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
}

/**
 * @typedef {Object} User
 * @property {string} id - Định danh người dùng (VD: 'usr_01')
 * @property {string} email - Email đăng nhập
 * @property {string} fullName - Tên hiển thị
 * @property {string} phone - Số điện thoại liên hệ
 * @property {'CUSTOMER' | 'SELLER'} role - Vai trò tài khoản
 * @property {string} [shopId] - ID shop liên kết nếu role là SELLER
 * @property {Array<{id: string, name: string, phone: string, address: string, isDefault: boolean}>} addresses
 */

// 2. SHOP SCHEMA (Cửa hàng / Thương hiệu, VD: M STUDIO)
export const SHOP_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
}

/**
 * @typedef {Object} Shop
 * @property {string} id - Định danh shop (VD: 'shop_m_studio')
 * @property {string} name - Tên thương hiệu (VD: 'M STUDIO')
 * @property {string} slug - Đường dẫn URL (VD: 'm-studio')
 * @property {string} description - Mô tả định vị thương hiệu
 * @property {string} logo - URL ảnh đại diện shop
 * @property {string} coverImage - URL ảnh bìa Public Storefront
 * @property {number} rating - Điểm đánh giá (VD: 4.9)
 * @property {number} totalProducts - Tổng số lượng sản phẩm đang bán
 */

// 3. PRODUCT SCHEMA (Sản phẩm thời trang)
export const PRODUCT_BADGES = {
  NEW: 'NEW',
  SALE: 'SALE',
  SOLDOUT: 'SOLDOUT',
}

export const PRODUCT_CATEGORIES = [
  'Outerwear',
  'Tailoring',
  'Trousers',
  'Shirts',
  'Knitwear',
  'Accessories',
]

/**
 * @typedef {Object} Product
 * @property {string} id - Mã sản phẩm (VD: 'prd_01')
 * @property {string} shopId - Thuộc shop nào (VD: 'shop_m_studio')
 * @property {string} shopName - Tên shop hiển thị (VD: 'M STUDIO')
 * @property {string} name - Tên sản phẩm (VD: 'Oversized Wool Blazer')
 * @property {string} category - Danh mục sản phẩm
 * @property {number} price - Giá bán hiện tại (VND)
 * @property {number} [originalPrice] - Giá gốc trước giảm (VND)
 * @property {'NEW' | 'SALE' | 'SOLDOUT' | null} badge - Nhãn hiển thị trên card
 * @property {boolean} isSoldOut - Trạng thái còn hàng hay hết hàng
 * @property {string[]} images - Danh sách URL ảnh (ảnh đầu tiên làm thumbnail tỉ lệ 3:4)
 * @property {string[]} sizes - Bảng size có sẵn (VD: ['S', 'M', 'L', 'XL'])
 * @property {string[]} colors - Các màu sắc (VD: ['Black', 'Off-White', 'Charcoal'])
 * @property {string} description - Đoạn văn mô tả chi tiết chất liệu, form dáng
 * @property {string} careInstructions - Hướng dẫn giặt ủi / bảo quản
 * @property {number} stock - Số lượng tồn kho phục vụ Seller Management
 */

// 4. CART ITEM SCHEMA (Sản phẩm trong giỏ hàng)
/**
 * @typedef {Object} CartItem
 * @property {string} itemId - Mã mục giỏ hàng duy nhất (kết hợp productId + size + color)
 * @property {string} productId - ID sản phẩm gốc
 * @property {string} name - Tên sản phẩm tại thời điểm thêm
 * @property {string} image - Ảnh thumbnail của sản phẩm
 * @property {number} price - Giá tại thời điểm thêm
 * @property {string} size - Size được chọn (VD: 'M')
 * @property {string} color - Màu được chọn (VD: 'Black')
 * @property {number} quantity - Số lượng mua (mặc định >= 1)
 * @property {string} shopId - Thuộc shop nào (để nhóm đơn theo shop nếu cần)
 * @property {string} shopName - Tên shop
 */

// 5. ORDER SCHEMA (Đơn hàng & Trạng thái theo Mục 4.2.2 & 6.8)
export const ORDER_STATUS = {
  PENDING: 'PENDING',       // Chờ xác nhận
  PROCESSING: 'PROCESSING', // Đang đóng gói
  SHIPPING: 'SHIPPING',     // Đang vận chuyển
  COMPLETED: 'COMPLETED',   // Đã giao thành công
  CANCELLED: 'CANCELLED',   // Đã hủy (khách có thể hủy khi đơn còn PENDING)
}

/**
 * @typedef {Object} Order
 * @property {string} id - Mã đơn hàng (VD: 'FASH-8291')
 * @property {string} createdAt - Ngày giờ tạo đơn (ISO string)
 * @property {string} customerId - Mã khách hàng
 * @property {string} customerName - Tên người nhận
 * @property {string} phone - SĐT giao hàng
 * @property {string} shippingAddress - Địa chỉ nhận hàng
 * @property {'COD' | 'BANK_TRANSFER'} paymentMethod - Phương thức thanh toán
 * @property {'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'} status
 * @property {CartItem[]} items - Danh sách món đồ trong đơn
 * @property {number} subtotal - Tổng tiền hàng
 * @property {number} shippingFee - Phí vận chuyển (VD: 30000)
 * @property {number} totalAmount - Tổng thanh toán cuối cùng
 * @property {Array<{status: string, time: string, description: string}>} timeline - Lịch sử trạng thái đơn
 */