import { useState } from 'react'
import { Button, Input } from '../common'
import { validateField, validateProfileInfo } from '../../utils/validation'

/**
 * Component ProfileInlineForm: Biểu mẫu chỉnh sửa thông tin cá nhân TRỰC TIẾP TRÊN TRANG (Inline)
 *
 * Tính năng chính:
 * - Thay thế hoàn toàn cho modal: người dùng chỉnh sửa thông tin cá nhân ngay trong giao diện trang.
 * - Chỉ tập trung vào thông tin tài khoản cá nhân:
 *   + Họ và tên (Full Name) *
 *   + Số điện thoại (Phone Number) *
 *   + Email (Email Address) *
 *   + Ngày sinh (Date of Birth)
 *   + Giới tính (Gender)
 *   (Đã loại bỏ phần chỉnh sửa Primary Address tại đây; toàn bộ địa chỉ giao hàng được quản lý tập trung ở mục Shipping Addresses).
 * - Sử dụng hàm kiểm tra đầu vào dùng chung (Single Source of Truth) đồng bộ với Checkout.
 * - Nút "SAVE CHANGES" lưu thông tin vào LocalStorage, cập nhật state và quay lại chế độ xem.
 * - Nút "CANCEL" hủy các chỉnh sửa chưa lưu và quay lại chế độ xem.
 *
 * Props:
 * - profile: Dữ liệu hồ sơ hiện tại { name, phone, email, dob, gender }
 * - onSave: Callback nhận dữ liệu cập nhật khi nhấn "SAVE CHANGES"
 * - onCancel: Callback khi nhấn "CANCEL" để thoát chế độ chỉnh sửa
 */
export default function ProfileInlineForm({ profile, onSave, onCancel }) {
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
            INLINE EDIT MODE
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#111111] uppercase tracking-[0.15em]">
            EDIT PERSONAL INFORMATION
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs uppercase tracking-[0.15em] font-semibold text-[#888888] hover:text-black transition-colors cursor-pointer"
        >
          CANCEL
        </button>
      </div>

      {/* 2. Thân Form nhập thông tin cá nhân */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111]">
            ACCOUNT CREDENTIALS
          </span>

          {/* Ô nhập Họ và Tên */}
          <div>
            <Input
              label="FULL NAME *"
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
                label="PHONE NUMBER *"
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
                label="EMAIL ADDRESS *"
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
                label="DATE OF BIRTH"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="DD / MM / YYYY"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#111111] mb-2">
                GENDER
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-[42px] px-3.5 bg-white border border-[#E5E5E5] text-[14px] text-[#111111] focus:border-[#111111] focus:outline-none rounded-none transition-colors"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
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
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto px-10 text-xs font-bold uppercase tracking-[0.2em] cursor-pointer"
          >
            SAVE CHANGES
          </Button>
        </div>
      </form>
    </div>
  )
}
