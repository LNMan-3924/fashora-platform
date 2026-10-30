import { ShieldCheck, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function UnifiedAccountBanner({ currentUser, compact = false }) {
  const { t } = useTranslation()
  const displayName = currentUser?.fullName || 'Fashora Member'
  const displayEmail = currentUser?.email || currentUser?.phoneNumber || 'account@fashora.com'

  if (compact) {
    return (
      <div className="w-full bg-[#fbfbfb] border border-neutral-200 p-3 sm:px-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-neutral-600 truncate">
            <span className="font-semibold text-black uppercase tracking-wider">
              {t('becomeSeller.unifiedBanner.registeringAs', { name: displayName, defaultValue: `REGISTERING AS ${displayName}` })}
            </span>{' '}
            <span className="text-neutral-400">({displayEmail})</span>
            <span className="hidden md:inline text-neutral-500"> — {t('becomeSeller.unifiedBanner.compactNote', 'Your existing customer profile will automatically gain seller capabilities.')}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#fafafa] border border-neutral-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-none bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-900 font-semibold">
              {t('becomeSeller.unifiedBanner.dualRoleTitle', 'ONE ACCOUNT ECOSYSTEM (DUAL-ROLE)')}
            </span>
            <span className="text-[10px] font-mono tracking-wider bg-neutral-200 text-neutral-800 px-1.5 py-0.5 font-medium">
              {t('becomeSeller.unifiedBanner.seamlessAuth', 'SEAMLESS AUTH')}
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            {t('becomeSeller.unifiedBanner.dualRoleDesc', {
              email: displayEmail,
              defaultValue: `Continue with your current credentials (${displayEmail}). No new passwords or separate logins required. Your cart, saved shipping addresses, and purchase history remain intact.`
            })}
          </p>
        </div>
      </div>
      <div className="hidden lg:block shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-widest border border-neutral-300 text-neutral-700 px-2.5 py-1">
          {t('becomeSeller.unifiedBanner.unifiedEco', 'UNIFIED ECOSYSTEM')}
        </span>
      </div>
    </div>
  )
}
