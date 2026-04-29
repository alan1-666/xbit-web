import { cn } from '@/lib/utils'
import React from 'react'

// Interface cho TradeInfoField
interface TradeInfoFieldProps {
  label: string
  value: string
  percent?: string
  valueColor?: string
}

const TradeInfoField: React.FC<TradeInfoFieldProps> = ({ label, value, percent, valueColor }) => {
  const getTextColor = (): string => {
    if (percent?.includes('-')) {
      return 'text-[#AB57FF]'
    }
    return 'text-[#00FFB4]'
  }

  return (
    <div className="flex flex-col">
      <div className="text-[#FFFFFFB2] text-[calc(1rem*(11/16))] leading-[12px] mb-1">{label}</div>
      <div className={cn(`text-[calc(1rem*(14/16))] font-[500] leading-none`, valueColor)}>
        {value} <span className={cn(getTextColor())}>{percent}</span>
      </div>
    </div>
  )
}

// Interface cho TradeDetailsGrid
interface TradeDetailsGridProps {
  label: string
  value: string
  percent?: string
  valueColor?: string
}

const tradeData: TradeDetailsGridProps[] = [
  {
    label: '买入时间',
    value: '03/18 12:12',
  },
  {
    label: '买入价格',
    value: '83,881.12',
  },
  {
    label: '累计收益',
    value: '273663.11%',
    valueColor: 'text-[#00FFB4]',
  },
  {
    label: '历史胜率',
    value: '33.98%',
  },
  {
    label: '建议止盈',
    value: '83881.12',
    percent: '(5%)',
  },
  {
    label: '建议止损',
    value: '83881.12',
    percent: '(-4%)',
  },
]

const TradeDetailsGrid = ({ className }: { className?: string }) => {
  return (
    <div className={`text-white ${className}`}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tradeData.map((item, index) => (
          <TradeInfoField
            label={item.label}
            value={item.value}
            key={index}
            percent={item?.percent}
            valueColor={item?.valueColor}
          />
        ))}
      </div>
    </div>
  )
}

export default TradeDetailsGrid
