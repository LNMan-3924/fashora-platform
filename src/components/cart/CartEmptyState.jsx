import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

/**
 * Component CartEmptyState: Hiển thị khi giỏ hàng chưa có bất kỳ sản phẩm nào.
 * Cung cấp:
 * 1. Biểu tượng và lời nhắn tinh tế mời khách hàng khám phá các bộ sưu tập.
 * 2. Nút "EXPLORE ARCHIVE" dẫn sang trang sản phẩm (/shop).
 * 3. Nút tiện ích "LOAD DEMO ARCHIVE ITEMS" giúp nạp lại 3 sản phẩm mẫu tức thì để tiện cho việc kiểm thử UI.
 */
export default function CartEmptyState({ onLoadDemoItems }) {
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

      {/* 3. Các nút bấm hành động */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Nút quay lại trang danh mục sản phẩm */}
        <Link
          to="/shop"
          className="inline-block bg-[#111111] text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-neutral-800 transition-colors rounded-[2px]"
        >
          EXPLORE ARCHIVE
        </Link>

        {/* Nút tiện ích: Nạp lại 3 sản phẩm mẫu cho mục đích test giao diện */}
        {onLoadDemoItems && (
          <button
            type="button"
            onClick={onLoadDemoItems}
            className="inline-block bg-white text-[#111111] border border-neutral-300 px-6 py-3 text-xs font-mono font-medium tracking-wider uppercase hover:border-[#111111] transition-colors rounded-[2px] cursor-pointer"
          >
            LOAD DEMO ARCHIVE ITEMS
          </button>
        )}
      </div>
    </div>
  )
}
