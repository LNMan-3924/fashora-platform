import { useEffect } from 'react'
import { Check } from 'lucide-react'

/**
 * Component Toast: Hiển thị thông báo nổi góc dưới bên phải màn hình.
 * Thiết kế tối giản chuẩn atelier Fashora (#111111, chữ trắng, tracking rộng).
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
      className={`fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-xs uppercase tracking-widest px-6 py-4 shadow-2xl flex items-center space-x-3 pointer-events-none transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-6 opacity-0'
      }`}
    >
      {icon || <Check className="w-4 h-4 text-white stroke-[2.5] shrink-0" />}
      <span className="font-medium text-[11px]">{message}</span>
    </div>
  )
}

