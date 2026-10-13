/**
 * Component ShippingForm: Khung nhập thông tin giao hàng của người nhận.
 * Bao gồm:
 * 1. Họ và tên người nhận (Full Name)
 * 2. Số điện thoại liên hệ (Phone Number)
 * 3. Địa chỉ số nhà / tên đường (Street Address)
 * 4. Cơ cấu hành chính 3 cấp của Việt Nam: Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
 * 5. Hiển thị thông báo lỗi kiểm tra dữ liệu đầu vào (Validation Errors)
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
        <div>
          <label
            htmlFor="cust-name"
            className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="cust-name"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. Helena Vance"
            className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors ${
              errors.fullName ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-600 font-mono mt-1">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* 2. Số điện thoại liên lạc */}
        <div>
          <label
            htmlFor="cust-phone"
            className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            id="cust-phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. 0912345678"
            className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none font-mono transition-colors ${
              errors.phone ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-600 font-mono mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* 3. Địa chỉ số nhà / tên đường */}
        <div>
          <label
            htmlFor="cust-address"
            className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
          >
            Street Address / Địa chỉ *
          </label>
          <input
            type="text"
            id="cust-address"
            name="address"
            value={formData.address}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. 742 Evergreen Terrace"
            className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors ${
              errors.address ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
            }`}
          />
          {errors.address && (
            <p className="text-[11px] text-red-600 font-mono mt-1">
              {errors.address}
            </p>
          )}
        </div>

        {/* 4. Cấu trúc hành chính 3 cấp (Phường/Xã, Quận/Huyện, Tỉnh/TP) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phường / Xã */}
          <div>
            <label
              htmlFor="cust-ward"
              className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
            >
              Phường / Xã *
            </label>
            <input
              type="text"
              id="cust-ward"
              name="ward"
              value={formData.ward}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="e.g. Phường Bến Nghé"
              className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors ${
                errors.ward ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
              }`}
            />
            {errors.ward && (
              <p className="text-[11px] text-red-600 font-mono mt-1">
                {errors.ward}
              </p>
            )}
          </div>

          {/* Quận / Huyện */}
          <div>
            <label
              htmlFor="cust-district"
              className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
            >
              Quận / Huyện *
            </label>
            <input
              type="text"
              id="cust-district"
              name="district"
              value={formData.district}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="e.g. Quận 1"
              className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors ${
                errors.district ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
              }`}
            />
            {errors.district && (
              <p className="text-[11px] text-red-600 font-mono mt-1">
                {errors.district}
              </p>
            )}
          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <label
              htmlFor="cust-city"
              className="block text-[11px] uppercase tracking-wider text-neutral-600 mb-1"
            >
              Tỉnh / Thành phố *
            </label>
            <input
              type="text"
              id="cust-city"
              name="city"
              value={formData.city}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="e.g. TP. Hồ Chí Minh"
              className={`w-full px-3 py-2.5 bg-white border text-xs text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors ${
                errors.city ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
              }`}
            />
            {errors.city && (
              <p className="text-[11px] text-red-600 font-mono mt-1">
                {errors.city}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

