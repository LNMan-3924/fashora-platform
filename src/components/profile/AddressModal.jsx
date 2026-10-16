import { useState } from 'react'
import { X } from 'lucide-react'
import { Button, Input } from '../common'

/**
 * Component con AddressModalContent: Chứa toàn bộ nội dung form nhập địa chỉ
 * Được gắn key={addressData?.id || 'new'} từ component cha để tự khởi tạo state sạch sẽ
 * mà không cần sử dụng useEffect gây cascading renders.
 */
function AddressModalContent({ addressData, onClose, onSave }) {
  const isEdit = Boolean(addressData?.id)

  const [formData, setFormData] = useState(() => ({
    name: addressData?.name || '',
    phone: addressData?.phone || '',
    street: addressData?.street || '',
    ward: addressData?.ward || '',
    district: addressData?.district || '',
    city: addressData?.city || '',
    note: addressData?.note || '',
    isDefault: Boolean(addressData?.isDefault),
  }))

  const [errors, setErrors] = useState({})

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'Recipient name is required.'
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required.'
    if (!formData.street?.trim()) newErrors.street = 'Street address is required.'
    if (!formData.ward?.trim()) newErrors.ward = 'Ward is required.'
    if (!formData.district?.trim()) newErrors.district = 'District is required.'
    if (!formData.city?.trim()) newErrors.city = 'City/Province is required.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave?.({
      ...(addressData || {}),
      ...formData,
      id: addressData?.id || `ADDR-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
    })
    onClose?.()
  }

  return (
    <div
      className="bg-white max-w-[600px] w-full rounded-[2px] max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E5E5] overflow-hidden animate-in zoom-in-95 duration-150"
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
            label="RECIPIENT FULL NAME *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. Helena Vance"
          />
        </div>

        <div>
          <Input
            label="PHONE NUMBER *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="e.g. 0912 345 678"
            className="font-mono"
          />
        </div>

        <div>
          <Input
            label="HOUSE NUMBER / STREET *"
            name="street"
            value={formData.street}
            onChange={handleChange}
            error={errors.street}
            placeholder="e.g. 128 Le Duan Boulevard"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="WARD / COMMUNE *"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              error={errors.ward}
              placeholder="e.g. Ben Nghe Ward"
            />
          </div>

          <div>
            <Input
              label="DISTRICT / COUNTY *"
              name="district"
              value={formData.district}
              onChange={handleChange}
              error={errors.district}
              placeholder="e.g. District 1"
            />
          </div>
        </div>

        <div>
          <Input
            label="PROVINCE / CITY *"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="e.g. Ho Chi Minh City"
          />
        </div>

        <div>
          <Input
            label="DELIVERY NOTE (OPTIONAL)"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="e.g. Leave with reception / concierge during work hours"
          />
        </div>

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
 * Sử dụng key trên AddressModalContent giúp reset state mượt mà khi mở lại form.
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

