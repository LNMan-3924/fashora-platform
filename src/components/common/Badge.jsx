export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-[11px] px-2.5 py-1 tracking-widest',
  }

  const variants = {
    // Phong cách cơ bản Đen/Trắng/Xám
    default: 'bg-[#F8F8F8] text-[#111111] border border-[#E5E5E5]',
    solid: 'bg-[#111111] text-white border border-[#111111]',
    outline: 'bg-transparent text-[#111111] border border-[#111111]',
    muted: 'bg-[#F8F8F8] text-[#666666] border border-[#E5E5E5]',

    // Tag sản phẩm (Mục 5.5)
    new: 'bg-[#111111] text-white border border-[#111111]',
    sale: 'bg-[#C62828] text-white border border-[#C62828]',
    soldout: 'bg-[#666666] text-white border border-[#666666]',

    // Order Status (Mục 5.1 & 6.8)
    pending: 'bg-transparent text-[#B7791F] border border-[#B7791F]',
    confirmed: 'bg-transparent text-[#111111] border border-[#111111]',
    shipping: 'bg-transparent text-[#666666] border border-[#666666]',
    completed: 'bg-transparent text-[#2E7D32] border border-[#2E7D32]',
    cancelled: 'bg-transparent text-[#C62828] border border-[#C62828]',
  }

  return (
    <span
      className={`inline-flex items-center uppercase font-medium rounded-none ${sizes[size]} ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  )
}