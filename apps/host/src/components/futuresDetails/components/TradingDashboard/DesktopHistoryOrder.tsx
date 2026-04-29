import { getPerpUserHistoryTrades } from '@/api/hyperliquid'
import { xHistoryTrade } from '@/components/futuresDetails/trade/types'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { ServiceConfig } from '@/lib/gql/service-config'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { DataTable } from '../DataTable'
import DesktopHistoryOrderColumns from './hooks/TableColumns/DesktopHistoryOrderColumns'
import useFilterHistoryOrder from './hooks/useFilterHistoryOrder'
import { memo, useState } from 'react'
import { isEqual } from 'lodash-es'
import DesktopShare from '@/components/futuresDetails/desktopShare'

const DesktopHistoryOrder = ({ baseCoin }: { baseCoin: string }) => {
  const isLogin = useCheckLoginOnArb()
  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress
  const [openShare, setOpenShare] = useState(false)
  const [info, setInfo] = useState<xHistoryTrade | null>(null)
  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['history_orders', userAddress],
    queryFn: () => getPerpUserHistoryTrades(userAddress!),
    enabled: useCheckLoginOnArb(),
    select: (rawOrders) => {
      return rawOrders.map((item: any) => {
        if (item.dir === 'Long > Short') item.dir = 'Open Short'
        if (item.dir === 'Short > Long') item.dir = 'Open Long'
        item.orderValue = (parseFloat(item.px) * parseFloat(item.sz)).toFixed(2)
        return item
      })/* .filter((item: any) => {
        return ['Close Long', 'Close Short', 'Open Long', 'Open Short'].indexOf(item.dir) > -1
      }) */
    },
  })

  const { filterOrders } = useFilterHistoryOrder({
    baseCoin,
    orders: histories,
  })

  const { sortedData, useTableColumns } = DesktopHistoryOrderColumns({
    orderInfo: filterOrders,
    setOpenShare,
    setInfo,

  })

  return (
    <div className="h-full flex flex-col">
      <DataTable<xHistoryTrade, any>
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
      {info && <DesktopShare open={openShare} onClose={setOpenShare} info={info}  shareType="orderHistory"/>}
    </div>
  )
}

export default memo(DesktopHistoryOrder, (prevProps, nextProps) => isEqual(prevProps.baseCoin, nextProps.baseCoin))
