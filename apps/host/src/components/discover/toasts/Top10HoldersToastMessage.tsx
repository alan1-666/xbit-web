import { Trans } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { useMemo } from 'react'
import { useIsDebug } from '@components/discover/hooks/useIsDebug.ts'

export interface Top10HoldersToastMessageProps extends ToastProps {
  top10Percent: number | undefined
  top10Amount?: number | undefined
  totalSupply?: number | undefined
}
export const Top10HoldersToastMessage = (props: Top10HoldersToastMessageProps) => {
  const { top10Percent, top10Amount, totalSupply, ...rest } = props
  const isDebug = useIsDebug()

  const top10Balance = useMemo(() => {
    console.log('top10Balance', top10Amount)
    if (top10Amount !== undefined) return top10Amount
  }, [top10Amount, totalSupply, top10Percent])
  return (
    <BaseToastMessage {...rest}>
      <div>
        <Trans
          i18nKey={isDebug ? 'listCoin.tooltip.top10HolderStatistic' : 'listCoin.tooltip.top10Holder'}
          values={{
            amount: top10Balance !== undefined ? fShortenNumber(top10Balance) : '--',
            totalSupply: totalSupply !== undefined ? fShortenNumber(totalSupply) : '--',
          }}
          components={{
            b: <b className="text-[#00ffb4] font-medium" />,
          }}
        />
      </div>
    </BaseToastMessage>
  )
}

export default Top10HoldersToastMessage
