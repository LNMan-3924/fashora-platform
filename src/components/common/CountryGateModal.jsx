import { useState, useEffect } from 'react'
import { changeAppLanguage } from '../../i18n'
import { ArrowRight } from 'lucide-react'
import VietnamFlag from './VietnamFlag'

export default function CountryGateModal() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('fashora_lang')
    }
    return false
  })

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  const handleSelectLanguage = (lang) => {
    changeAppLanguage(lang)
    document.body.style.overflow = ''
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Region and Language Selection"
      className="fixed inset-0 z-[99999] bg-[#0A0A0A] text-white flex flex-col justify-between p-6 sm:p-10 md:p-16 overflow-y-auto animate-in fade-in duration-300 font-sans"
    >
      {/* 1. Header Gateway */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-6 w-full max-w-6xl mx-auto">
        <span className="text-xl sm:text-2xl font-black tracking-[0.35em] uppercase text-white font-sans">
          FASHORA
        </span>
        <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
          LOCATION & LANGUAGE GATEWAY
        </span>
      </div>

      {/* 2. Nội dung Trung tâm */}
      <div className="w-full max-w-4xl mx-auto py-10 sm:py-16 text-center my-auto">
        <div className="inline-block px-3 py-1 bg-white/10 text-neutral-300 text-[10px] font-mono tracking-[0.25em] uppercase mb-4 border border-white/10">
          GLOBAL RUNWAY & ATELIERS
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
          SELECT YOUR REGION &amp; LANGUAGE
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mb-10 sm:mb-14 font-light tracking-wide leading-relaxed">
          Please select your preferred region to optimize your browsing, currency, and editorial experience.
        </p>

        {/* 2 Lựa chọn lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left max-w-3xl mx-auto">
          {/* Lựa chọn 1: VIỆT NAM */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('vi')}
            className="group relative p-6 sm:p-8 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-white transition-all duration-200 cursor-pointer text-left flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <VietnamFlag className="w-8 h-5.5 rounded-[2px] shadow-sm object-cover" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 group-hover:text-white transition-colors">
                  VND (₫)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2">
                VIỆT NAM
              </h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Trải nghiệm toàn bộ sàn diễn và các xưởng may độc lập bằng <strong className="text-white font-medium">Tiếng Việt</strong>.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-neutral-800/80 mt-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2 group-hover:underline">
                TIẾP TỤC BẰNG TIẾNG VIỆT
              </span>
              <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Lựa chọn 2: QUỐC TẾ (INTERNATIONAL) */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className="group relative p-6 sm:p-8 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-white transition-all duration-200 cursor-pointer text-left flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl" role="img" aria-label="International Globe">🌐</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 group-hover:text-white transition-colors">
                  GLOBAL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2">
                INTERNATIONAL
              </h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Browse curated independent atelier runway collections in <strong className="text-white font-medium">English</strong>.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-neutral-800/80 mt-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2 group-hover:underline">
                CONTINUE IN ENGLISH
              </span>
              <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Footer Lưu ý */}
      <div className="w-full max-w-6xl mx-auto pt-6 border-t border-neutral-900 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
        <span>FASHORA EDITORIAL PLATFORM</span>
        <span>BẠN CÓ THỂ THAY ĐỔI NGÔN NGỮ BẤT KỲ LÚC NÀO TRÊN THANH HEADER • YOU CAN CHANGE LANGUAGE ANYTIME</span>
      </div>
    </div>
  )
}
