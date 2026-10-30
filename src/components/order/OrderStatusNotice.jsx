import { useTranslation } from 'react-i18next'
import { STATUS_CONFIG } from './orderConstants'

/**
 * Component OrderStatusNotice: Khung thông báo tiến độ đơn hàng
 */
export default function OrderStatusNotice({ status = 'PENDING', className = '' }) {
  const { t } = useTranslation()
  const rawStatus = String(status || 'PENDING').toUpperCase()
  const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.PENDING
  const StatusIcon = config.icon

  const getNoticeText = () => {
    switch (rawStatus) {
      case 'PENDING': return t('orderDetail.statusPendingNotice')
      case 'CONFIRMED':
      case 'PROCESSING': return t('orderDetail.statusConfirmedNotice')
      case 'SHIPPING': return t('orderDetail.statusShippingNotice')
      case 'COMPLETED': return t('orderDetail.statusCompletedNotice')
      case 'CANCELLED': return t('orderDetail.statusCancelledNotice')
      default: return config.noticeText
    }
  }

  return (
    <div
      className={`px-4 sm:px-6 py-3 border text-xs sm:text-sm flex items-center space-x-2.5 ${config.noticeBox} ${className}`}
    >
      <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span className="font-normal leading-relaxed">{getNoticeText()}</span>
    </div>
  )
}

