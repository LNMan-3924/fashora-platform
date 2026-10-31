import { useTranslation } from 'react-i18next'
import { formatVND } from '../../constants/commerce'

/**
 * Component OrderTotalSummary: Khối tóm tắt tài chính và tổng tiền thu hộ của đơn hàng
 * - Thể hiện chi tiết tiền hàng (Subtotal), phí vận chuyển (Shipping), bao bì bảo vệ (Packaging).
 * - Hiển thị số tiền thanh toán thực tế nổi bật bằng font chữ monospace đậm (2xl).
 *
 * Props:
 * - subtotal: Tổng tiền hàng trước phí vận chuyển
 * - shippingFee: Phí vận chuyển (nếu bằng 0 sẽ hiển thị FREE SHIPPING)
 * - total: Tổng số tiền khách cần thanh toán
 * - itemCount: Tổng số lượng món đồ trong đơn
 * - paymentMethod: Phương thức thanh toán (COD, Chuyển khoản...)
 */
export default function OrderTotalSummary({
  subtotal = 0,
  shippingFee = 0,
  total = 0,
  itemCount = 1,
  paymentMethod = 'Cash on Delivery (COD)',
}) {
  const { t } = useTranslation()

  return (
    <section className="bg-white border border-neutral-200 rounded-[2px] p-6 shadow-xs">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black pb-3 border-b border-neutral-200 mb-4 font-mono">
        {t('seller.orders.detail.orderTotal', 'ORDER TOTAL')}
      </h4>

      <div className="space-y-3 text-xs text-neutral-600">
        {/* Tiền hàng (Subtotal) */}
        <div className="flex justify-between">
          <span>{t('seller.orders.detail.subtotal', { count: itemCount, defaultValue: `Subtotal (${itemCount} products)` })}</span>
          <span className="font-mono font-medium text-black">
            {formatVND(subtotal || total - (shippingFee || 0))}
          </span>
        </div>

        {/* Phí vận chuyển */}
        <div className="flex justify-between">
          <span>{t('seller.orders.detail.shipping', 'Shipping (Standard Courier Express)')}</span>
          {shippingFee > 0 ? (
            <span className="font-mono font-medium text-black">
              {formatVND(shippingFee)}
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold tracking-wider text-[11px] uppercase font-mono">
              {t('seller.orders.detail.freeShipping', 'FREE SHIPPING')}
            </span>
          )}
        </div>

        {/* Hộp bảo vệ Atelier */}
        <div className="flex justify-between">
          <span>{t('seller.orders.detail.box', 'Atelier Protective Box & Garment Bag')}</span>
          <span className="text-neutral-500 font-medium">{t('seller.orders.detail.complimentary', 'Complimentary')}</span>
        </div>

        {/* Tổng cộng tiền thanh toán */}
        <div className="border-t border-black pt-4 mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              {t('seller.orders.detail.totalCollect', 'TOTAL AMOUNT TO COLLECT')}
            </div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5 font-mono">
              {paymentMethod} • {t('seller.orders.detail.includedVat', 'INCLUDED VAT')}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-black">
              {formatVND(total)}
            </div>
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-[2px] font-mono">
              {t('seller.orders.detail.vndSettlement', 'VND SETTLEMENT')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

