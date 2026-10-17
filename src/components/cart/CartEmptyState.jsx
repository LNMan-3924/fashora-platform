import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Button } from '../common'

/**
 * Component CartEmptyState: Hiển thị khi giỏ hàng chưa có bất kỳ sản phẩm nào.
 * Tái sử dụng component Button từ src/components/common để đảm bảo tính đồng bộ giao diện.
 * Cung cấp:
 * 1. Biểu tượng và lời nhắn mời khách hàng khám phá các bộ sưu tập.
 * 2. Nút "EXPLORE ARCHIVE" dẫn sang trang sản phẩm (/shop).
 */
export default function CartEmptyState() {
  return (
    <div className="p-8 sm:p-14 text-center border border-dashed border-neutral-300 rounded-[2px] bg-neutral-50 my-6">
      {/* 1. Biểu tượng giỏ hàng rỗng */}
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
      </div>

      {/* 2. Tiêu đề và mô tả */}
      <h2 className="font-bold text-base sm:text-lg uppercase tracking-wider text-[#111111]">
        YOUR CART IS CURRENTLY EMPTY
      </h2>
      <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed font-sans">
        Explore the atelier archives to curate your directional wardrobe manifest.
      </p>

      {/* 3. Nút hành động quay lại trang danh mục sản phẩm */}
      <div className="mt-6 flex items-center justify-center">
        <Link to="/shop">
          <Button variant="primary" size="md" className="tracking-widest text-xs px-8">
            EXPLORE ARCHIVE
          </Button>
        </Link>
      </div>
    </div>
  )
}
