import { useState } from 'react'
import { X } from 'lucide-react'
import { Button, Input, VietnamAddressSelect } from '../common'
import { validateField, validateAddressOnly } from '../../utils/validation'

/**
 * Component AddressModalContent: Form nhập thông tin địa chỉ giao hàng
 * Yêu cầu: CHỈ YÊU CẦU NHẬP ĐỊA CHỈ (Address, Ward, City theo chuẩn 34 đơn vị hành chính mới).
 * Được gắn key={addressData?.id || 'new'} từ component cha để tự khởi tạo state sạch sẽ.
 */
function AddressModalContent({ addressData, onClose, onSave }) {
  const isEdit = Boolean(addressData?.id)

  const [formData, setFormData] = useState(() => ({
    address: addressData?.address || addressData?.street || '',
    ward: addressData?.ward || '',
    district: addressData?.district || '',
    city: addressData?.city || '',
    isDefault: Boolean(addressData?.isDefault),
  }))

  const [errors, setErrors] = useState({})

  const handleCityChange = (newCity) => {
    setFormData((prev) => ({
      ...prev,
      city: newCity,
      ward: '',
      district: '',
    }))
    if (errors.city || errors.ward) {
      setErrors((prev) => ({ ...prev, city: '', ward: '' }))
    }
  }

  const handleWardChange = (newWard) => {
    setFormData((prev) => ({
      ...prev,
      ward: newWard,
    }))
    if (errors.ward) {
      setErrors((prev) => ({ ...prev, ward: '' }))
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Kiểm tra tính hợp lệ khi người dùng blur khỏi ô input
  const handleBlur = (e) => {
    const { name, value } = e.target
    const errorMsg = validateField(name, value)
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [name]: errorMsg }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Kiểm tra tính hợp lệ chỉ cho các trường địa chỉ
    const { isValid, errors: newErrors } = validateAddressOnly(formData)
    if (!isValid) {
      setErrors(newErrors)
      return
    }

    const cleanBase = { ...(addressData || {}) }
    delete cleanBase.street

    onSave?.({
      ...cleanBase,
      address: (formData.address || '').trim(),
      ward: (formData.ward || '').trim(),
      district: (formData.district || '').trim(),
      city: (formData.city || '').trim(),
      isDefault: formData.isDefault,
      id: addressData?.id || `ADDR-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
    })
    onClose?.()
  }

  return (
    <div
      className="bg-white max-w-[560px] w-full rounded-[2px] max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E5E5] overflow-hidden animate-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Modal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-white flex-shrink-0">
        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-[0.2em]">
          {isEdit ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
        </h3>
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="text-[#888888] hover:text-black p-1 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Form cuộn được */}
      <form
        onSubmit={handleSubmit}
        className="overflow-y-auto p-6 md:p-8 flex flex-col gap-4 text-left flex-1"
      >
        <div>
          <Input
            label="HOUSE NUMBER / STREET *"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.address}
            placeholder="e.g. 128 Le Duan Boulevard"
          />
        </div>

        <VietnamAddressSelect
          cityValue={formData.city}
          wardValue={formData.ward}
          onCityChange={handleCityChange}
          onWardChange={handleWardChange}
          onBlur={handleBlur}
          cityError={errors.city}
          wardError={errors.ward}
          cityLabel="PROVINCE / CITY (34 PROVINCES) *"
          wardLabel="WARD / COMMUNE *"
          cityPlaceholder="-- Select Province / City --"
          wardPlaceholder="-- Select Ward / Commune --"
        />

        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#111111] select-none">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="rounded-[2px] border-[#CCCCCC] text-black focus:ring-0 w-4 h-4 cursor-pointer accent-black"
            />
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Set as default shipping address
            </span>
          </label>
        </div>

        {/* Nút lưu & hủy */}
        <div className="pt-4 flex flex-col gap-2.5 border-t border-[#F0F0F0]">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-xs font-bold uppercase tracking-[0.2em] py-3 rounded-[2px]"
          >
            SAVE ADDRESS
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full text-xs uppercase tracking-[0.15em] text-[#666666] hover:text-black py-2"
          >
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  )
}

/**
 * Component AddressModal: Cửa sổ thêm mới hoặc chỉnh sửa địa chỉ giao hàng
 * Chỉ yêu cầu nhập địa chỉ (Address, Ward, District, City).
 */
export default function AddressModal({
  isOpen,
  onClose,
  addressData = null,
  onSave,
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <AddressModalContent
        key={addressData?.id || 'new'}
        addressData={addressData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  )
}
