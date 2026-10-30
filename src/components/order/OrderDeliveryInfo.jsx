import { useTranslation } from 'react-i18next'
import { formatFullAddress } from './orderConstants'

/**
 * Component OrderDeliveryInfo: Hiển thị thông tin giao nhận và vận chuyển đơn hàng
 */
export default function OrderDeliveryInfo({
  recipient = {},
  logistics = {},
  shippingMethod,
  paymentMethod = 'Cash On Delivery (COD)',
}) {
  const { t } = useTranslation()
  const recipientName = recipient.fullName || recipient.name || t('orderDetail.recipient')
  const recipientPhone = recipient.phone || 'N/A'
  const formattedAddress = formatFullAddress(recipient)
  const courier = logistics.courier || 'SPX Express Logistics'
  const waybill = logistics.waybill || t('orderDetail.pendingAssignment')

  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-8">
      <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900 font-mono pb-4 border-b border-neutral-200 mb-6">
        {t('orderDetail.deliveryTitle')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-xs sm:text-sm">
        {/* Địa chỉ người nhận hàng */}
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
            {t('orderDetail.shippingAddress')}
          </h3>
          <div className="space-y-1 text-neutral-700 leading-relaxed font-sans">
            <p className="font-semibold text-neutral-900 text-sm">
              {recipientName}
            </p>
            <p className="text-neutral-700">{formattedAddress}</p>
            <p className="font-mono text-neutral-900 font-medium pt-1">
              {t('orderDetail.phone')} {recipientPhone}
            </p>
          </div>
        </div>

        {/* Thông tin điều phối vận chuyển */}
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
            {t('orderDetail.dispatchLogistics')}
          </h3>
          <div className="space-y-2 text-neutral-700 leading-relaxed font-sans">
            <div>
              <span className="text-neutral-500">{t('orderDetail.shippingPartner')}</span>
              <p className="font-semibold text-neutral-900">{courier}</p>
            </div>

            <div>
              <span className="text-neutral-500">{t('orderDetail.trackingWaybill')}</span>
              <p className="font-mono font-bold text-neutral-900 tracking-wider">
                {waybill}
              </p>
            </div>

            {shippingMethod && (
              <div>
                <span className="text-neutral-500">{t('orderDetail.service')}</span>
                <p className="font-medium text-neutral-900">{shippingMethod}</p>
              </div>
            )}

            <div>
              <span className="text-neutral-500">{t('orderDetail.paymentProtocol')}</span>
              <p className="font-medium text-neutral-900">{paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
