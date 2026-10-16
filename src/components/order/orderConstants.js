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
 * Hàm tiện ích: định dạng ngày tháng hiển thị theo chuẩn quốc tế
 * Ví dụ: "2026-10-24T10:30:00.000Z" -> "Oct 24, 2026"
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
