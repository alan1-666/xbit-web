import { PointCard } from '@components/loyalty/PointCard.tsx'
import { TotalPointCard } from '@components/loyalty/TotalPointCard.tsx'
import { IconCoins, IconCoins2, IconCoins3 } from '@components/icon/gradient/IconCoins.tsx'
import { IconPeople } from '@components/icon/gradient/IconPeople.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface PointsGroupProps {
  tradingPoints: number
  positionPoints: number
  referralPoints: number
  fundsPoints: number
  totalPoints: number
}

export const PointsGroup = (props: PointsGroupProps) => {
  const { t } = useTranslation()
  const { tradingPoints, positionPoints, referralPoints, fundsPoints, totalPoints } = props

  const { isDesktop } = useResponsive()

  return (
    <div className="grid grid-cols-2 px-3 gap-2 xl:grid-cols-3 xl:gap-4 xl:px-0 PointsGroup">
      {isDesktop && <TotalPointCard totalPoints={totalPoints} />}
      <div className="grid grid-cols-2 gap-2 col-span-2 xl:gap-4">
        <PointCard
          title={t('loyalty.tradingPoints')}
          points={tradingPoints}
          icon={<IconCoins className={cn('icon-size')} />}
          tooltipContent={t("loyalty.tooltip.tradingPoints")}
        />
        <PointCard
          title={t('loyalty.holdingPoints')}
          points={positionPoints}
          icon={<IconCoins2 className={cn('icon-size')} />}
          tooltipContent={t("loyalty.tooltip.holdingPoints")}
        />
        <PointCard
          title={t('loyalty.fundPoints')}
          points={fundsPoints}
          icon={<IconCoins3 className={cn('icon-size')} />}
          tooltipContent={t("loyalty.tooltip.fundPoints")}
        />
        <PointCard
          title={t('loyalty.referralPoints')}
          points={referralPoints}
          icon={<IconPeople className={cn('icon-size')} />}
          tooltipContent={t("loyalty.tooltip.referralPoints")}
        />
      </div>
    </div>
  )
}
