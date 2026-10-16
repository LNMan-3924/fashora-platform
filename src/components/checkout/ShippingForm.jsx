import { Input } from '../common'

/**
 * Component ShippingForm: Khung nhập thông tin giao hàng của người nhận.
 * Tái sử dụng component Input từ src/components/common để code ngắn gọn, đồng nhất thiết kế.
 *
 * Bao gồm:
 * 1. Họ và tên người nhận (Full Name)
 * 2. Số điện thoại liên hệ (Phone Number)
 * 3. Địa chỉ số nhà / tên đường (Street Address)
 * 4. Cơ cấu hành chính 3 cấp của Việt Nam: Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
 * 5. Tự động hiển thị thông báo lỗi kiểm tra dữ liệu đầu vào (Validation Errors)
 */
export default function ShippingForm({
  formData,
  onChange,
  onBlur,
  errors = {},
}) {
  return (
    <section className="border-b border-neutral-200 pb-8">
      {/* Tiêu đề mục thông tin giao hàng */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111]">
          1. Shipping Information
        </h2>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
          * Mandatory Fields
        </span>
      </div>

      <div className="space-y-4">
        {/* 1. Họ và tên người nhận */}
        <Input
          label="Full Name *"
          id="cust-name"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.fullName}
          placeholder="e.g. Helena Vance"
        />

        {/* 2. Số điện thoại liên lạc */}
        <Input
          label="Phone Number *"
          id="cust-phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.phone}
          placeholder="e.g. 0912345678"
          className="font-mono"
        />

        {/* 3. Địa chỉ số nhà / tên đường */}
        <Input
          label="Street Address / Địa chỉ *"
          id="cust-address"
          name="address"
          value={formData.address}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.address}
          placeholder="e.g. 742 Evergreen Terrace"
        />

        {/* 4. Cấu trúc hành chính 3 cấp (Phường/Xã, Quận/Huyện, Tỉnh/TP) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phường / Xã */}
          <Input
            label="Phường / Xã *"
            id="cust-ward"
            name="ward"
            value={formData.ward}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.ward}
            placeholder="e.g. Phường Bến Nghé"
          />

          {/* Quận / Huyện */}
          <Input
            label="Quận / Huyện *"
            id="cust-district"
            name="district"
            value={formData.district}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.district}
            placeholder="e.g. Quận 1"
          />

          {/* Tỉnh / Thành phố */}
          <Input
            label="Tỉnh / Thành phố *"
            id="cust-city"
            name="city"
            value={formData.city}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.city}
            placeholder="e.g. TP. Hồ Chí Minh"
          />
        </div>
      </div>
    </section>
  )
}
