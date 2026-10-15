import {
  Clock,
  CheckCircle2,
  Truck,
  Check,
  Ban,
} from 'lucide-react'

// Đường dẫn ảnh dự phòng mặc định khi ảnh sản phẩm bị lỗi hoặc không tải được
export const FALLBACK_IMAGE = '/assets/fallback.png'

/**
 * Xử lý sự cố ảnh bị lỗi URL hoặc mất kết nối: tự động trỏ về ảnh fallback
 */
export const handleImageError = (e) => {
  if (!e.currentTarget.src.includes(FALLBACK_IMAGE)) {
    e.currentTarget.src = FALLBACK_IMAGE
  }
}

/**
 * Hàm tiện ích: định dạng số tiền sang chuẩn Việt Nam Đồng (VND)
 * Ví dụ: 819000 -> 819,000₫
 */
export const formatVND = (amount) => {
  return Number(amount || 0).toLocaleString('vi-VN') + '₫'
}

/**
 * Hàm tiện ích: định dạng ngày tháng hiển thị theo chuẩn thời trang quốc tế
 * Ví dụ: "2025-10-24T10:30:00.000Z" -> "Oct 24, 2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'Oct 24, 2025'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Cấu hình giao diện và thông điệp hiển thị cho 5 trạng thái đơn hàng:
 * - label: Nhãn chữ in hoa.
 * - badgeClass: Màu sắc nhãn badge.
 * - noticeBox: Màu sắc khung thông báo.
 * - noticeText: Nội dung giải thích tiến độ cho người mua.
 * - stepIndex: Bước hiện tại trên thanh tiến trình (1-4).
 * - icon: Biểu tượng minh họa.
 */
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
 * 5 Đơn hàng mẫu mặc định đại diện cho 5 trạng thái (Pending, Confirmed, Shipping, Completed, Cancelled)
 * Tuân thủ chính xác quy chuẩn thiết kế Atelier Ledger 2025.
 */
