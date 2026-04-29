import { formatAmount, formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useContext } from 'react'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'

export interface BaseTokenBalanceCellProps {
  totalBaseAmount: number
  totalUsdValue: number | string
  excluded?: boolean
}

export const BaseTokenBalanceCell = (props: BaseTokenBalanceCellProps) => {
  const { totalBaseAmount, totalUsdValue, excluded = false } = props
  const { hideBalance } = useContext(AssetOverviewContext)
  const { isDesktop } = useResponsive()
  return (
    <div className={cn('flex flex-col', isDesktop ? 'items-start' : 'items-end')}>
      <div className={cn('text-white text-[calc(14rem/16)] font-[380]', excluded && isDesktop ? 'line-through decoration-2' : '')}>
        {!hideBalance
          ? formatAmount(totalBaseAmount, {
              roundMode: 'floor',
            })
          : '******'}
      </div>
      <div
        className={cn(
          'text-[#6C6A74] text-[calc(12rem/16)] font-[330] decoration-[#6C6A74]',
          excluded && isDesktop ? 'line-through decoration-1' : '',
        )}
      >
        {!hideBalance ? (
          <>
            {!isDesktop && totalUsdValue != 0 && '≈'}
            {formatBalance(totalUsdValue, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </>
        ) : (
          '******'
        )}
      </div>
    </div>
  )
}
