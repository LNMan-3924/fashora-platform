import { Link } from 'react-router-dom'
import { Input } from '../common'

/**
 * Component ShippingForm: Khung nhập thông tin giao hàng của người nhận.
 * Tái sử dụng component Input từ src/components/common để code ngắn gọn, đồng nhất thiết kế.
 *
 * Tính năng:
 * 1. Hiển thị danh sách địa chỉ đã lưu từ Hồ sơ cá nhân (Profile) để chọn nhanh bằng 1 click.
 * 2. Tự động điền đầy đủ Họ tên, SĐT, Số nhà/Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP.
 * 3. Cho phép người dùng chỉnh sửa trực tiếp các ô input nếu muốn giao đến địa chỉ khác.
 * 4. Tự động hiển thị thông báo lỗi kiểm tra dữ liệu đầu vào (Validation Errors).
 */
export default function ShippingForm({
  formData,
  onChange,
  onBlur,
  errors = {},
  savedAddresses = [],
  onSelectSavedAddress,
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

      {/* Danh sách địa chỉ đã lưu từ Profile để khách hàng chọn nhanh */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-6 p-4 bg-[#F8F8F8] border border-[#E5E5E5] rounded-[2px]">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-3 flex-wrap gap-2">
            <span className="font-semibold text-neutral-800">
              SAVED ADDRESSES FROM PROFILE:
            </span>
            <Link
              to="/profile"
              className="text-black hover:underline inline-flex items-center gap-1 font-semibold transition-colors"
            >
              Manage in Profile →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected =
                formData.fullName === addr.name &&
                formData.phone === addr.phone &&
                formData.address === addr.street

              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectSavedAddress?.(addr)}
                  className={`p-3 text-left border rounded-[2px] transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black bg-white shadow-xs ring-1 ring-black'
                      : 'border-[#E5E5E5] bg-white hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-[#111111] truncate">
                      {addr.name}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded-[2px] shrink-0">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">{addr.phone}</p>
                  <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                    {addr.street}, {addr.ward ? `${addr.ward}, ` : ''}{addr.district}, {addr.city}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

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
          placeholder="e.g. 0912 345 678"
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
          placeholder="e.g. 128 Le Duan Boulevard, Floor 4"
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
            placeholder="e.g. Ben Nghe Ward"
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
            placeholder="e.g. District 1"
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
            placeholder="e.g. Ho Chi Minh City"
          />
        </div>
      </div>
    </section>
  )
}
