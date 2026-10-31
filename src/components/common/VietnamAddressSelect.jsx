import { useTranslation } from 'react-i18next'
import { useVietnamLocations } from '../../hooks/useVietnamLocations'
import Select from './Select'

/**
 * =============================================================================
 * COMPONENT: VietnamAddressSelect (Bộ Dropdown Kép Tỉnh/Thành & Phường/Xã)
 * =============================================================================
 */
export default function VietnamAddressSelect({
  cityValue = '',
  wardValue = '',
  onCityChange,
  onWardChange,
  onBlur,
  cityError = '',
  wardError = '',
  cityLabel,
  wardLabel,
  cityPlaceholder,
  wardPlaceholder,
  className = 'grid grid-cols-1 sm:grid-cols-2 gap-3',
}) {
  const { t } = useTranslation()
  const displayCityLabel = cityLabel || t('checkout.provinceCity')
  const displayWardLabel = wardLabel || t('checkout.wardCommune')
  const displayCityPlaceholder = cityPlaceholder || t('checkout.provincePlaceholder')
  const displayWardPlaceholder = wardPlaceholder || t('checkout.wardPlaceholder')
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
        label={displayCityLabel}
        id="city"
        name="city"
        value={selectedProvince?.name || cityValue || ''}
        onChange={handleCityChange}
        onBlur={onBlur}
        error={cityError}
        placeholder={displayCityPlaceholder}
        options={provinceOptions}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. DROPDOWN PHƯỜNG / XÃ (Trực thuộc Tỉnh/Thành đã chọn ở trên)    */}
      {/* Tự động bị vô hiệu hóa (disabled) nếu người dùng chưa chọn Tỉnh    */}
      {/* ------------------------------------------------------------------ */}
      <Select
        label={displayWardLabel}
        id="ward"
        name="ward"
        value={wardValue || ''}
        onChange={handleWardChange}
        onBlur={onBlur}
        error={wardError}
        placeholder={
          !selectedProvinceId
            ? t('checkout.selectCityFirst')
            : isLoadingWards
            ? t('common.loading')
            : displayWardPlaceholder
        }
        options={wardOptions}
        disabled={!selectedProvinceId} // Chỉ cho phép chọn phường/xã khi đã có tỉnh
      />
    </div>
  )
}
