import React, { useRef, useEffect, useState } from 'react'
import XStockCard, { XStockCardProps } from '../xstocks/XStockCard'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { XStockToken } from '@/types/xstocks'
export interface XStockWatchlistCardProps extends XStockCardProps {
  onItemRemoved?: (token: XStockToken) => void
}

const XStockWatchlistCard: React.FC<XStockWatchlistCardProps> = ({ onItemRemoved, ...cardProps }) => {
  const [disabled, setDisabled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const token = cardProps.token

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ left: ref.current.scrollWidth, behavior: 'auto' })
    }
  }, [ref.current, token.address])
  const onRemoveItem = (token: XStockToken) => {
    onItemRemoved?.(token)
  }
  return (
    <div ref={ref} className="w-full overflow-hidden">
      <div className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth flex gap-1">
        <div className="w-full basis-full shrink-0 snap-center relative">
          <XStockCard {...cardProps} />
          {disabled && <div className="absolute inset-0 bg-[#141414B3]" />}
        </div>
        <div className="rounded-[6px] shrink-0 basis-15 ml-2 z-20 flex items-center snap-center justify-center bg-[#0A0A0A]">
          <div
            className="w-15 h-7 flex items-center justify-center text-white font-medium text-sm bg-red-500 rounded-2xl"
            onClick={() => onRemoveItem(token)}
          >
            {t('universal.detele')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default XStockWatchlistCard
