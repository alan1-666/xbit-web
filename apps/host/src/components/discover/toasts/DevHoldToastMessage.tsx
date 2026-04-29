import { BaseToastMessage, ToastProps } from '@components/discover/toasts/BaseToastMessage.tsx'
import { Trans } from 'react-i18next'
import { useMemo } from 'react'
import { fShortenNumber } from '@/lib/number.ts'
import { useIsDebug } from '@components/discover/hooks/useIsDebug.ts'

export type DevHoldToastMessageProps = ToastProps & {
  devBalance?: number
  totalSupply?: number
  devPercent?: number
}

export const DevHoldToastMessage = (props: DevHoldToastMessageProps) => {
  const { devBalance, totalSupply, devPercent } = props

  const isDebug = useIsDebug()

  const amount = useMemo(() => {
    if (devBalance !== undefined) return devBalance ?? 0
    // if (totalSupply && devPercent !== undefined) {
    //   return totalSupply * (devPercent / 100)
    // }
    return undefined
  }, [devBalance, totalSupply, devPercent])

  return (
    <BaseToastMessage {...props}>
      <div>
        <Trans
          i18nKey={isDebug ? 'listCoin.tooltip.devHoldStatistic' : 'listCoin.tooltip.devHold'}
          values={{
            amount: amount !== undefined ? fShortenNumber(amount) : '--',
            totalSupply: totalSupply !== undefined ? fShortenNumber(totalSupply) : '--',
          }}
          components={{
            b: <b className="text-[#00ffb4] font-light" />,
          }}
        />
      </div>
    </BaseToastMessage>
  )
}
