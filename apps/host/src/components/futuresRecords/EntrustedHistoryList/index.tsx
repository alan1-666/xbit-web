import Container from '@components/common/Container.tsx'
import { useState, useMemo, useEffect } from 'react'
import EntrustedHistoryCard from './EntrustedHistoryCard'
import { IconEmpty } from '@/components/icon'
import { Skeleton } from '@components/ui/skeleton'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useTranslation } from 'react-i18next'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { fixNumber } from '@/lib/utils'
import { userHistoricalOrders } from '@hooks/hyperliquid/userHistoricalOrders'
import { OrderType, OrderSide, All } from '@/components/futuresDetails/trade/types.ts'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import EntrustedHistoryFilter from './EntrustedHistoryFilter.tsx'



export type OrdersListFilter = {
  coin: string
  side: OrderSide | All
}


interface FundingHistoryProps {
  symbolList: ISymbolList[]
}

const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
)

const EntrustedHistoryList = ({ symbolList = [] }: FundingHistoryProps) => {
  const { t } = useTranslation()
  const isLogin =  useCheckLoginOnArb()

  const { orders, isLoading } = userHistoricalOrders()


  const [filter, setFilter] = useState<OrdersListFilter>({
      side: 'All',
      coin: 'All'
    })


  const reverseOrders = orders
    .slice()
    .reverse()
    .map((item: any) => {
      const coin = item?.order?.coin
      const filledSz = Number(item?.order?.origSz) - Number(item?.order?.sz)
      const assetType = coin.startsWith('@') ? 'Spot' : 'Perps'

      const order_quote_coin = 'USDC'

      const orderValue =
        item?.order?.orderType === 'Market'
          ? 'Market'
          : `${fixNumber(Number(item?.order?.origSz) * Number(item?.order?.limitPx), 2)} ${order_quote_coin}`
      
      return {
        assetType: assetType,
        status: item.status,
        statusTimestamp: item.statusTimestamp,
        order_filledSz: filledSz.toString(),
        order_orderValue: orderValue.toString(),
        ...Object.fromEntries(Object.entries(item.order).map(([k, v]) => [`order_${k}`, v])),
        order_coin: coin,

      }
    })

  const filterOrders = useMemo(() => {
    if (filter.side === 'All' && filter.coin === 'All') {
      return reverseOrders
    }
    return reverseOrders.filter((item: any) => {
      return (item.order_side === filter.side || filter.side === 'All') &&  (item.order_coin === filter.coin || filter.coin === 'All')
      
    })
  }, [filter, reverseOrders])

  const isLoaded = useMemo(() => {
    return isLoading
  }, [isLoading])
  




  return (
    <Container className="mt-[10px]">

      {
        symbolList?.length ? <EntrustedHistoryFilter 
          filter={filter}
          symbolList={symbolList}
          setFilter={setFilter} 
        /> : <></>
      }

      {(!isLogin || (!isLoaded && !filterOrders.length)) && (
        <div className="flex flex-col items-center justify-center h-80">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
        </div>
      )}
      {isLogin && isLoaded  && <ListCardSkeleton />}

      <div className="flex flex-col gap-3 pb-[200px]">
        {filterOrders.map((item: any, idx: any) => (
          <EntrustedHistoryCard key={idx} orderInfo={item} />
        ))}
      </div>
    </Container>
  )
}

export default EntrustedHistoryList
