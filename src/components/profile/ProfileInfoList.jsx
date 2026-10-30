import { useTranslation } from 'react-i18next'

/**
 * Component ProfileInfoList: Danh sách các thẻ hiển thị thông tin tài khoản cá nhân
 */
export default function ProfileInfoList({ profile, onStartEdit }) {
  const { t } = useTranslation()

  const formatGender = (g) => {
    if (!g) return t('profile.notProvided')
    const lower = String(g).toLowerCase()
    if (lower === 'female') return t('profile.female')
    if (lower === 'male') return t('profile.male')
    if (lower === 'other') return t('profile.other')
    if (lower.includes('prefer')) return t('profile.preferNotToSay')
    return g
  }

  const fields = [
    { label: t('profile.name'), value: profile?.name, isMono: false },
    { label: t('profile.phone'), value: profile?.phone, isMono: true },
    { label: t('profile.email'), value: profile?.email, isMono: false },
    { label: t('profile.dob'), value: profile?.dob, isMono: true },
    { label: t('profile.gender'), value: formatGender(profile?.gender), isMono: false },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header phần thông tin cá nhân kèm nút Chỉnh sửa nhanh */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-0.5">
            {t('profile.accountDetails')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#111111] font-sans">
            {t('profile.personalInfo')}
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
          <span>{t('profile.edit')}</span>
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
                {t('profile.edit')} ✎
              </span>
            </div>
            <span
              className={`block text-sm sm:text-base md:text-lg font-medium text-[#111111] tracking-wide ${
                field.isMono ? 'font-mono' : ''
              }`}
            >
              {field.value || t('profile.notProvided')}
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
          {t('profile.changeInformation')}
        </button>
      </div>
    </div>
  )
}
