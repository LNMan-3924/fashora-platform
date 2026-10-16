import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { Button, Toast } from '../../components/common'
import CompleteTheLook from '../../components/product/CompleteTheLook'
import QuickAddModal from '../../components/product/QuickAddModal'
import { useCartStore } from '../../stores/useCartStore'
import { formatVND } from '../../constants'

/**
 * Trang Đặt hàng Thành công (Official Order Successful Page):
 * - Tái sử dụng component Button và Toast từ src/components/common.
 * - Tái sử dụng component CompleteTheLook và QuickAddModal từ src/components/product.
 * - Tái sử dụng useCartStore để quản lý thêm sản phẩm gợi ý vào giỏ hàng.
 * - Hỗ trợ sao chép mã đơn hàng vào clipboard kèm thông báo Toast.
 * - Bố cục responsive toàn diện (mobile, tablet, desktop).
 * - BẢO VỆ: Không cho phép gõ URL trực tiếp để vào trang này. Nếu không có state từ Checkout -> Tự động chuyển về /orders.
 */
export default function OrderSuccess() {
  const navigate = useNavigate()
  const location = useLocation()

  // Tự động cuộn lên đầu trang ngay khi vào trang Order Success
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // 1. CHẶN TRUY CẬP TRỰC TIẾP QUA URL:
  // Trang này chỉ hiển thị khi vừa hoàn tất thanh toán từ Checkout (có location.state.orderNumber)
  const orderNumber = location.state?.orderNumber
  if (!orderNumber) {
    return <Navigate to="/orders" replace />
  }

  const orderTotal = location.state?.total ? formatVND(location.state.total) : ''

  // 2. Zustand Store: Thao tác thêm vào giỏ hàng từ mục Complete The Look
  const addToCart = useCartStore((state) => state.addToCart)

  // 3. State quản lý Modal thêm nhanh (Quick Add)
  const [selectedQuickProduct, setSelectedQuickProduct] = useState(null)

  // 4. State quản lý thông báo Toast
  const [toast, setToast] = useState({
    visible: false,
    message: '',
  })

  /**
   * Hiển thị thông báo Toast với nội dung truyền vào
   */
  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  /**
   * Xử lý sao chép mã đơn hàng vào bộ nhớ tạm (Clipboard)
   */
  const handleCopyOrderNumber = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNumber).catch(() => { })
    }
    showToast('Order number copied')
  }

  /**
   * Xử lý khi xác nhận thêm sản phẩm từ mục Complete The Look vào giỏ
   */
  const handleConfirmQuickAdd = (productData) => {
    addToCart(
      productData,
      productData.selectedSize || 'One Size',
      productData.selectedColor || 'DEFAULT',
      productData.quantity || 1
    )
    setSelectedQuickProduct(null)
    showToast('Added to Cart')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ============================================================= */}
      {/* PHẦN 1: HERO XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG (ORDER HERO)         */}
      {/* ============================================================= */}
      <section className="max-w-2xl mx-auto px-4 py-10 sm:py-16 text-center">
        {/* Biểu tượng Checkmark đen tối giản (#111111 chuẩn atelier, không dùng màu xanh lá) */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs">
            <Check className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
        </div>

        {/* Tiêu đề thông báo đặt hàng thành công */}
        <h1 className="text-2xl sm:text-[32px] font-bold tracking-wider sm:tracking-[0.25em] uppercase text-[#111111] mb-3">
          ORDER SUCCESSFUL
        </h1>

        {/* Lời cảm ơn tinh tế */}
        <p className="text-[#666666] text-sm sm:text-[15px] leading-relaxed max-w-lg mx-auto font-normal px-2">
          Thank you for your purchase.
          <br />
          Your order has been placed successfully.
        </p>

        {/* Khung thẻ tham chiếu đơn hàng (Order Meta Reference Card) */}
        <div className="mt-8 sm:mt-10 w-full max-w-xl mx-auto bg-[#F8F8F8] border border-[#E5E5E5] p-6 text-center">
          <div className="text-[11px] tracking-widest uppercase font-medium text-[#666666] mb-2">
            ORDER NUMBER
          </div>

          {/* Mã đơn hàng kèm nút tiện ích sao chép mã */}
          <div className="inline-flex items-center justify-center space-x-2 text-sm sm:text-base font-bold tracking-wider text-[#111111] mb-4">
            <span className="font-mono">{orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              aria-label="Copy order number"
              title="Copy order number"
              className="p-1 text-[#666666] hover:text-[#111111] transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Tổng tiền đơn hàng */}
          <div className="flex flex-col items-center justify-center pt-2 border-t border-[#E5E5E5]/60">
            <span className="text-[11px] uppercase tracking-widest text-[#666666] font-medium mb-1">
              TOTAL
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#111111] font-mono">
              {orderTotal}
            </span>
          </div>
        </div>

        {/* Các nút điều hướng hành động: Tái sử dụng component Button từ src/components/common */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
          {/* Nút xem danh sách đơn hàng đã đặt */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto tracking-widest text-[11px] h-12 px-8"
          >
            VIEW MY ORDERS
          </Button>

          {/* Nút tiếp tục mua sắm */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto tracking-widest text-[11px] h-12 px-8"
          >
            CONTINUE SHOPPING
          </Button>
        </div>
      </section>

      {/* ============================================================= */}
      {/* PHẦN 2: GỢI Ý PHỐI ĐỒ (COMPLETE THE LOOK)                     */}
      {/* Tái sử dụng component CompleteTheLook dùng chung              */}
      {/* ============================================================= */}
      <CompleteTheLook
        title="COMPLETE THE LOOK"
        subtitle="CURATED PAIRINGS FORMULATED FOR ATELIER SILHOUETTES"
        viewAllLink="/shop"
        onQuickAdd={(product) => setSelectedQuickProduct(product)}
      />

      {/* ============================================================= */}
      {/* PHẦN 3: MODAL THÊM BIẾN THỂ NHANH (QUICK ADD MODAL)           */}
      {/* Tái sử dụng component QuickAddModal từ src/components/product */}
      {/* ============================================================= */}
      <QuickAddModal
        isOpen={Boolean(selectedQuickProduct)}
        product={selectedQuickProduct}
        onClose={() => setSelectedQuickProduct(null)}
        onConfirm={handleConfirmQuickAdd}
      />

      {/* ============================================================= */}
      {/* PHẦN 4: THÔNG BÁO TOAST DÙNG CHUNG (TÁI SỬ DỤNG TỪ COMMON)    */}
      {/* ============================================================= */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}