import { X, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  FALLBACK_IMAGE,
  handleImageError,
  formatVND,
  formatFullAddress,
} from './orderConstants'
import { getLocalizedProductName } from '../../utils'

/**
 * Component OrderQuickModal: Modal xem nhanh đặc tả đơn hàng (Atelier Specification)
 *
 * Tính năng:
 * - Xem nhanh địa chỉ người nhận và thông tin vận đơn SPX Express.
 * - Danh sách sản phẩm thu nhỏ có xử lý ảnh lỗi tự động (fallback.png).
 * - Tóm tắt chi tiết các khoản giá tiền (Subtotal, Shipping, Grand Total).
 * - Nút "OPEN FULL ORDER LEDGER" để chuyển hướng sang trang chi tiết đầy đủ (/orders/:id).
 *
 * Props:
 * - order: Đơn hàng cần xem thông tin (null = ẩn modal)
 * - onClose: Hàm callback khi đóng modal
 * - onOpenFullDetail: Hàm callback khi bấm xem trang chi tiết đầy đủ
 */
export default function OrderQuickModal({
  order,
  onClose,
  onOpenFullDetail,
}) {
  const { t, i18n } = useTranslation()
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-stone-50">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-neutral-500 uppercase font-mono block">
              {order.shopName ? `${t('product.atelier')}: ${order.shopName}` : t('orders.atelierSpec')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 font-mono">
              {t('orders.orderNumLabel')} {order.orderNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-neutral-700">
          {/* Thông báo lý do nếu đơn đã bị hủy */}
          {order.status === 'CANCELLED' && order.cancelReason && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-[2px] space-y-0.5">
              <span className="font-semibold font-mono uppercase tracking-wider block">
                {t('orders.cancellationReason')}
              </span>
              <span>{order.cancelReason}</span>
              {order.cancelledBy && (
                <span className="text-[10px] text-neutral-500 block pt-0.5 font-mono">
                  {t('orders.cancelledBy', { by: order.cancelledBy === 'seller' ? t('orders.bySeller') : t('orders.byBuyer') })}
                </span>
              )}
            </div>
          )}
          {/* Thông tin giao hàng & Vận chuyển */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
            <div>
              <h3 className="font-semibold text-neutral-900 tracking-wider text-[11px] uppercase mb-1.5 font-mono">
                {t('orderDetail.shippingAddress')}
              </h3>
              <div className="text-neutral-600 leading-relaxed font-sans space-y-0.5">
                <p className="font-semibold text-neutral-900">
                  {order.recipient?.fullName || order.recipient?.name || t('orderDetail.recipient')}
                </p>
                <p>{formatFullAddress(order.recipient)}</p>
                <p className="font-mono text-neutral-800 pt-0.5">
                  {t('orderDetail.phone')} {order.recipient?.phone || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 tracking-wider text-[11px] uppercase mb-1.5 font-mono">
                {t('orderDetail.dispatchLogistics')}
              </h3>
              <p className="text-neutral-600 leading-relaxed font-sans space-y-1">
                <span>
                  {t('orders.standardCourier')}{' '}
                  <strong className="text-neutral-900">
                    {order.logistics?.courier || 'SPX Express'}
                  </strong>
                </span>
                <br />
                <span>
                  {t('orderDetail.trackingWaybill')}{' '}
                  <span className="font-mono text-neutral-900 font-medium">
                    {order.logistics?.waybill || t('orderDetail.pendingAssignment')}
                  </span>
                </span>
                <br />
                <span>
                  {t('orders.paymentMethod')}{' '}
                  <span className="font-medium text-neutral-900">
                    {order.paymentMethod || t('orders.cashOnDelivery')}
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Danh sách sản phẩm (Manifest Content) */}
          <div>
            <h3 className="font-semibold text-neutral-900 tracking-wider text-[11px] uppercase mb-3 font-mono">
              {t('orderDetail.manifestContent', { count: order.items?.length || 0 })}
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-stone-50 border border-neutral-200/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.name}
                      onError={handleImageError}
                      className="w-12 h-16 object-cover border border-neutral-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 text-xs truncate">
                        {getLocalizedProductName(item, i18n.language, item.name)}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-sans">
                        {item.selectedSize || t('orders.standard')} • {item.selectedColor || t('orders.standard')} • {t('orderDetail.quantity')} {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono font-semibold text-neutral-900 shrink-0">
                    {formatVND((item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng chi tiết giá tiền */}
          <div className="bg-stone-50 p-4 border border-neutral-200 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t('orderDetail.subtotal')}</span>
              <span>{formatVND(order.subtotal || order.total)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{t('orderDetail.shippingFee')}</span>
              <span>
                {order.shippingFee > 0 ? formatVND(order.shippingFee) : t('orderDetail.freeAtelier')}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{t('orderDetail.atelierTax')}</span>
              <span>0₫</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900 text-sm">
              <span>{t('orders.grandTotalCod')}</span>
              <span className="text-base text-black">
                {formatVND(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Chân Modal */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-100/80 border-t border-neutral-200 flex flex-wrap justify-between items-center gap-3">
          {onOpenFullDetail && (
            <button
              type="button"
              onClick={() => onOpenFullDetail(order)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:text-black transition-colors cursor-pointer"
            >
              <span>{t('orders.openFullOrderLedger')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black text-white text-xs tracking-wider uppercase font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {t('common.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}

