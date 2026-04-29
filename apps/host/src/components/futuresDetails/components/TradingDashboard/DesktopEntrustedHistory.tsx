import { ServiceConfig } from '@/lib/gql/service-config'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { DataTable } from '../DataTable'
import DesktopEntrustedHistoryColumns from './hooks/TableColumns/DesktopEntrustedHistoryColumns'
import { xEntrustedHistory } from '@/components/futuresDetails/trade/types'
import useFilterEntrustedHistory from './hooks/useFilterEntrustedHistory'
import { userHistoricalOrders } from '@hooks/hyperliquid/userHistoricalOrders'
import { fixNumber } from '@/lib/utils'
import { memo, useEffect } from 'react'
import { isEqual } from 'lodash-es'
import { useState } from 'react'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'


const DesktopEntrustedHistory = ({ baseCoin }: { baseCoin: string }) => {
  const { orders: filterOrders, isLoading } = userHistoricalOrders()
  // const [isLoading, setIsLoading] = useState<boolean>(true)

  const isLogin = useCheckLoginOnArb()

  const reverseOrders = filterOrders
    .slice()
    .reverse()
    .map((item: any) => {
      const filledSz = Number(item?.order?.origSz) - Number(item?.order?.sz)
      const orderValue =
        item?.order?.orderType === 'Market'
          ? 'Market'
          : `${fixNumber(Number(item?.order?.origSz) * Number(item?.order?.limitPx), 2)} USDC`
      return {
        status: item.status,
        statusTimestamp: item.statusTimestamp,
        order_filledSz: filledSz.toString(),
        order_orderValue: orderValue.toString(),
        ...Object.fromEntries(Object.entries(item.order).map(([k, v]) => [`order_${k}`, v])),
      }
    })

  const { filterOrders: dataFilter } = useFilterEntrustedHistory({
    baseCoin,
    orders: reverseOrders as unknown as xEntrustedHistory[],
  })

  const { sortedData, useTableColumns } = DesktopEntrustedHistoryColumns({
    orderInfo: dataFilter,
  })

  /* useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, []) */

  return (
    <div className="h-full flex flex-col">
      <DataTable<xEntrustedHistory, any>
        columns={useTableColumns()}
        data={sortedData}
        isStickyHeader={true}
        isLoading={isLoading}
        // isStickyLastColumn={true}
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

export default memo(DesktopEntrustedHistory, (prevProps, nextProps) => isEqual(prevProps.baseCoin, nextProps.baseCoin))
