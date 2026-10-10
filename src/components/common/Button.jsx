export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-wider uppercase transition-colors duration-150 rounded-none focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none'

  const sizes = {
    sm: 'text-[11px] px-3.5 py-1.5 gap-1.5',
    md: 'text-[13px] px-6 py-2.5 gap-2',
    lg: 'text-[14px] px-8 py-3.5 gap-2.5',
  }

  const variants = {
    // Primary đen #111111
    primary:
      'bg-[#111111] text-white hover:bg-black border border-[#111111]',
    // Secondary trắng viền đen
    secondary:
      'bg-white text-[#111111] border border-[#111111] hover:bg-[#F8F8F8]',
    // Outline viền xám #E5E5E5
    outline:
      'bg-transparent text-[#111111] border border-[#E5E5E5] hover:border-[#111111]',
    // Ghost tối giản
    ghost:
      'bg-transparent text-[#111111] hover:bg-[#F8F8F8] border border-transparent',
    // Danger theo bảng màu Error #C62828
    danger:
      'bg-[#C62828] text-white hover:bg-[#b02222] border border-[#C62828]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles}${sizes[size]} ${variants[variant]}${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}