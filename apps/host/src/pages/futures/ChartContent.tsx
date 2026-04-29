import { cn } from '@/lib/utils'
import { UITab } from '@/types/uiTabs'
import { memo, useMemo } from 'react'

// Import trực tiếp thay vì lazy loading
import TradePage from '@components/futuresDetails/trade/index'
import TrendPage from '@components/futuresDetails/trend/index'

const ChartContentOptimal = memo(
  ({
    type,
    baseCoin,
    onNavigateToTrade,
    typeList,
  }: {
    type: string
    baseCoin: string
    onNavigateToTrade: () => void
    typeList: UITab[]
  }) => {
    const tradePageComponent = useMemo(() => <TradePage baseCoin={baseCoin} />, [baseCoin])

    const trendPageComponent = useMemo(
      () => <TrendPage baseCoin={baseCoin} onNavigateToTrade={onNavigateToTrade} />,
      [baseCoin, onNavigateToTrade],
    )

    return (
      <>
        <div
          className={cn(typeList[1].value === type ? 'block' : 'hidden')}
        >
          {tradePageComponent}
        </div>

        <div
          className={cn(typeList[0].value === type ? 'block' : 'hidden')}
        >
          {trendPageComponent}
        </div>
      </>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.baseCoin === nextProps.baseCoin
  },
)

ChartContentOptimal.displayName = 'ChartContentOptimal'

export default ChartContentOptimal
