import React from 'react'

const UnlockItem: React.FC<any> = ({ icon, text, status, bg = 'bg-neutral-800', textColor = 'text-white', statusColor = 'text-white', showClaim = false }) => (
  <div className={`self-stretch px-3 py-2.5 ${bg} rounded-2xl flex flex-col justify-start items-start gap-2.5 overflow-hidden`}>
    <div className="self-stretch inline-flex justify-between items-center">
      <div className="flex justify-start items-center gap-2">
        {icon}
        <div className={`justify-start ${textColor} text-sm font-normal`}>{text}</div>
      </div>
      <div className={`text-center justify-start ${statusColor} text-xs font-normal`}>{status}</div>
    </div>
    {showClaim && (
      <div className="self-stretch px-3 py-1 bg-white/10 rounded-lg inline-flex justify-center items-center gap-2.5 overflow-hidden">
        <div className="justify-start text-white text-xs font-medium">{t('red.packet.claim')}</div>
      </div>
    )}
  </div>
)

export default UnlockItem
