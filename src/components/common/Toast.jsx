import { useEffect } from 'react'
import { Check } from 'lucide-react'

/**
 * Component Toast: Hiển thị thông báo nổi góc dưới bên phải màn hình.
 * Thiết kế chuẩn Design System 5.5: thông báo ngắn, nền trắng, border nhẹ (#E5E5E5).
 *
 * Props:
 * - isVisible: Trạng thái hiển thị (boolean)
 * - message: Nội dung thông báo
 * - onClose: Hàm đóng thông báo khi hết thời gian
 * - duration: Thời gian hiển thị (mili giây, mặc định 3000ms)
 * - icon: Icon tùy chỉnh (mặc định là Check icon)
 */
export default function Toast({
  isVisible = false,
  message = '',
  onClose,
  duration = 3000,
  icon,
}) {
  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [isVisible, duration, onClose])

  if (!isVisible && !message) return null

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 bg-white text-[#111111] border border-[#E5E5E5] text-xs uppercase tracking-wider px-5 py-3.5 shadow-lg flex items-center space-x-3 transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      {icon || <Check className="w-4 h-4 text-[#2E7D32] stroke-[2.5] shrink-0" />}
      <span className="font-medium text-xs text-[#111111]">{message}</span>
    </div>
  )
}
