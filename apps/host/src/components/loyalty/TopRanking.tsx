import { useMemo } from 'react'
import { cn } from '@/lib/utils.ts'
import { LoyaltyStatusResp } from '@/@generated/gql/graphql-loyalty'
import { fShortenNumber } from '@/lib/number'
import { formatLeaderboardName } from '@/hooks/useLoyalty'
import { useTranslation } from 'react-i18next'
import { formatPercent } from '@/lib/format'
import MoneyFormatted from '../common/MoneyFormatted'

export interface TopRankingProps {
  top: 'top1' | 'top2' | 'top3'
  isEnded?: boolean
  data?: LoyaltyStatusResp
}

const TopRanking = (props: TopRankingProps) => {
  const { top, data, isEnded } = props
  const { t } = useTranslation()

  const variant = useMemo(() => {
    switch (top) {
      case 'top1':
        return {
          topLabel: 'TOP 1',
          svgGradientFrom: '#FDA92F',
          svgGradientTo: '#FDD62A',
          decoratorBg: 'bg-[linear-gradient(90deg,#FDA92F_8.46%,#FDD62A_67.25%)]',
          icon: '/images/loyalty/top1.png',
          topTextClassName: 'text-[#693A00]',
          containerClassName: 'bg-[linear-gradient(180deg,#FFD10299_3.214%,#FF9A3514_103.21%)]',
        }
      case 'top2':
        return {
          topLabel: 'TOP 2',
          svgGradientFrom: '#0075CA',
          svgGradientTo: '#2AA4FD',
          decoratorBg: 'bg-[linear-gradient(90deg,#004D85_8.46%,#2AA4FD_67.25%)]',
          icon: '/images/loyalty/top2.png',
          topTextClassName: 'text-[#002057]',
          containerClassName: 'bg-[linear-gradient(180deg,#2AA4FD99_3.214%,#2AA4FD1A_103.21%)]',
        }
      case 'top3':
        return {
          topLabel: 'TOP 3',
          svgGradientFrom: '#A42AFF',
          svgGradientTo: '#C377FC',
          decoratorBg: 'bg-[linear-gradient(90deg,#4E0081_8.46%,#CF72FF_67.25%)]',
          icon: '/images/loyalty/top3.png',
          topTextClassName: 'text-[#39004F]',
          containerClassName: 'bg-[linear-gradient(180deg,#C377FC_3.214%,#C377FC1A_103.21%)]',
        }
      default:
        return {}
    }
  }, [top])

  const { topLabel, svgGradientFrom, svgGradientTo, decoratorBg, icon, topTextClassName, containerClassName } = variant

  return (
    <div className={cn('relative p-[1px] rounded-[6px]', containerClassName)}>
      <div className="bg-[#0A0A0A] size-full rounded-[6px]">
        <div className="absolute left-5 -top-4 z-[-1]">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="98" height="21" viewBox="0 0 98 21" fill="none">
              <path
                d="M0 6C0 2.68629 2.68629 0 6 0H84.1376C85.9481 0 87.6618 0.817573 88.801 2.22481L96.0867 11.2248C99.2624 15.1477 96.4705 21 91.4233 21H6C2.68629 21 0 18.3137 0 15V6Z"
                fill={`url(#top-ranking-gradient-${top})`}
              />
              <defs>
                <linearGradient
                  id={`top-ranking-gradient-${top}`}
                  x1="0"
                  y1="10.5"
                  x2="87"
                  y2="10.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor={svgGradientFrom} />
                  <stop offset="0.575" stopColor={svgGradientTo} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 top-0.5 h-4 text-[12px] text-center italic font-[630] leading-[1] align-middle flex items-center justify-center">
              <div className={topTextClassName}>{topLabel}</div>
            </div>
          </div>
        </div>
        <img src={icon} alt={topLabel} className="size-[30px] absolute -top-5 left-0" />
        <div className={cn('h-5 w-4/5 absolute -top-2 left-5 z-[-2] rounded-[6px]', decoratorBg)}></div>
        <div className="">
          <div className="box-border flex flex-col gap-[24px] items-start p-[20px] rounded-[8px]">
            <p className="font-semibold text-[20px] text-[#FBFBFB] w-full">
              {data?.name ? formatLeaderboardName(data.name) : '--'}
            </p>
            <div className="flex items-center justify-between w-full">
              <p className="text-[14px] text-[#908E9A]">{t('loyalty.pointsThisSeason')}</p>
              <p className="text-[18px] text-[#FBFBFB] text-right">
                {data?.totalPoint ? <MoneyFormatted value={data?.totalPoint} unit="" /> : '--'}
              </p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-[14px] text-[#908E9A]">{t('loyalty.pointsBonus')}</p>
              <p className="text-[18px] text-[#FBFBFB] text-right">
                {isEnded ? formatPercent(data?.pointPercent) : data?.boost ? `${data.boost?.toFixed(1)}X` : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopRanking
