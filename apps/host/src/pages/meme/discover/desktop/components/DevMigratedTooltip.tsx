import { useTranslation } from 'react-i18next'
import { fShortenNumber } from '@/lib/number.ts'
import { formatPercentage } from '@/utils/helpers.ts'
import { useMemo } from 'react'

export interface DevMigratedTooltip {
  devMigratedCount?: number
  devLaunched?: number
}

export const DevMigratedTooltip = (props: DevMigratedTooltip) => {
  const { devMigratedCount, devLaunched } = props
  const { t } = useTranslation()

  const devLaunchedCount = useMemo(() => {
    if (devLaunched) return devLaunched
    return (devMigratedCount ?? 0) + 1
  }, [devLaunched, devMigratedCount])

  const devMigratedRatio = useMemo(() => {
    const migrated = devMigratedCount && devMigratedCount > 0 ? devMigratedCount : 0
    return (migrated / (devLaunchedCount ?? 1)) * 100
  }, [devLaunchedCount, devMigratedCount])

  return (
    <div className="w-[200px] py-1 space-y-1.5 text-[calc(12rem/16)] font-[330]">
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devMigratedCount')}</div>
        <div>{fShortenNumber(devMigratedCount ?? 0)}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devMigratedRatio')}</div>
        <div>{formatPercentage(devMigratedRatio)}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devLaunched')}</div>
        <div>{fShortenNumber(devLaunchedCount)}</div>
      </div>
    </div>
  )
}
