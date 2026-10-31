import { useTranslation } from 'react-i18next'
import { ORDER_TABS } from './orderConstants'

/**
 * Component OrderStatusTabs: Thanh chuyển đổi bộ lọc trạng thái đơn hàng (Tabs)
 * Hỗ trợ cuộn ngang mượt mà trên Mobile và co giãn tự nhiên trên Tablet / Desktop.
 *
 * Props:
 * - activeTab: Tab hiện tại đang được chọn ('all', 'pending', ...)
 * - onTabChange: Hàm callback khi người dùng bấm chọn một tab khác
 * - counts: Đối tượng chứa số lượng đơn theo từng trạng thái { all, pending, confirmed, ... }
 */
export default function OrderStatusTabs({
  activeTab = 'all',
  onTabChange,
  counts = {},
}) {
  const { t } = useTranslation()

  const getTabLabel = (key, defaultLabel) => {
    switch (key) {
      case 'all': return t('orders.all', defaultLabel)
      case 'pending': return t('orders.pending', defaultLabel)
      case 'confirmed': return t('orders.confirmed', defaultLabel)
      case 'shipping': return t('orders.shipping', defaultLabel)
      case 'completed': return t('orders.delivered', defaultLabel)
      case 'cancelled': return t('orders.cancelled', defaultLabel)
      default: return defaultLabel
    }
  }

  const tabs = ORDER_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.key] || 0,
    translatedLabel: getTabLabel(tab.key, tab.label),
  }))

  return (
    <nav
      aria-label="Order status filter"
      className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-3 mb-8 border-b border-neutral-200 text-xs sm:text-sm tracking-wider select-none no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange?.(tab.key)}
            className={`whitespace-nowrap px-4 sm:px-5 py-2.5 border-b-2 text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
              isActive
                ? 'border-black font-semibold text-black'
                : 'border-transparent text-neutral-500 hover:text-black font-medium'
            }`}
          >
            {tab.translatedLabel}{' '}
            <span className="ml-1 text-[11px] opacity-75 font-mono">
              ({tab.count})
            </span>
          </button>
        )
      })}
    </nav>
  )
}

