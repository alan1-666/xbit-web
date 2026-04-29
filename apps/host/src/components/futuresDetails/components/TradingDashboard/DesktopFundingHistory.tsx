import { getPerpUserFunding } from '@/api/hyperliquid'
import { xFundingHistory } from '@/components/futuresDetails/trade/types'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { ServiceConfig } from '@/lib/gql/service-config'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { DataTable } from '../DataTable'
import DesktopFundingHistoryColumns from './hooks/TableColumns/DesktopFundingHistoryColumns'
import useFilterFundingHistory from './hooks/useFilterFundingHistory'
import { memo } from 'react'
import { isEqual } from 'lodash-es'


const DesktopFundingHistory = ({ baseCoin }: { baseCoin: string }) => {
  const isLogin = useCheckLoginOnArb()
  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress
  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['funding_history', userAddress],
    queryFn: () => getPerpUserFunding(userAddress!),
    enabled: isLogin,
    select: (rawOrders) => {
      return rawOrders
    },
  })

  const filterOrders = histories.map((item: any) => {
    return {
      time: item.time,
      hash: item.hash,
      delta_side: item?.delta?.szi < 0 ? 'Short' : 'Long',
      ...Object.fromEntries(Object.entries(item.delta).map(([k, v]) => [`delta_${k}`, v])),
    }
  })

  const { filterOrders: fundingHistorys } = useFilterFundingHistory({
    baseCoin,
    orders: filterOrders,
  })


  const { sortedData, useTableColumns } = DesktopFundingHistoryColumns({
    orderInfo: fundingHistorys,
  })

  return (
    <div className="h-full flex flex-col">
      <DataTable<xFundingHistory, any>
        columns={useTableColumns()}
        data={sortedData}
        isStickyHeader={true}
        isLoading={isLoading}
        // isStickyLastColumn={true}
        minTableWidth="1100px"
        stickyBg="#0A0A0A"
        containerClassName="!border-none"
        tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
        tableHeaderRowClassName="!border-none max-w-last-col"
        tableCellClassName="!border-none"
        tableBodyRowClassName="border-b-0 h-[48px] highlight-even-column"
        isShowLoginRequire={!isLogin}
      />
    </div>
  )
}

export default memo(DesktopFundingHistory, (prevProps, nextProps) => isEqual(prevProps.baseCoin, nextProps.baseCoin))
