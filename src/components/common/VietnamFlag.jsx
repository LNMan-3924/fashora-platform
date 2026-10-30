/**
 * VietnamFlag: Biểu tượng Lá cờ đỏ sao vàng Việt Nam chuẩn tỉ lệ 3:2 bằng SVG
 * - Khắc phục triệt để lỗi hiển thị chữ "VN" thay vì hình lá cờ trên hệ điều hành Windows.
 * - Sắc nét trên mọi độ phân giải màn hình.
 */
export default function VietnamFlag({ className = 'w-4 h-3 inline-block', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      className={className}
      aria-label="Cờ Việt Nam"
      role="img"
      {...props}
    >
      <rect width="900" height="600" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="450,120 491,244 621,244 515,321 556,446 450,369 344,446 385,321 279,244 409,244"
      />
    </svg>
  )
}
