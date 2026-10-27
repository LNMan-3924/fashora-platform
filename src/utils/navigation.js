import { useNavigate } from 'react-router-dom'

/**
 * Chuẩn hóa cơ chế điều hướng quay lại lịch sử trình duyệt (Dynamic History Back):
 * - Ưu tiên duyệt lịch sử trình duyệt qua navigate(-1).
 * - Tự động phát hiện trường hợp người dùng truy cập trực tiếp bằng URL (deep link)
 *   hoặc mở trong tab mới bằng kiểm tra window.history.state?.idx > 0.
 * - Tự động dự phòng về fallbackPath nếu không có lịch sử trước đó trong phiên làm việc.
 * - Đảm bảo tương thích hoàn toàn với cử chỉ vuốt lịch sử trên touchpad (2 ngón)
 *   và nút bấm vật lý Back trên chuột máy tính.
 *
 * @param {Function} navigate - Hàm navigate từ useNavigate() của react-router-dom
 * @param {string} fallbackPath - Đường dẫn dự phòng mặc định nếu không có lịch sử
 */
export function safeBack(navigate, fallbackPath = '/') {
  if (typeof window !== 'undefined' && window.history?.state?.idx > 0) {
    navigate(-1)
  } else {
    navigate(fallbackPath, { replace: true })
  }
}

/**
 * Hook tiện ích useSafeBack:
 * Trả về hàm callback có thể gán trực tiếp vào onClick của các nút Back / Quay lại.
 *
 * @param {string} fallbackPath - Đường dẫn fallback mặc định
 * @returns {Function}
 */
export function useSafeBack(fallbackPath = '/') {
  const navigate = useNavigate()
  return () => safeBack(navigate, fallbackPath)
}
