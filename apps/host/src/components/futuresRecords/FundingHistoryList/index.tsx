import Container from '@components/common/Container.tsx'
import { useState, useMemo, useEffect } from 'react'
import FundingHistoryCard from './FundingHistoryCard.tsx'
import { IconEmpty } from '@/components/icon'
import { Skeleton } from '@components/ui/skeleton'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useTranslation } from 'react-i18next'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { getPerpUserFunding } from '@/api/hyperliquid'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { xOpenOrders, OrderType, OrderSide, All } from '@/components/futuresDetails/trade/types.ts'
import FundingHistoryFilter from './FundingHistoryFilter.tsx'
import { ISymbolList } from '@/redux/modules/symbolList.slide'


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

const FundingHistoryList = ({symbolList = []}: FundingHistoryProps) => {
  const { t } = useTranslation()
  const isLogin =  useCheckLoginOnArb()

  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress

  const [filter, setFilter] = useState<OrdersListFilter>({
    side: 'All',
    coin: 'All'
  })

  // const userAddress = '0xF55dB5DbFee200d023e8C9108233aEdB6E4a5d69'
  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['funding_history', userAddress],
    queryFn: () => getPerpUserFunding(userAddress!),
    enabled: useCheckLoginOnArb(),
    select: (rawOrders) => {
      return rawOrders
    },
  })

  const orders = histories.map((item: any) => {
    return {
      time: item.time,
      hash: item.hash,
      delta_side: item?.delta?.szi < 0 ? 'Short' : 'Long',
      ...Object.fromEntries(Object.entries(item.delta).map(([k, v]) => [`delta_${k}`, v])),
    }
  })

  const filterOrders = useMemo(() => {
    if (filter.side === 'All' && filter.coin === 'All') {
      return orders
    }
    return orders.filter((item: any) => {
      return (item.delta_side === filter.side || filter.side === 'All') &&  (item.delta_coin === filter.coin || filter.coin === 'All')
      
    })
  }, [filter, orders])





  return (
    <Container className="mt-[10px]">
      {
        symbolList?.length ? <FundingHistoryFilter 
          filter={filter}
          symbolList={symbolList}
          setFilter={setFilter} 
        /> : <></>
      }
      

      {(!isLogin || (!isLoading && !filterOrders.length)) && (
        <div className="flex flex-col items-center justify-center h-80">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
        </div>
      )}
      {isLogin && isLoading  && <ListCardSkeleton />}

      <div className="flex flex-col gap-3 pb-[200px]">
        {filterOrders.map((item: any, idx: any) => (
          <FundingHistoryCard key={idx} orderInfo={item} />
        ))}
      </div>
    </Container>
  )
}

export default FundingHistoryList
