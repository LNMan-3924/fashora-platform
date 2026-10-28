import { useVietnamLocations } from '../../hooks/useVietnamLocations'
import Select from './Select'

/**
 * =============================================================================
 * COMPONENT: VietnamAddressSelect (Bộ Dropdown Kép Tỉnh/Thành & Phường/Xã)
 * =============================================================================
 *
 * 1. MỤC ĐÍCH:
 * - Đóng gói toàn bộ cặp Dropdown chọn địa chỉ gồm:
 *   + Ô 1: Chọn Tỉnh / Thành phố (34 đơn vị hành chính mới).
 *   + Ô 2: Chọn Phường / Xã (tự động phụ thuộc theo Tỉnh/Thành đã chọn).
 * - Sử dụng chung tại:
 *   + Form thanh toán: `ShippingForm.jsx` (Checkout).
 *   + Form sổ địa chỉ: `AddressModal.jsx` (Profile).
 *   + Form đăng ký shop: `BecomeSellerInfo.jsx`.
 *
 * 2. CÁC PROPS:
 * @param {string} cityValue - Giá trị tên tỉnh/thành phố hiện tại
 * @param {string} wardValue - Giá trị tên phường/xã hiện tại
 * @param {Function} onCityChange - Hàm gọi lại khi người dùng chọn Tỉnh/Thành mới
 * @param {Function} onWardChange - Hàm gọi lại khi người dùng chọn Phường/Xã mới
 * @param {Function} [onBlur] - Hàm gọi lại khi blur khỏi trường nhập liệu (dùng cho validation form)
 * @param {string} [cityError] - Thông báo lỗi kiểm tra trường Tỉnh/Thành
 * @param {string} [wardError] - Thông báo lỗi kiểm tra trường Phường/Xã
 * @param {string} [cityLabel] - Nhãn hiển thị cho ô Tỉnh/Thành
 * @param {string} [wardLabel] - Nhãn hiển thị cho ô Phường/Xã
 * @param {string} [cityPlaceholder] - Văn bản placeholder ô Tỉnh/Thành
 * @param {string} [wardPlaceholder] - Văn bản placeholder ô Phường/Xã
 * @param {string} [className] - Lớp CSS bố cục lưới (mặc định grid 2 cột trên màn hình sm trở lên)
 */
export default function VietnamAddressSelect({
  cityValue = '',
  wardValue = '',
  onCityChange,
  onWardChange,
  onBlur,
  cityError = '',
  wardError = '',
  cityLabel = 'Province / City (34 provinces) *',
  wardLabel = 'Ward / Commune *',
  cityPlaceholder = '-- Select Province / City --',
  wardPlaceholder = '-- Select Ward / Commune --',
  className = 'grid grid-cols-1 sm:grid-cols-2 gap-3',
}) {
  // Kết nối với Custom Hook quản lý dữ liệu địa giới hành chính
  const {
    isLoadingWards,
    selectedProvince,
    selectedProvinceId,
    provinceOptions,
    wardOptions,
  } = useVietnamLocations(cityValue, wardValue)

  // Xử lý khi người dùng chọn Tỉnh/Thành mới
  const handleCityChange = (e) => {
    const newCity = e.target.value
    onCityChange?.(newCity)
  }

  // Xử lý khi người dùng chọn Phường/Xã mới
  const handleWardChange = (e) => {
    const newWard = e.target.value
    onWardChange?.(newWard)
  }

  return (
    <div className={className}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. DROPDOWN TỈNH / THÀNH PHỐ (34 đơn vị hành chính cấp tỉnh mới)   */}
      {/* ------------------------------------------------------------------ */}
      <Select
        label={cityLabel}
        id="city"
        name="city"
        value={selectedProvince?.name || cityValue || ''}
        onChange={handleCityChange}
        onBlur={onBlur}
        error={cityError}
        placeholder={cityPlaceholder}
        options={provinceOptions}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. DROPDOWN PHƯỜNG / XÃ (Trực thuộc Tỉnh/Thành đã chọn ở trên)    */}
      {/* Tự động bị vô hiệu hóa (disabled) nếu người dùng chưa chọn Tỉnh    */}
      {/* ------------------------------------------------------------------ */}
      <Select
        label={wardLabel}
        id="ward"
        name="ward"
        value={wardValue || ''}
        onChange={handleWardChange}
        onBlur={onBlur}
        error={wardError}
        placeholder={
          !selectedProvinceId
            ? '-- Please select Province / City first --'
            : isLoadingWards
            ? 'Loading list...'
            : wardPlaceholder
        }
        options={wardOptions}
        disabled={!selectedProvinceId} // Chỉ cho phép chọn phường/xã khi đã có tỉnh
      />
    </div>
  )
}
