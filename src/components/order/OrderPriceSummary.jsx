import { Headphones, ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'
import { formatVND } from './orderConstants'

/**
 * Component OrderPriceSummary: Bảng tóm tắt chi phí đơn hàng và các nút hành động (Cột phải)
 */
export default function OrderPriceSummary({
  subtotal = 0,
  shippingFee = 0,
  total = 0,
  isCancelled = false,
  canCancel = false,
  onCancel,
  onContinueShopping,
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* 1. BẢNG TÍNH TOÁN CHI TIẾT GIÁ TIỀN */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900 font-mono">
            {t('orderDetail.priceBreakdown')}
          </h2>
          <span className="text-[10px] font-mono text-neutral-400">
            {t('orderDetail.finalSettlement')}
          </span>
        </div>

        <div className="space-y-3 text-xs sm:text-sm font-sans">
          <div className="flex justify-between text-neutral-600">
            <span>{t('orderDetail.subtotal')}</span>
            <span className="font-mono font-semibold text-neutral-900">
              {formatVND(subtotal || total)}
            </span>
          </div>

          <div className="flex justify-between text-neutral-600">
            <span>{t('orderDetail.shippingFee')}</span>
            <span className="font-mono font-semibold text-neutral-900">
              {shippingFee > 0 ? formatVND(shippingFee) : t('orderDetail.freeAtelier')}
            </span>
          </div>

          <div className="flex justify-between text-neutral-600">
            <span>{t('orderDetail.atelierTax')}</span>
            <span className="font-mono font-semibold text-neutral-900">0₫</span>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                {t('orderDetail.grandTotal')}
              </span>
              <p className="text-[10px] font-mono text-neutral-400">
                {t('orderDetail.inclVat')}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`font-mono text-xl sm:text-2xl font-bold ${
                  isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900'
                }`}
              >
                {formatVND(total)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CÁC NÚT THAO TÁC HÀNH ĐỘNG */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          {canCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-11 border border-neutral-300 hover:border-black text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-black transition-colors cursor-pointer"
            >
              {t('orderDetail.cancelThisOrder')}
            </button>
          )}

          {onContinueShopping && (
            <Button
              variant="primary"
              size="lg"
              onClick={onContinueShopping}
              className="w-full tracking-widest text-xs h-11 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('orders.continueShopping')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. THẺ CAM KẾT HỖ TRỢ KHÁCH HÀNG (ATELIER CLIENT CARE) */}
      <div className="bg-[#F8F8F8] border border-neutral-200 p-5 space-y-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2.5 font-bold uppercase tracking-wider text-neutral-900 font-mono text-[11px]">
          <Headphones className="w-4 h-4" />
          <span>{t('orderDetail.clientCareTitle')}</span>
        </div>
        <p className="leading-relaxed font-sans text-neutral-500">
          {t('orderDetail.clientCareDesc')}
        </p>
        <div className="pt-2 border-t border-neutral-200/60 font-mono text-[11px] text-neutral-800">
          Email: infoFashora@gmail.com
        </div>
      </div>
    </div>
  )
}

