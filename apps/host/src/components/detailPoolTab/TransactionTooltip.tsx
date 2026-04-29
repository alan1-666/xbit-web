import { FC, useState } from 'react'
import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/redux/store'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { PoolTransactionType } from '@/types/enums.ts'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'

interface TransactionTooltipProps {
  children: React.ReactNode
  data: {
    value: number
    change: number
    type: string
  }
}

export const TransactionTooltip: FC<TransactionTooltipProps> = React.memo(({ children, data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const { dataUnit } = useAppSelector((state) => state.userSettings as UserSettingsState)
  const type = data.type

  const getTotalValueTextColor = (type: string) => {
    if (type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity) return 'text-fall'
    return 'text-rise'
  }

  const getTotalValueBgColor = (type: string) => {
    if (type === PoolTransactionType.Remove || type === PoolTransactionType.RemoveLiquidity) return 'bg-fall'
    return 'bg-rise'
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <TooltipPrimitive.Trigger asChild onClick={() => setIsOpen(!isOpen)}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="bg-[#1C1D20] rounded-lg p-3 z-50 shadow-lg" sideOffset={5}>
            <div className="flex flex-col gap-2 min-w-[158px]">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs inline-flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${getTotalValueBgColor(type)}`}></span>
                  {type === PoolTransactionType.Remove
                    ? t('history.singleSidedRemovePool')
                    : t('history.singleSidedAddPool')}
                </span>
                <span className={`text-xs pl-1 ${getTotalValueTextColor(type)}`}>
                  {type === PoolTransactionType.Remove ? '-' : '+'}
                  {dataUnit === 'USD' ? (
                    <MoneyFormatted value={data.value} roundType="floor" />
                  ) : (
                    <MoneyFormatted value={data.value} unit={dataUnit} roundType="floor" />
                  )}
                </span>
              </div>
            </div>
            <TooltipPrimitive.Arrow className="fill-[#1C1D20]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
})

TransactionTooltip.displayName = 'TransactionTooltip'
