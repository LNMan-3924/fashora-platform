import { formatFullAddress, groupItemsByShop } from '../../constants'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'

/**
 * Component OrderReview: Xem lại thông tin đơn hàng trước khi đặt và nút Submit "PLACE ORDER".
 * Tái sử dụng component Button từ src/components/common để đảm bảo giao diện đồng bộ.
 *
 * Bao gồm:
 * 1. Tóm tắt thông tin người nhận (Họ tên, SĐT, Địa chỉ đầy đủ 3 cấp).
 * 2. Tóm tắt phương thức giao hàng và phương thức thanh toán COD.
 * 3. Nút đặt hàng "PLACE ORDER" với hiệu ứng loading tích hợp sẵn trong Button common.
 *
 * Props:
 * - formData: Thông tin người nhận ({ fullName, phone, address, ward, district, city }).
 * - shippingMethod: Gói vận chuyển được chọn (0 hoặc 50000).
 * - paymentMethod: Phương thức thanh toán (mặc định 'cod').
 * - isSubmitting: Trạng thái đang gửi yêu cầu đặt hàng.
 * - onSubmit: Hàm thực thi gửi đơn hàng.
 */
export default function OrderReview({
  formData,
  shippingMethod = 0,
  paymentMethod = 'cod',
  items = [],
  isSubmitting = false,
  onSubmit,
}) {
  const { t } = useTranslation()

  // Trích xuất danh sách các Atelier và địa chỉ từ SSOT
  const shopEntries = Object.values(groupItemsByShop(items))
  const uniqueShopNames = shopEntries.map((g) => g.shopName)
  const isMultiShop = uniqueShopNames.length > 1
  const fullAddress = formatFullAddress(formData)

  // Nhãn hiển thị cho gói giao hàng
  const shippingLabel =
    shippingMethod === 0
      ? `${t('checkout.standardDelivery', 'Standard Delivery')} (${t('checkout.complimentary', 'Complimentary')})`
      : `${t('checkout.expressDelivery', 'Express Priority Courier')} (50,000₫)`

  // Nhãn hiển thị cho phương thức thanh toán
  const paymentLabel =
    paymentMethod === 'cod'
      ? t('checkout.cod', 'Cash on Delivery (COD)')
      : 'Direct Bank Transfer'

  return (
    <section className="p-6 bg-neutral-50/80 border border-neutral-200">
      {/* Tiêu đề mục Review */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          <span>{t('checkout.reviewTitle', 'Review Your Order')}</span>
        </h2>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('checkout.verifiedBadge', 'VERIFIED')}</span>
        </span>
      </div>

      <p className="text-[11px] text-neutral-500 mb-6">
        {t('checkout.reviewSubtitle', 'Please verify all recipient credentials before submitting your order.')}
      </p>

      {/* Lưới 2 cột tóm tắt thông tin giao hàng & thanh toán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-6 mb-6">
        {/* Cột 1: Thông tin người nhận */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
            {t('checkout.shippingRecipient', 'Shipping Recipient')}
          </span>
          <p className="font-semibold text-[#111111]">{formData.fullName || '—'}</p>
          <p className="text-neutral-600 font-mono mt-0.5">
            {formData.phone || '—'}
          </p>
          <p className="text-neutral-600 mt-1.5 text-[11px] leading-relaxed break-words">
            {fullAddress}
          </p>
        </div>

        {/* Cột 2: Phương thức gửi hàng & thanh toán */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
            {t('checkout.dispatchPayment', 'Dispatch & Payment')}
          </span>
          <p className="text-neutral-800">
            <span className="text-neutral-400">{t('checkout.method', 'Method')}: </span>
            <span className="font-medium text-[#111111]">{shippingLabel}</span>
          </p>
          <p className="text-neutral-800 mt-1">
            <span className="text-neutral-400">{t('checkout.payment', 'Payment')}: </span>
            <span className="font-medium text-[#111111]">{paymentLabel}</span>
          </p>
          <p className="text-neutral-800 mt-1">
            <span className="text-neutral-400">{t('checkout.atelier', 'Atelier')}: </span>
            <span className="font-medium text-[#111111]">
              {isMultiShop
                ? t('checkout.independentAteliers', { count: uniqueShopNames.length, defaultValue: `${uniqueShopNames.length} Independent Ateliers` })
                : uniqueShopNames[0] || t('checkout.certifiedAtelier', 'Certified Atelier')}
            </span>
          </p>
        </div>

        {isMultiShop && (
          <div className="col-span-1 sm:col-span-2 p-3 bg-neutral-100 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <span className="font-semibold text-black uppercase tracking-wider block font-mono text-[10px]">
              {t('checkout.multiAtelierSplitTitle', 'MULTI-ATELIER SPLIT DISPATCH (SHOPEE STYLE)')}
            </span>
            <p className="leading-relaxed">
              {t('checkout.multiAtelierSplitDesc', {
                shops: uniqueShopNames.join(' & '),
                count: uniqueShopNames.length,
                defaultValue: `Your order contains items from ${uniqueShopNames.join(' & ')}. Upon confirmation, this order will be split into ${uniqueShopNames.length} independent packages so each atelier can fulfill and dispatch their items directly to your address.`
              })}
            </p>
          </div>
        )}
      </div>

      {/* Nút bấm ĐẶT HÀNG - Tái sử dụng Button từ common */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
        onClick={onSubmit}
        className="w-full tracking-[0.25em] text-xs py-4 cursor-pointer uppercase"
      >
        {isSubmitting ? t('checkout.processingOrder', 'PROCESSING ATELIER ORDER...') : t('checkout.placeOrder', 'PLACE ORDER')}
      </Button>

      {/* Cam kết & điều khoản */}
      <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest mt-3">
        {t('checkout.termsNotice', 'By placing order, you agree to Fashora Commission & Atelier Terms.')}
      </p>
    </section>
  )
}
