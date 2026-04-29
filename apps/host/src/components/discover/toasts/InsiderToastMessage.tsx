import { Trans } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { useMemo } from 'react'
import { useIsDebug } from '@components/discover/hooks/useIsDebug.ts'

export interface InsiderToastMessageProps extends ToastProps {
  insiderAmount?: number | undefined
  totalSupply?: number | undefined
  insiderPercent?: number | undefined
  insiderCount?: number | undefined
  holderCount?: number | undefined
}

export const InsiderToastMessage = (props: InsiderToastMessageProps) => {
  const { insiderAmount, totalSupply, insiderPercent, insiderCount, holderCount } = props
  const isDebug = useIsDebug()
  const amount = useMemo(() => {
    if (insiderAmount !== undefined) return insiderAmount
    // if (totalSupply && insiderPercent !== undefined) {
    //   return totalSupply * (insiderPercent / 100)
    // }
  }, [insiderAmount, totalSupply, insiderPercent, insiderCount, holderCount])
  return (
    <BaseToastMessage {...props}>
      <Trans
        i18nKey={isDebug ? 'listCoin.tooltip.insidersStatistic' : 'listCoin.tooltip.insiders'}
        values={{
          amount: amount !== undefined ? fShortenNumber(+amount) : '--',
          totalSupply: totalSupply !== undefined ? fShortenNumber(+totalSupply) : '--',
          holders: holderCount !== undefined ? fShortenNumber(+holderCount) : '0',
          insiderCount: insiderCount !== undefined ? fShortenNumber(+insiderCount) : '0',
        }}
        components={{
          b: <b className="text-[#00ffb4] font-medium" />,
        }}
      />
    </BaseToastMessage>
  )
}

export default InsiderToastMessage
