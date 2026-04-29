import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewMoreButtonProps {
  onClick: () => void
  dataLength: number
  className?: string
  text?: string
}

const ViewMoreButton = memo(({ 
  onClick, 
  dataLength, 
  className = "",
  text 
}: ViewMoreButtonProps) => {
  const { t } = useTranslation()
  
  // 如果没有数据，不显示按钮
  if (dataLength === 0) return null
  
  const displayText = text || `${t('futuresMarket.showMore')} 100+ coins`
  
  return (
    <div
      className={`rounded-[50px] h-[calc(1rem*(44/16))] hover:scale-[101%] transition-all duration-300 cursor-pointer flex gap-1 w-fit bg-[#ECECED14] justify-center items-center px-4 mx-auto mt-4 ${className}`}
      onClick={onClick}
    >
      <p className="text-[calc(1rem*(11/16))] text-[#FFFFFFB2]">{displayText}</p>
      <img src="/images/listCoinCrypto/more-1.svg" alt="" className="size-6" />
    </div>
  )
})

ViewMoreButton.displayName = 'ViewMoreButton'

export default ViewMoreButton 