import { memo } from 'react'
import { xOpenOrders } from '../../trade/types'
import { DataTable } from '../DataTable'
import CurrentOrdersTableColumns from './hooks/TableColumns/CurrentOrdersTableColumns'
import { isEqual } from 'lodash-es'
import useFilterCurrentOrder from './hooks/useFilterCurrentOrder'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'


interface DesktopCurrentOrdersProps {
  loadingSocket: boolean
  orders: xOpenOrders[]
  baseCoin: string
}

const DesktopCurrentOrders = ({ baseCoin, orders, loadingSocket }: DesktopCurrentOrdersProps) => {
  const { filterOrders } = useFilterCurrentOrder({
    baseCoin,
    orders,
  })


  const { sortedData, useTableColumns } = CurrentOrdersTableColumns({
    orders: filterOrders,
  })
  const isLogin = useCheckLoginOnArb()
  

  return (
    <div className="h-full flex flex-col">
      <DataTable<xOpenOrders, any>
        columns={useTableColumns()}
        data={sortedData}
        isStickyHeader={true}
        isLoading={loadingSocket}
        minTableWidth="1000px"
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

export default memo(
  DesktopCurrentOrders,
  (prevProps, nextProps) =>
    isEqual(prevProps.orders, nextProps.orders) &&
    isEqual(prevProps.loadingSocket, nextProps.loadingSocket) &&
    isEqual(prevProps.baseCoin, nextProps.baseCoin),
)
