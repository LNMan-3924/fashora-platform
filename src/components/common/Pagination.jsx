export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null

  // Tạo mảng số trang hiển thị
  const getPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3.5 py-2 text-[12px] font-medium uppercase tracking-wider text-[#111111] border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-none"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page) => {
        const isActive = currentPage === page

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center text-[12px] font-medium transition-colors rounded-none ${
              isActive
                ? 'bg-[#111111] text-white border border-[#111111]'
                : 'bg-white text-[#111111] border border-[#E5E5E5] hover:border-[#111111]'
            }`}
          >
            {page}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3.5 py-2 text-[12px] font-medium uppercase tracking-wider text-[#111111] border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-none"
      >
        Next
      </button>
    </div>
  )
}