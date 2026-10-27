import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { safeBack } from '../../utils'

export default function PolicyPage({ title = 'POLICY' }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [title])

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      safeBack(navigate, '/shop')
    }
  }

  const getBackLabel = () => {
    if (location.state?.from === '/register') return 'Back to Create an Account'
    if (location.state?.from === '/login') return 'Back to Sign In'
    if (location.state?.from === '/home') return 'Back to Home'
    if (location.state?.from === '/shop') return 'Back to Shop'
    if (location.state?.from) return 'Go Back'
    return 'Back to Previous Page'
  }

  return (
    <div className="min-h-[65vh] bg-[#fcfcfc] text-black">
      <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-20">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-600 hover:text-black transition-colors mb-8 cursor-pointer group"
          title="Return to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{getBackLabel()}</span>
        </button>

        <div className="max-w-3xl">
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-2">
            FASHORA LEGAL & POLICIES
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black font-serif mb-6">
            {title}
          </h1>

          <div className="p-8 sm:p-12 border border-neutral-200 bg-white shadow-xs">
            <p className="text-sm font-mono text-neutral-600 leading-relaxed mb-4">
              Nội dung chi tiết cho mục "{title}" đang được cập nhật.
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              Vui lòng quay lại sau hoặc liên hệ bộ phận chăm sóc khách hàng qua email infoFashora@gmail.com nếu bạn cần giải đáp thông tin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
