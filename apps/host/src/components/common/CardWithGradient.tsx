import { cn } from '@/lib/utils'
import React from 'react'
import '../cryptoTransactionHistory/style.css'

interface CardWithGradientProps {
  bgColor?: 'green' | 'purple'
  onCardClick?: () => void
  header?: React.ReactNode
  content?: React.ReactNode
  className?: string
  classNameHeader?: string
  isHoverScaleCard?: boolean
}

const CardWithGradient = ({
  bgColor = 'green',
  content,
  header,
  onCardClick,
  className,
  classNameHeader,
  isHoverScaleCard = true,
}: CardWithGradientProps) => {
  return (
    <div
      onClick={onCardClick}
      className={cn(
        'relative overflow-hidden rounded-[8px] cursor-pointer',
        isHoverScaleCard && 'hover-scale-card',
        bgColor === 'green' && 'gradient-border-positive',
        bgColor !== 'green' && 'gradient-border-negative',
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
          'p-[12px] relative  rounded-t-[10px] bg-gradient-to-r from-[#3D3C781F] to-[#878B9905]',
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

export default CardWithGradient
