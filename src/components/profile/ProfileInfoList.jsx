/**
 * Component ProfileInfoList: Danh sách các thẻ hiển thị thông tin tài khoản cá nhân
 *
 * Hiển thị lần lượt:
 * - Header có nút "EDIT" nhanh ở góc trên
 * - 5 thẻ thông tin cá nhân:
 *   + Tên (NAME)
 *   + Số điện thoại (PHONE)
 *   + Email (EMAIL)
 *   + Ngày sinh (DATE OF BIRTH)
 *   + Giới tính (GENDER)
 *   (Đã tách biệt và chuyển toàn bộ việc quản lý địa chỉ sang mục Shipping Addresses bên dưới).
 * - Nút "CHANGE INFORMATION" kích hoạt chế độ chỉnh sửa trực tiếp trên giao diện (Inline).
 *
 * Props:
 * - profile: Đối tượng dữ liệu hồ sơ { name, phone, email, dob, gender }
 * - onStartEdit: Hàm callback kích hoạt chuyển sang chế độ chỉnh sửa inline ngay trên trang
 */
export default function ProfileInfoList({ profile, onStartEdit }) {
  const fields = [
    { label: 'NAME', value: profile?.name, isMono: false },
    { label: 'PHONE', value: profile?.phone, isMono: true },
    { label: 'EMAIL', value: profile?.email, isMono: false },
    { label: 'DATE OF BIRTH', value: profile?.dob, isMono: true },
    { label: 'GENDER', value: profile?.gender, isMono: false },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header phần thông tin cá nhân kèm nút Chỉnh sửa nhanh */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-0.5">
            ACCOUNT DETAILS
          </span>
          <h2 className="text-sm md:text-base font-bold uppercase tracking-[0.15em] text-[#111111]">
            PERSONAL INFORMATION
          </h2>
        </div>

        <button
          type="button"
          onClick={onStartEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111] hover:opacity-60 transition-opacity cursor-pointer p-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>EDIT</span>
        </button>
      </div>

      {/* 2. Danh sách 5 thẻ thông tin cá nhân */}
      <div className="flex flex-col gap-3.5">
        {fields.map((field) => (
          <div
            key={field.label}
            onClick={onStartEdit}
            title="Click to edit personal details"
            className="group bg-white border border-[#E5E5E5] rounded-[2px] p-4 sm:p-5 transition-all hover:border-[#111111] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
                {field.label}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                EDIT ✎
              </span>
            </div>
            <span
              className={`block text-sm sm:text-base md:text-lg font-medium text-[#111111] tracking-wide ${
                field.isMono ? 'font-mono' : ''
              }`}
            >
              {field.value || 'Not provided'}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Nút hành động Thay đổi thông tin trực tiếp */}
      <div className="mt-4 flex justify-center md:justify-end">
        <button
          type="button"
          onClick={onStartEdit}
          className="w-full md:w-auto inline-flex items-center justify-center bg-[#111111] text-white hover:bg-black text-xs font-semibold uppercase tracking-[0.2em] px-10 py-3.5 rounded-[2px] transition-colors cursor-pointer"
        >
          CHANGE INFORMATION
        </button>
      </div>
    </div>
  )
}
