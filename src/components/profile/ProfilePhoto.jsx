import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Loader2 } from 'lucide-react'
import { uploadImage } from '../../utils/imageUpload'

/**
 * Component ProfilePhoto: Khu vực hiển thị và thay đổi ảnh đại diện cá nhân
 *
 * Tính năng:
 * - Khung ảnh vuông chuẩn tỉ lệ 1:1, phong cách tối giản Atelier.
 * - Hiển thị placeholder biểu tượng người dùng nếu chưa có ảnh hoặc khi ảnh bị lỗi.
 * - Nút "CHANGE PHOTO" kích hoạt chọn tệp từ máy tính, tải lên Node.js fs qua hàm chung uploadImage().
 * - Ảnh đại diện được tự động lưu vào thư mục 'public/images/avatars/'.
 * - Nút "REMOVE" xóa ảnh đại diện quay về trạng thái mặc định.
 *
 * Props:
 * - avatarUrl: Đường dẫn ảnh đại diện hiện tại (nếu có)
 * - onPhotoChange: Callback nhận đường dẫn web tĩnh (/images/avatars/avatar-...)
 * - onPhotoRemove: Callback khi người dùng nhấn nút xóa ảnh
 */
export default function ProfilePhoto({
  avatarUrl,
  onPhotoChange,
  onPhotoRemove,
}) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  // Xử lý khi người dùng chọn tệp ảnh mới
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng tệp phải là hình ảnh
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, GIF).')
      return
    }

    setIsUploading(true)

    try {
      /**
       * Tái sử dụng hàm dùng chung uploadImage():
       * - Truyền { folder: 'avatars' } để plugin Node.js fs lưu ảnh vào 'public/images/avatars/'
       * - Trả về đường dẫn tĩnh như '/images/avatars/avatar-171829381.jpg'
       */
      const result = await uploadImage(file, { folder: 'avatars' })
      if (result?.url) {
        onPhotoChange?.(result.url)
      }
    } catch (err) {
      console.error('Error updating avatar:', err)
      alert(err.message || 'Unable to upload profile photo. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset lại value của input để có thể chọn lại cùng 1 tệp nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

        {/* Lớp phủ loading khi đang tải ảnh */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-700">
              Saving to fs...
            </span>
          </div>
        )}
      </div>

      {/* 2. Các nút thao tác với ảnh */}
      <div className="mt-4 flex flex-col gap-2.5 w-full">
        {/* Nút Thay đổi ảnh (kích hoạt file input ẩn) */}
        <label
          htmlFor="profile-photo-upload"
          className={`cursor-pointer text-center text-xs font-semibold uppercase tracking-[0.18em] py-2.5 px-4 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors rounded-[2px] block ${isUploading ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
          {isUploading ? t('profile.uploading') : t('profile.changePhoto')}
          <input
            ref={fileInputRef}
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {/* Nút Xóa ảnh */}
        {avatarUrl && (
          <button
            type="button"
            onClick={onPhotoRemove}
            disabled={isUploading}
            className="text-center text-[11px] uppercase tracking-[0.18em] text-[#888888] hover:text-black py-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t('profile.removePhoto')}
          </button>
        )}
      </div>
    </div>
  )
}
