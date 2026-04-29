import { IconArrowRight, IconFall, IconRise } from '@/components/icon'
import { APP_PATH } from '@/lib/constant'
import { formatPercent, formatVolume } from '@/lib/format'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useBreakingMarkets } from '@/modules/prediction/hooks/useBreakingMarkets.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export interface BreakingItemProps {
  market: MarketModel
  index: number
}

export const BreakingItem = (props: BreakingItemProps) => {
  const { market, index } = props
  const event = market.__typename === 'Market' ? market.events?.[0] : undefined
  const image = market.image || event?.image || ''
  const navigate = useNavigate()
  return (
    <div
      className="w-[164px] h-[126px] bg-[#FFFFFF0D] p-3 space-y-2 rounded-xl cursor-pointer"
      onClick={() => {
        navigate(NAVIGATIONS.prediction.eventDetails(event?.slug || ''))
      }}
    >
      <div className="flex items-center justify-between">
        <Avatar className="rounded-[8px] size-9">
          <AvatarImage src={image || undefined} className="object-cover" />
        </Avatar>
        <div className="text-right">
          <div className="text-[16px] leading-4.5">
            {market.outcomePrices?.[0] ? Math.round(market.outcomePrices[0] * 100) : '<1'}%
          </div>
          <div>
            {market.oneDayPriceChange >= 0 ? (
              <div className="flex items-center gap-0.5 text-[14px] text-rise">
                <IconRise />
                {formatPercent(Math.round(market.oneDayPriceChange * 100))}
              </div>
            ) : (
              <div className="flex items-center gap-0.5 text-[14px] text-fall">
                <IconFall />
                {formatPercent(Math.round(market.oneDayPriceChange * 100))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-[14px] font-medium leading-4 line-clamp-2">{market.question}</div>
      <div className="mt-2.5 text-[12px] leading-3 text-[#908E98]">
        {formatVolume(market.volume, {
          showCurrency: true,
          roundMode: 'floor',
        })}{' '}
        Vol.
      </div>
    </div>
  )
}

const PredictionDiscover = () => {
  const { data, isPending } = useBreakingMarkets()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="">
      <div
        className="px-3 text-[16px] text-white flex items-center justify-between cursor-pointer"
        onClick={() => {
          navigate(APP_PATH.MARKET + '/prediction')
        }}
      >
        {t('assets.prediction.prediction')}
        <IconArrowRight />
      </div>
      <div className="mt-3 px-3 max-w-full relative overflow-auto no-scrollbar w-fit h-full">
        <div className="relative w-fit h-full flex gap-2">
          {isPending ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="w-[164px] h-[126px] bg-white/5 p-3 space-y-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <Skeleton className="rounded-[8px] size-9" />
                  <div className="text-right flex flex-col items-end">
                    <Skeleton className="w-[50px] h-4" />
                    <Skeleton className="mt-1.5 w-[30px] h-3" />
                  </div>
                </div>
                <Skeleton className="w-[140px] h-8" />
                <Skeleton className="w-[50px] h-4" />
              </div>
            ))
          ) : (
            <>
              {data?.slice(0, 6).map((market, index) => (
                <BreakingItem key={market?.id} market={market} index={index} />
              ))}
              <div className="w-[164px] h-[126px] bg-white/5 p-3 space-y-2.5 rounded-xl flex items-center justify-center">
                <button
                  className="text-[14px] text-[#929292] border border-[#3C3C3C] rounded-[50px] px-[14px] py-[5px] active:scale-95"
                  onClick={() => {
                    navigate(APP_PATH.MARKET + '/prediction/breaking')
                  }}
                >
                  {t('prediction.exploreMore')} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictionDiscover
