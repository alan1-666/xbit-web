import { cn } from '@/lib/utils'
import React from 'react'
import '../cryptoTransactionHistory/style.css'

interface CardWithGreyProps {
  onCardClick?: () => void
  header?: React.ReactNode
  content?: React.ReactNode
  className?: string
  classNameHeader?: string
  isHoverScaleCard?: boolean
}

const CardWithGrey = ({
  content,
  header,
  onCardClick,
  className,
  classNameHeader,
  isHoverScaleCard = true,
}: CardWithGreyProps) => {
  return (
    <div
      onClick={onCardClick}
      className={cn(
        'relative overflow-hidden rounded-[6px] cursor-pointer border-[0.5px] border-[#343339] bg-[#18181D]',
        isHoverScaleCard && 'hover-scale-card',
        className,
      )}
    >
      {/* background gradient */}
      <div
        className={cn(
          'absolute inset-0 size-full rounded-[8px]  ',
          // bgColor === 'green' ? 'background-positive-linear-gradient' : 'background-negative-linear-gradient',
        )}
      />
      <div className="absolute inset-0 bg-cover bg-no-repeat size-full " />
      <div className="layout-3" />
      <div
        className={cn(
          'p-[12px] relative  rounded-t-[10px] bg-[#1D1D22]',
          classNameHeader,
          // bgColor === 'green' ? 'FundingHistoryItem-negative-background' : 'FundingHistoryItem-positive-background',
        )}
      >
        {header}
      </div>

      <div className="relative z-1">{content}</div>
    </div>
  )
}

export default CardWithGrey
