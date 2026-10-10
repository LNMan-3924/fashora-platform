import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[12px] font-medium uppercase tracking-wider text-[#111111]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none bg-white text-[14px] text-[#111111] rounded-none px-3.5 py-2.5 pr-8 transition-colors focus:outline-none cursor-pointer disabled:bg-[#F8F8F8] disabled:cursor-not-allowed ${
            error
              ? 'border border-[#C62828]'
              : 'border border-[#E5E5E5] focus:border-[#111111]'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666666]">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
      {error && (
        <span className="text-[12px] text-[#C62828] font-normal leading-tight">
          {error}
        </span>
      )}
    </div>
  )
})

export default Select