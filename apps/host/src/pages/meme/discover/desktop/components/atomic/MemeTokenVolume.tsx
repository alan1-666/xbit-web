import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useAppSelector } from '@/redux/store'
import { MemeTokenInfoRaw } from '@/types/tokenInfo.ts'
import { formatVolume } from '@/lib/format.ts'
import { selectFromMemeToken } from '@/redux/modules/memeTokenInfo.slice.ts'

export interface MemeTokenVolumeProps {
  chainId: number
  tokenAddress: string
  volume: number
  timeframe: TimeframeOption
}

export const MemeTokenVolume = (props: MemeTokenVolumeProps) => {
  const { volume, timeframe, chainId, tokenAddress } = props

  const { t } = useTranslation()

  const selectKey = useMemo(() => {
    return `vl${timeframe}` as keyof MemeTokenInfoRaw
  }, [timeframe])

  const realtimeVL = useAppSelector(selectFromMemeToken(chainId, tokenAddress, selectKey))

  const displayVL = useMemo(() => {
    if (!realtimeVL) return volume
    return +realtimeVL
  }, [realtimeVL, volume])

  return (
    <SimpleTooltip content={t('listCoin.toasts.volume', { time: timeframe })}>
      <div className="flex items-baseline justify-end">
        <div className="text-right leading-3 pb-2">
          <span className="text-[calc(12rem/16)] text-[#FFFFFF80]">VL</span>{' '}
        </div>
        <div className="text-[calc(14rem/16)] leading-3.5 pb-2 pl-1.5">
          {formatVolume(displayVL, {
            showCurrency: true,
          })}
        </div>
      </div>
    </SimpleTooltip>
  )
}
