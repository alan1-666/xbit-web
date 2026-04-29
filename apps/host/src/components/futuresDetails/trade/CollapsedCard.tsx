import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface CollapsedCardWithGradientProps {
  children: ReactNode
  isPositive: boolean
  className?: string
  onClickExpand?: () => void
}
interface CollapsedCardWrapPros {
  children: ReactNode
  className?: string
  onClickExpand?: () => void
}

const CollapsedCardWithGradient = ({ 
  children,
  isPositive,
  className,
  onClickExpand
 }: CollapsedCardWithGradientProps) => {
  return (
    <div className={cn(
        "flex items-center py-2.5 px-3 relative overflow-hidden rounded-[8px] cursor-pointer", 
        isPositive && 'gradient-border-positive background-positive-linear-gradient',
        !isPositive && 'gradient-border-negative background-negative-linear-gradient',
        className
      )}>
      <div className="grid grid-cols-3 gap-1 flex-1">
        {children}
      </div>
      <img 
        className="ml-2 cursor-pointer" 
        src="/images/futuresDetail/card-arrow-down2.svg"
        alt="card-arrow-down"
        onClick={() => { onClickExpand && onClickExpand()}}
      />
    </div>
  )
}

const CollapsedCardWrap = ({ 
  children,
  className,
  onClickExpand
 }: CollapsedCardWrapPros) => {
  return (
    <div className={cn(
        "flex items-center py-2.5 px-3 relative overflow-hidden rounded-[8px] cursor-pointer bg-[#18181D] border-[#2B2B33] border", 
        className
      )}>
      <div className="flex justify-between items-center gap-1 flex-1">
        {children}
      </div>
      <img 
        className="ml-2 cursor-pointer" 
        src="/images/futuresDetail/card-arrow-down2.svg"
        alt="card-arrow-down"
        onClick={() => { onClickExpand && onClickExpand()}}
      />
    </div>
  )
}

interface CoinItemProps {
  coin: string
  leverage?: number
}

interface BaseItemProps {
  label: string
  value: string | ReactNode
}

interface PnlItemProps {
  pnl: string
  roe: string
}

const CollapsedCoinItem = ({ coin, leverage }: CoinItemProps) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col">
      <p className="text-[calc(11rem/16)] leading-[calc(12rem/16)] text-[#908E98] mb-1.5">{t('tokenSearchDrawer.tableHeaders.token')}</p>
      <p className="flex items-center">
        <span className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] font-bold mr-0.5">{coin}</span>
        {leverage && <span className="purplefont text-[calc(10rem/16)] leading-[calc(10rem/16)]">{`${leverage}x`}</span>}
      </p>
    </div>
  )
}

const CollapsedBaseItem = ({ label, value }: BaseItemProps) => {
  return (
    <div className="flex flex-col">
      <p className="text-[calc(11rem/16)] leading-[calc(12rem/16)] text-[#908E98] mb-1.5">{label}</p>
      <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] font-bold">{value}</p>
    </div>
  )
}

const CollapsedPnlItem = ({ pnl, roe}: PnlItemProps) => {
  const { t } = useTranslation()
  const unrealizedPnlText =
    parseFloat(pnl) >= 0 ? `+${pnl}` : pnl
  return (
    <div className="flex flex-col text-right">
      <p className="text-[calc(11rem/16)] leading-[calc(12rem/16)] text-[#908E98] mb-1.5">{t('position.pnl')} (USD)</p>
      <p className={cn("flex items-center justify-end", 
        parseFloat(pnl) >= 0 ? 'text-rise' : 'text-fall',
      )}>
        <span className="text-[calc(13rem/16)] leading-[calc(14rem/16)] font-bold mr-0.5">{unrealizedPnlText}</span>
        <span className="text-[calc(12rem/16)] leading-[calc(14rem/16)]">{'(' + roe + ')'}</span>
      </p>
    </div>
  )
}

export {
  CollapsedCardWrap,
  CollapsedCardWithGradient,
  CollapsedCoinItem,
  CollapsedBaseItem,
  CollapsedPnlItem
}
