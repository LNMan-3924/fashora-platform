import { BadgeCheck, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatVND, FALLBACK_IMAGE, handleImageError, groupItemsByShop, getCartItemKey } from '../../constants'
import { getLocalizedProductName } from '../../utils'

/**
 * Component CheckoutOrderSummary: Cột tóm tắt giỏ hàng bên phải (Sticky Summary).
 * Bao gồm:
 * 1. Danh sách sản phẩm trong đơn hàng kèm ảnh (có fallback tự động nếu lỗi)
 * 2. Phân tích chi phí: Tạm tính (Subtotal), Phí vận chuyển (Shipping), Thuế (Taxes)
 * 3. Tổng thanh toán cuối cùng (Total)
 * 4. Huy hiệu bảo mật đơn hàng (Encrypted Atelier Dispatch Log)
 *
 * Props:
 * - items: Danh sách sản phẩm [{ id, name, price, image, selectedSize, selectedColor, quantity }]
 * - shippingFee: Phí vận chuyển (0 hoặc 50000)
 */
export default function CheckoutOrderSummary({ items = [], shippingFee = 0 }) {
  const { t, i18n } = useTranslation()
  // Tính tổng phụ (Subtotal)
  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  )

  // Tổng cộng thanh toán
  const total = subtotal + shippingFee

  return (
    <aside className="lg:col-span-5">
      <div className="border border-neutral-200 bg-white p-5 sm:p-6 sticky top-6 space-y-6">
        {/* Tiêu đề tóm tắt đơn hàng và chứng nhận M STUDIO */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111]">
            {t('cart.orderSummary', 'ORDER SUMMARY')}
          </h3>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        </div>

        {/* Danh sách các sản phẩm trong đơn hàng gom nhóm theo từng Shop / Atelier (Tái sử dụng groupItemsByShop) */}
        {(() => {
          const shopEntries = Object.values(groupItemsByShop(items))

          return (
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4">
              {shopEntries.map((shopGroup, groupIdx) => (
                <div key={shopGroup.shopId} className={groupIdx > 0 ? 'pt-3 border-t border-neutral-200/80' : ''}>
                  {shopEntries.length > 1 && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 bg-black inline-block"></span>
                        {shopGroup.shopName}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {shopGroup.items.length} {shopGroup.items.length > 1 ? t('cart.items', 'ITEMS') : t('cart.item', 'ITEM')}
                      </span>
                    </div>
                  )}

                  <div className="divide-y divide-neutral-100">
                    {shopGroup.items.map((item, index) => {
                      const itemKey = getCartItemKey(item) || `item-${item.id || index}`
                      const itemTotal = (item.price || 0) * (item.quantity || 1)

                      return (
                        <div key={itemKey} className="py-3 first:pt-0 last:pb-0 flex gap-4">
                          {/* Ảnh sản phẩm với cơ chế fallback về FALLBACK_IMAGE nếu hỏng */}
                          <div className="w-16 h-20 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                            <img
                              src={item.image || FALLBACK_IMAGE}
                              alt={item.name || 'Product item'}
                              onError={handleImageError}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>

                          {/* Thông tin chi tiết sản phẩm */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <h4 className="text-xs uppercase tracking-wider font-medium text-[#111111] truncate">
                                {getLocalizedProductName(item, i18n.language, item.name)}
                              </h4>
                              <p className="text-[11px] text-neutral-500 mt-0.5 truncate uppercase">
                                {[
                                  item.selectedSize ? `${t('product.size', 'SIZE')}: ${item.selectedSize}` : null,
                                  item.selectedColor ? item.selectedColor : null,
                                ]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                {t('product.quantity', 'QTY')}: {item.quantity || 1}
                                {item.quantity > 1 ? ` (${formatVND(item.price)} EA)` : ''}
                              </p>
                            </div>

                            <p className="text-xs font-semibold text-[#111111] font-mono mt-1">
                              {formatVND(itemTotal)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Bảng tính chi phí chi tiết */}
        <div className="border-t border-neutral-200 pt-4 space-y-2.5 text-xs">
          {/* Tạm tính */}
          <div className="flex justify-between text-neutral-600">
            <span>{t('cart.subtotal', { count: items.length, itemWord: items.length === 1 ? t('cart.item', 'item') : t('cart.items', 'items'), defaultValue: 'Subtotal' })}</span>
            <span className="font-mono text-[#111111] font-medium">
              {formatVND(subtotal)}
            </span>
          </div>

          {/* Phí giao hàng */}
          <div className="flex justify-between text-neutral-600">
            <span>{t('cart.shipping', 'Shipping')}</span>
            <span
              className={`font-mono font-medium ${shippingFee === 0 ? 'text-[#111111]' : 'text-[#111111]'
                }`}
            >
              {shippingFee === 0 ? t('checkout.complimentary', 'COMPLIMENTARY') : formatVND(shippingFee)}
            </span>
          </div>

          {/* Thuế nhập khẩu & VAT */}
          <div className="flex justify-between text-neutral-600">
            <span>{t('checkout.importDuties', 'Import Duties / Taxes')}</span>
            <span className="font-mono text-neutral-400">{t('checkout.included', 'Included')}</span>
          </div>

          {/* Tổng cộng thanh toán */}
          <div className="border-t border-[#111111] pt-3.5 flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-widest font-bold text-[#111111]">
              {t('cart.total', 'Total')}
            </span>
            <span className="text-base font-bold text-[#111111] font-mono">
              {formatVND(total)}
            </span>
          </div>
        </div>

        {/* Khung đảm bảo an ninh & nguồn gốc Atelier */}
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
          <div className="text-[10px] text-neutral-600 uppercase tracking-wider leading-relaxed">
            <span className="font-semibold text-[#111111] block">
              Encrypted Atelier Dispatch Log
            </span>
            Direct provenance guarantee from M STUDIO Paris/Tokyo.
          </div>
        </div>
      </div>
    </aside>
  )
}

