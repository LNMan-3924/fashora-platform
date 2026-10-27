import { Link } from 'react-router-dom'
import { Input, VietnamAddressSelect } from '../common'

/**
 * Component ShippingForm: Khung nhập thông tin giao hàng của người nhận.
 * Tái sử dụng component Input và VietnamAddressSelect từ src/components/common để code ngắn gọn, đồng nhất thiết kế.
 * Hỗ trợ chuẩn 34 đơn vị hành chính cấp tỉnh mới của Việt Nam (Nghị quyết 202/2025/QH15 & QĐ 19/2025/QĐ-TTg).
 *
 * Tính năng:
 * 1. Hiển thị danh sách địa chỉ đã lưu từ Hồ sơ cá nhân (Profile) để chọn nhanh bằng 1 click.
 * 2. Tự động điền đầy đủ Họ tên, SĐT, Số nhà/Đường, Phường/Xã, Tỉnh/TP.
 * 3. Dropdown Tỉnh/Thành phố (34 đơn vị) -> tự động nạp Phường/Xã trực thuộc tương ứng.
 * 4. Tự động hiển thị thông báo lỗi kiểm tra dữ liệu đầu vào (Validation Errors).
 */
export default function ShippingForm({
  formData = {},
  onChange,
  onBlur,
  errors = {},
  savedAddresses = [],
  onSelectSavedAddress,
}) {
  const handleCityChange = (newCity) => {
    if (typeof onChange === 'function') {
      onChange('city', newCity)
      onChange('ward', '')
      onChange('district', '')
    }
  }

  const handleWardChange = (newWard) => {
    if (typeof onChange === 'function') {
      onChange('ward', newWard)
    }
  }

  // Chuẩn hóa sự kiện onChange từ native <input> để truyền lại đúng (name, value) cho component cha
  const handleChange = (e) => {
    const { name, value } = e.target
    if (typeof onChange === 'function') {
      onChange(name, value)
    }
  }

  // Chuẩn hóa sự kiện onBlur từ native <input> để truyền lại name cho component cha kiểm tra validate
  const handleBlur = (e) => {
    const { name } = e.target
    if (typeof onBlur === 'function') {
      onBlur(name)
    }
  }

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
            {savedAddresses.map((addr, idx) => {
              const addrName = addr.name || addr.fullName || ''
              const addrPhone = addr.phone || addr.phoneNumber || ''
              const addrStreet = addr.address || addr.street || ''
              const isSelected =
                (formData.fullName || '') === addrName &&
                (formData.phone || '') === addrPhone &&
                (formData.address || '') === addrStreet

              const locationParts = [
                addrStreet,
                addr.ward,
                addr.district,
                addr.city,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <button
                  key={addr.id || `saved-addr-${idx}`}
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
                      {addrName}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded-[2px] shrink-0">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">{addrPhone}</p>
                  <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                    {locationParts}
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
          id="fullName"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          placeholder="e.g. Helena Vance"
        />

        {/* 2. Số điện thoại liên lạc */}
        <Input
          label="Phone Number *"
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phone}
          placeholder="e.g. 0912 345 678"
          className="font-mono"
        />

        {/* 3. Địa chỉ số nhà / tên đường */}
        <Input
          label="Street Address *"
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.address}
          placeholder="e.g. 128 Le Duan Boulevard, Floor 4"
        />

        {/* 4. Cấu trúc hành chính 2 cấp theo chuẩn 34 đơn vị hành chính cấp tỉnh mới */}
        <VietnamAddressSelect
          cityValue={formData.city}
          wardValue={formData.ward}
          onCityChange={handleCityChange}
          onWardChange={handleWardChange}
          onBlur={handleBlur}
          cityError={errors.city}
          wardError={errors.ward}
        />
      </div>
    </section>
  )
}
