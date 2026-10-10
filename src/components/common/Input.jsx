import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    type = 'text',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-medium uppercase tracking-wider text-[#111111]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-[#666666] pointer-events-none">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full bg-white text-[14px] text-[#111111] rounded-none px-3.5 py-2.5 transition-colors placeholder:text-[#666666] placeholder:text-[13px] focus:outline-none disabled:bg-[#F8F8F8] disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border border-[#C62828] focus:border-[#C62828]'
              : 'border border-[#E5E5E5] focus:border-[#111111]'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[12px] text-[#C62828] font-normal leading-tight">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-[12px] text-[#666666] leading-tight">
          {helperText}
        </span>
      )}
    </div>
  )
})

export default Input