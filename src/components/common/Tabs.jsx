export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`border-b border-[#E5E5E5] w-full ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap pb-3 px-1 text-[13px] font-medium uppercase tracking-widest border-b-2 transition-all duration-150 rounded-none focus:outline-none ${
                isActive
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-[#E5E5E5]'
              }`}
            >
              {tab.label}
              {typeof tab.count !== 'undefined' && (
                <span
                  className={`ml-2 text-[11px] ${
                    isActive ? 'text-[#111111]' : 'text-[#666666]'
                  }`}
                >
                  ({tab.count})
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}