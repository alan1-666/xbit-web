import MyPositionCard, { MyPositionCardRef } from '@/components/futuresDetails/trade/MyPositionList/MyPositionCard'
import { IconEmpty } from '@components/icon'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { EnhancedOverviewData, EnhancedPosition } from './Futures'
import { ItemPositionSkeleton } from './ItemPosition'
import PositionsOverview from './PositionsOverview'

interface IPTabPositions {
  loading: boolean
  enhancedOverviewData: EnhancedOverviewData
  enhancedPositions: EnhancedPosition[]
}

const TabPositions = ({ enhancedOverviewData, enhancedPositions, loading }: IPTabPositions) => {
  const { t } = useTranslation()
  const cardRefs = useRef<Record<string, MyPositionCardRef | null>>({})
  return (
    <>
      <div className="rounded-t-[10px] relative bg-cover bg-center bg-no-repeat mt-[12px]">
        {enhancedPositions.length > 0 && (
          <div className="bg-[#ECECED0A] rounded-[10px] px-[12px] pt-[20px] pb-[8px]">
            <PositionsOverview data={enhancedOverviewData} isLoading={loading} />
          </div>
        )}
      </div>
      <div className="pt-4 flex flex-col gap-2 pb-[30px]">
        {loading ? (
          <>
            <ItemPositionSkeleton />
            <ItemPositionSkeleton />
            <ItemPositionSkeleton />
          </>
        ) : enhancedPositions.length > 0 ? (
          enhancedPositions.map((item: EnhancedPosition) => (
            // Shares a component with contract positions for easy maintenance
            <MyPositionCard
              ref={(el) => {
                cardRefs.current[item.symbol] = el
              }}
              positionInfo={item.positionInfo}
              globalIsAllExpand={localStorage.getItem('futures_my_position_expand_state') === 'true' ? true : false}
              key={item.symbol}
            />
            // <ItemPosition key={index} item={item} szMap={szMap} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
          </div>
        )}
      </div>
    </>
  )
}

export default TabPositions
