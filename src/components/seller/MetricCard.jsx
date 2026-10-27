/**
 * Component MetricCard: Khung hiển thị từng chỉ số hiệu suất bán hàng (KPI Card)
 * Dùng cho các chỉ số Doanh thu (REVENUE), Đơn hàng (ORDERS) và Sản phẩm đã bán (PRODUCTS SOLD).
 * 
 * Props:
 * - label: Tên chỉ số (VD: 'REVENUE')
 * - value: Giá trị cần hiển thị (VD: '12,500,000₫')
 * - subtext: Chú thích giải thích bên dưới (VD: 'Total settled revenue')
 * - icon: Component Icon từ thư viện Lucide React
 * - loading: Trạng thái đang tải dữ liệu từ API
 */
export default function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  loading = false,
}) {
  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-[2px] shadow-xs flex flex-col justify-between transition-all hover:border-neutral-300">
      {/* 1. Tiêu đề chỉ số và Icon góc phải */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 font-mono">
          {label}
        </span>
        {Icon && (
          <span className="text-neutral-400 p-1">
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* 2. Giá trị số liệu nổi bật */}
      <div>
        {loading ? (
          // Hiển thị khung chờ khi đang tải từ API
          <div className="h-8 w-32 bg-neutral-100 animate-pulse rounded-[2px] my-1" />
        ) : (
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-black tracking-tight my-1">
            {value}
          </h3>
        )}

        {/* 3. Dòng mô tả giải thích */}
        {subtext && (
          <p className="text-xs text-neutral-400 mt-2 font-sans tracking-wide">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}

