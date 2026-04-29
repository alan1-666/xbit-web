
const GroupSetting = ({
  setShowSpreads,
  showSpreads,
}: {
  setShowSpreads: (value: boolean) => void
  showSpreads: boolean
}) => {
  return (
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowSpreads(!showSpreads)}>
        <div
          className={`w-10 h-5 rounded-full relative border border-gray-600 transition-colors ${showSpreads ? 'bg-blue-600 border-blue-600' : 'bg-transparent'}`}
        >
          <div
            className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${showSpreads ? 'left-5' : 'left-1'}`}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-400">Show Spreads + Totals</span>
      </div>
    </div>
  )
}

export default GroupSetting
