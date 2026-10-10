import { forwardRef } from 'react'

const Checkbox = forwardRef(function Checkbox(
  { label, description, id, className = '', disabled = false, ...props },
  ref
) {
  const checkId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <label
      htmlFor={checkId}
      className={`flex items-start gap-2.5 select-none ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        ref={ref}
        id={checkId}
        type="checkbox"
        disabled={disabled}
        className={`mt-0.5 h-4 w-4 rounded-none border border-[#E5E5E5] text-[#111111] accent-[#111111] focus:ring-0 focus:outline-none transition cursor-pointer ${className}`}
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-[14px] font-normal text-[#111111]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[12px] text-[#666666]">{description}</span>
          )}
        </div>
      )}
    </label>
  )
})

export default Checkbox