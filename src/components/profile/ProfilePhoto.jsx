import { useRef } from 'react'
import { User } from 'lucide-react'

/**
 * Component ProfilePhoto: Khu vực hiển thị và thay đổi ảnh đại diện cá nhân
 *
 * Tính năng:
 * - Khung ảnh vuông chuẩn tỉ lệ 1:1, phong cách tối giản Atelier.
 * - Hiển thị placeholder biểu tượng người dùng nếu chưa có ảnh hoặc khi ảnh bị lỗi.
 * - Nút "CHANGE PHOTO" kích hoạt chọn tệp từ máy tính và đọc qua FileReader (base64).
 * - Nút "REMOVE" xóa ảnh đại diện quay về trạng thái mặc định.
 *
 * Props:
 * - avatarUrl: Đường dẫn ảnh đại diện hiện tại (nếu có)
 * - onPhotoChange: Callback nhận chuỗi ảnh base64 mới
 * - onPhotoRemove: Callback khi người dùng nhấn nút xóa ảnh
 */
export default function ProfilePhoto({
  avatarUrl,
  onPhotoChange,
  onPhotoRemove,
}) {
  const fileInputRef = useRef(null)

  // Xử lý khi người dùng chọn tệp ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng tệp phải là hình ảnh
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        onPhotoChange?.(result)
      }
    }
    reader.readAsDataURL(file)

    // Reset lại value của input để có thể chọn lại cùng 1 tệp nếu muốn
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-[260px] sm:max-w-[280px] mx-auto md:mx-0 flex flex-col items-center md:items-start">
      {/* 1. Khung hiển thị ảnh đại diện */}
      <div className="relative w-full aspect-square bg-[#F8F8F8] border border-[#E5E5E5] rounded-[2px] overflow-hidden flex items-center justify-center shadow-xs">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Customer Profile"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Nếu ảnh lỗi, ẩn ảnh và fallback về placeholder
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#999999]">
            <User className="w-16 h-16 stroke-[1.2]" />
          </div>
        )}
      </div>

      {/* 2. Các nút thao tác với ảnh */}
      <div className="mt-4 flex flex-col gap-2.5 w-full">
        {/* Nút Thay đổi ảnh (kích hoạt file input ẩn) */}
        <label
          htmlFor="profile-photo-upload"
          className="cursor-pointer text-center text-xs font-semibold uppercase tracking-[0.18em] py-2.5 px-4 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors rounded-[2px] block"
        >
          CHANGE PHOTO
          <input
            ref={fileInputRef}
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Nút Xóa ảnh */}
        {avatarUrl && (
          <button
            type="button"
            onClick={onPhotoRemove}
            className="text-center text-[11px] uppercase tracking-[0.18em] text-[#888888] hover:text-black py-1 transition-colors cursor-pointer"
          >
            REMOVE
          </button>
        )}
      </div>
    </div>
  )
}

