import { useEffect } from 'react'

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = 'max-w-md',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const positionClasses = {
    right: 'inset-y-0 right-0',
    left: 'inset-y-0 left-0',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed ${positionClasses[position]} flex pl-10 max-w-full`}>
        <div className={`w-screen ${width} bg-white border-l border-[#E5E5E5] flex flex-col shadow-2xl`}>
          {/* Header Drawer */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#111111] transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}