import { useVietnamLocations } from '../../hooks/useVietnamLocations'
import Select from './Select'

/**
 * Component VietnamAddressSelect:
 * Nhóm 2 dropdown Tỉnh/Thành phố & Phường/Xã dùng chung cho Checkout và Profile.
 * Tái sử dụng useVietnamLocations hook để xử lý tải danh mục 34 tỉnh thành và phường/xã trực thuộc.
 *
 * Props:
 * - cityValue: Giá trị tỉnh/thành hiện tại
 * - wardValue: Giá trị phường/xã hiện tại
 * - onCityChange: Callback khi người dùng chọn Tỉnh/Thành mới
 * - onWardChange: Callback khi người dùng chọn Phường/Xã mới
 * - onBlur: Callback khi blur khỏi dropdown
 * - cityError: Thông báo lỗi kiểm tra trường Tỉnh/Thành
 * - wardError: Thông báo lỗi kiểm tra trường Phường/Xã
 * - cityLabel / wardLabel: Nhãn hiển thị
 * - cityPlaceholder / wardPlaceholder: Văn bản gợi ý
 * - className: Class định dạng lưới layout
 */
export default function VietnamAddressSelect({
  cityValue = '',
  wardValue = '',
  onCityChange,
  onWardChange,
  onBlur,
  cityError = '',
  wardError = '',
  cityLabel = 'Tỉnh / Thành phố (34 tỉnh thành) *',
  wardLabel = 'Phường / Xã *',
  cityPlaceholder = '-- Chọn Tỉnh / Thành phố --',
  wardPlaceholder = '-- Chọn Phường / Xã --',
  className = 'grid grid-cols-1 sm:grid-cols-2 gap-3',
}) {
  const {
    isLoadingWards,
    selectedProvince,
    selectedProvinceId,
    provinceOptions,
    wardOptions,
  } = useVietnamLocations(cityValue, wardValue)

  const handleCityChange = (e) => {
    const newCity = e.target.value
    onCityChange?.(newCity)
  }

  const handleWardChange = (e) => {
    const newWard = e.target.value
    onWardChange?.(newWard)
  }

  return (
    <div className={className}>
      {/* 1. Dropdown Tỉnh / Thành phố (34 đơn vị hành chính cấp tỉnh mới) */}
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

      {/* 2. Dropdown Phường / Xã (Trực thuộc Tỉnh/Thành đã chọn) */}
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
            ? '-- Vui lòng chọn Tỉnh/Thành trước --'
            : isLoadingWards
            ? 'Đang tải danh sách...'
            : wardPlaceholder
        }
        options={wardOptions}
        disabled={!selectedProvinceId}
      />
    </div>
  )
}

