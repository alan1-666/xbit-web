import { Trans } from 'react-i18next'
import { BaseToastMessage, ToastProps } from './BaseToastMessage.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { useMemo } from 'react'
import { useIsDebug } from '@components/discover/hooks/useIsDebug.ts'

export interface SniperToastMessageProps extends ToastProps {
  sniperAmount: number | undefined
  totalSupply: number | undefined
  sniperCount: number | undefined
  numberOfHolders: number | undefined
  sniperPercent?: number
}

export const SniperToastMessage = (props: SniperToastMessageProps) => {
  const { totalSupply, sniperCount, numberOfHolders, sniperAmount, sniperPercent, ...rest } = props

  const isDebug = useIsDebug()

  const amount = useMemo(() => {
    if (sniperAmount !== undefined) return sniperAmount
    // if (totalSupply && sniperPercent) {
    //   return totalSupply * sniperPercent
    // }
    return undefined
  }, [sniperAmount, totalSupply, sniperCount, numberOfHolders])
  return (
    <BaseToastMessage {...rest}>
      <Trans
        i18nKey={isDebug ? 'listCoin.tooltip.snipersStatistic' : 'listCoin.tooltip.snipers'}
        values={{
          sniperAmount: amount !== undefined ? fShortenNumber(amount) : '--',
          totalSupply: totalSupply ? fShortenNumber(totalSupply) : '--',
          snipers: sniperCount !== undefined ? fShortenNumber(sniperCount) : '0',
          numberOfHolder: numberOfHolders ? fShortenNumber(numberOfHolders) : '0',
        }}
        components={{
          b: <b className="text-[#00ffb4] font-medium" />,
        }}
      />
    </BaseToastMessage>
  )
}

export default SniperToastMessage
