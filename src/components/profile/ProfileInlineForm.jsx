import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../common'
import { validateField, validateProfileInfo } from '../../utils/validation'

/**
 * Component ProfileInlineForm: Biểu mẫu chỉnh sửa thông tin cá nhân TRỰC TIẾP TRÊN TRANG (Inline)
 */
export default function ProfileInlineForm({ profile, onSave, onCancel }) {
  const { t } = useTranslation()
  // 1. State lưu trữ dữ liệu thông tin cá nhân đang nhập
  const [formData, setFormData] = useState(() => ({
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    dob: profile?.dob || '',
    gender: profile?.gender || 'Female',
  }))

  // 2. State quản lý các thông báo lỗi xác thực
  const [errors, setErrors] = useState({})

  // Xử lý thay đổi giá trị của từng ô input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Xóa lỗi tương ứng khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Kiểm tra tính hợp lệ khi người dùng blur khỏi ô input bằng hàm dùng chung
  const handleBlur = (e) => {
    const { name, value } = e.target
    const errorMsg = validateField(name, value)
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [name]: errorMsg }))
    }
  }

  // Xử lý khi nhấn nút Lưu (Submit form) bằng hàm dùng chung
  const handleSubmit = (e) => {
    e.preventDefault()

    // Sử dụng hàm kiểm tra toàn diện dùng chung
    const { isValid, errors: newErrors } = validateProfileInfo(formData)
    if (!isValid) {
      setErrors(newErrors)
      return
    }

    // Gửi dữ liệu đã cập nhật lên component cha
    onSave?.({
      ...profile,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dob: formData.dob.trim(),
      gender: formData.gender,
    })
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[2px] p-5 sm:p-7 md:p-8 flex flex-col gap-6 shadow-xs animate-in fade-in duration-200">
      {/* 1. Header của Form chỉnh sửa trực tiếp */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-1">
            {t('profile.inlineEditMode')}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#111111] uppercase tracking-[0.15em]">
            {t('profile.editPersonalInfo')}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs uppercase tracking-[0.15em] font-semibold text-[#888888] hover:text-black transition-colors cursor-pointer"
        >
          {t('profile.cancel')}
        </button>
      </div>

      {/* 2. Thân Form nhập thông tin cá nhân */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111]">
            {t('profile.accountCredentials')}
          </span>

          {/* Ô nhập Họ và Tên */}
          <div>
            <Input
              label={`${t('profile.fullName')} *`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="e.g. Helena Vance"
            />
          </div>

          {/* Lưới 2 cột cho Số điện thoại & Email trên Tablet/Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label={`${t('profile.phone')} *`}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                placeholder="e.g. 0912 345 678"
                className="font-mono"
              />
            </div>
            <div>
              <Input
                label={`${t('profile.email')} *`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="e.g. helena.vance@example.com"
              />
            </div>
          </div>

          {/* Lưới 2 cột cho Ngày sinh & Giới tính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label={t('profile.dob')}
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="DD / MM / YYYY"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#111111] mb-2">
                {t('profile.gender')}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-[42px] px-3.5 bg-white border border-[#E5E5E5] text-[14px] text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors"
              >
                <option value="Female">{t('profile.female')}</option>
                <option value="Male">{t('profile.male')}</option>
                <option value="Other">{t('profile.other')}</option>
                <option value="Prefer not to say">{t('profile.preferNotToSay')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Khung nút hành động (Lưu / Hủy) */}
        <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto px-7 text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            {t('profile.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto px-10 text-xs font-bold uppercase tracking-[0.2em] cursor-pointer"
          >
            {t('profile.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  )
}