export const DEFAULT_MOCK_ORDERS = [
  {
    id: 'ord_mock_001',
    orderNumber: '#SPX001',
    shopName: 'M STUDIO',
    createdAt: '2025-10-24T10:30:00.000Z',
    status: 'PENDING',
    paymentMethod: 'COD',
    shippingMethod: 'Standard Delivery (Complimentary)',
    shippingFee: 0,
    subtotal: 819000,
    total: 819000,
    recipient: {
      fullName: 'Nguyen Van Anh',
      phone: '+84 908 123 456',
      address: '148/9 Nguyen Trai, Ward Ben Thanh',
      ward: 'Ward Ben Thanh',
      district: 'District 1',
      city: 'Ho Chi Minh City',
    },
    logistics: {
      courier: 'SPX Express',
      waybill: 'VN839219388VN',
    },
    items: [
      {
        id: 'prd_shirt_01',
        name: 'Cropped Structured Satin Shirt',
        selectedSize: 'M',
        selectedColor: 'Pure White',
        quantity: 1,
        price: 420000,
        image: '/images/products/shirt/shirt-01.jpg',
      },
      {
        id: 'prd_acc_03',
        name: 'Armored Leather Moon Bag',
        selectedSize: 'OS',
        selectedColor: 'Black',
        quantity: 1,
        price: 399000,
        image: '/images/products/accessories/acc-03.jpg',
      },
    ],
  },
  {
    id: 'ord_mock_002',
    orderNumber: '#SPX002',
    shopName: 'M STUDIO',
    createdAt: '2025-10-23T14:15:00.000Z',
    status: 'CONFIRMED',
    paymentMethod: 'COD',
    shippingMethod: 'Standard Delivery (Complimentary)',
    shippingFee: 0,
    subtotal: 1247000,
    total: 1247000,
    recipient: {
      fullName: 'Le Hoang Nam',
      phone: '+84 912 345 678',
      address: '742 Evergreen Terrace',
      ward: 'Ward 25',
      district: 'Binh Thanh District',
      city: 'Ho Chi Minh City',
    },
    logistics: {
      courier: 'SPX Express',
      waybill: 'VN928172635VN',
    },
    items: [
      {
        id: 'prd_shirt_02',
        name: 'Structured Linen Shirt',
        selectedSize: 'S',
        selectedColor: 'Black',
        quantity: 1,
        price: 399000,
        image: '/images/products/shirt/shirt-02.jpg',
      },
      {
        id: 'prd_pants_01',
        name: 'Wide Tailored Pants',
        selectedSize: 'M',
        selectedColor: 'Black',
        quantity: 1,
        price: 599000,
        image: '/images/products/pants/pants-01.jpg',
      },
      {
        id: 'prd_acc_02',
        name: 'Minimal Leather Belt',
        selectedSize: 'M',
        selectedColor: 'Black',
        quantity: 1,
        price: 249000,
        image: '/images/products/accessories/acc-02.jpg',
      },
    ],
  },
  {
    id: 'ord_mock_003',
    orderNumber: '#SPX003',
    shopName: 'M STUDIO',
    createdAt: '2025-10-19T09:00:00.000Z',
    status: 'SHIPPING',
    paymentMethod: 'COD',
    shippingMethod: 'Express Priority Courier (50,000₫)',
    shippingFee: 50000,
    subtotal: 1498000,
    total: 1548000,
    recipient: {
      fullName: 'Tran Thi Mai',
      phone: '+84 938 765 432',
      address: '25 Tran Hung Dao',
      ward: 'Phan Chu Trinh Ward',
      district: 'Hoan Kiem District',
      city: 'Ha Noi',
    },
    logistics: {
      courier: 'SPX Express Priority',
      waybill: 'VN718293041VN',
    },
    items: [
      {
        id: 'prd_shoes_01',
        name: 'Minimal Leather Shoes',
        selectedSize: '39',
        selectedColor: 'Black',
        quantity: 1,
        price: 799000,
        image: '/images/products/shoes/shoes-01.jpg',
      },
      {
        id: 'prd_set_01',
        name: 'Classic Fashion Set',
        selectedSize: 'M',
        selectedColor: 'Black',
        quantity: 1,
        price: 699000,
        image: '/images/products/set/set-01.jpg',
      },
    ],
  },
  {
    id: 'ord_mock_004',
    orderNumber: '#SPX004',
    shopName: 'M STUDIO',
    createdAt: '2025-10-14T16:45:00.000Z',
    status: 'COMPLETED',
    paymentMethod: 'COD',
    shippingMethod: 'Standard Delivery (Complimentary)',
    shippingFee: 0,
    subtotal: 1597000,
    total: 1597000,
    recipient: {
      fullName: 'Pham Quoc Bao',
      phone: '+84 903 888 999',
      address: '12 Vo Van Tan',
      ward: 'Vo Thi Sau Ward',
      district: 'District 3',
      city: 'Ho Chi Minh City',
    },
    logistics: {
      courier: 'SPX Express',
      waybill: 'VN556677889VN',
    },
    items: [
      {
        id: 'prd_shirt_04',
        name: 'Oversized Cotton Shirt',
        selectedSize: 'L',
        selectedColor: 'White',
        quantity: 1,
        price: 349000,
        image: '/images/products/shirt/shirt-04.jpg',
      },
      {
        id: 'prd_pants_02',
        name: 'Relaxed Wide Pants',
        selectedSize: 'L',
        selectedColor: 'Gray',
        quantity: 1,
        price: 549000,
        image: '/images/products/pants/pants-02.jpg',
      },
      {
        id: 'prd_acc_01',
        name: 'Leather Shoulder Bag',
        selectedSize: 'OS',
        selectedColor: 'Brown',
        quantity: 1,
        price: 699000,
        image: '/images/products/accessories/acc-01.jpg',
      },
    ],
  },
  {
    id: 'ord_mock_005',
    orderNumber: '#SPX005',
    shopName: 'M STUDIO',
    createdAt: '2025-10-02T11:20:00.000Z',
    status: 'CANCELLED',
    paymentMethod: 'COD',
    shippingMethod: 'Standard Delivery (Complimentary)',
    shippingFee: 0,
    subtotal: 1198000,
    total: 1198000,
    recipient: {
      fullName: 'Doan Minh Tri',
      phone: '+84 977 112 233',
      address: '88 Ly Tu Trong',
      ward: 'Ben Thanh Ward',
      district: 'District 1',
      city: 'Ho Chi Minh City',
    },
    logistics: {
      courier: 'SPX Express',
      waybill: 'VN112233445VN',
    },
    items: [
      {
        id: 'prd_set_02',
        name: 'Classic Fashion Set',
        selectedSize: 'M',
        selectedColor: 'Beige',
        quantity: 1,
        price: 699000,
        image: '/images/products/set/set-02.jpg',
      },
      {
        id: 'prd_acc_04',
        name: 'Leather Crossbody Bag',
        selectedSize: 'OS',
        selectedColor: 'Black',
        quantity: 1,
        price: 499000,
        image: '/images/products/accessories/acc-02.jpg',
      },
    ],
  },
]

