import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop: Tự động đưa vị trí cuộn về đầu trang mỗi khi chuyển trang.
 * Ngoại trừ trang /checkout theo yêu cầu nghiệp vụ.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/checkout') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname])

  return null
}
