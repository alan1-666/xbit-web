import { Trans } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'
import { useMemo } from 'react'
import { fShortenNumber } from '@/lib/number.ts'
import { useIsDebug } from '@components/discover/hooks/useIsDebug.ts'

export interface SameSourceWalletToastMessageProps extends ToastProps {
  bundlersAmount?: number
  totalSupply?: number
  bundlersPercent?: number
  bundlers?: number
  totalHolders?: number
}

export const SameSourceWalletToastMessage = (props: SameSourceWalletToastMessageProps) => {
  const { bundlersAmount, totalSupply, bundlersPercent, bundlers, totalHolders } = props
  const isDebug = useIsDebug()
  const amount = useMemo(() => {
    if (bundlersAmount !== undefined) return bundlersAmount
    // if (totalSupply && bundlersPercent !== undefined) {
    //   return totalSupply * (bundlersPercent / 100)
    // }
  }, [bundlersAmount, totalSupply, bundlersPercent])
  return (
    <BaseToastMessage {...props}>
      <Trans
        i18nKey={isDebug ? 'listCoin.tooltip.bundlersStatistic' : 'listCoin.tooltip.bundlers'}
        values={{
          amount: amount !== undefined ? fShortenNumber(+amount) : '--',
          totalSupply: totalSupply !== undefined ? fShortenNumber(+totalSupply) : '--',
          bundlers: bundlers !== undefined ? fShortenNumber(+bundlers) : '0',
          holders: totalHolders !== undefined ? fShortenNumber(+totalHolders) : '0',
        }}
        components={{
          b: <b className="text-[#00ffb4] font-medium" />,
        }}
      />
    </BaseToastMessage>
  )
}

export default SameSourceWalletToastMessage
