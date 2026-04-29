import { ServiceConfig } from '@/lib/gql/service-config'
import { isEqual } from 'lodash-es'
import { memo } from 'react'
import { DataTable } from '../DataTable'
import DesktopBalanceColumns, { IBalance } from './hooks/TableColumns/DesktopBalanceColumns'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'


const DesktopBalance = ({
  baseCoin: _baseCoin,
  loadingSocket,
  balanceData,
}: {
  baseCoin: string
  loadingSocket: boolean
  balanceData: IBalance[]
}) => {
  const { useTableColumns, dialogs } = DesktopBalanceColumns({
    balanceData,
  })
  const isLogin = useCheckLoginOnArb()
  

  return (
    <>
      <div className="h-full flex flex-col">
        <DataTable<IBalance, any>
          columns={useTableColumns()}
          data={balanceData}
          isStickyHeader={true}
          isLoading={loadingSocket}
          // isStickyLastColumn={true}
          minTableWidth="1000px"
          stickyBg="#0A0A0A"
          containerClassName="!border-none"
          tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
          tableHeaderRowClassName="!border-none max-w-last-col"
          tableCellClassName=" !border-none"
          tableBodyRowClassName="border-b-0 h-[48px] highlight-even-column"
          isShowLoginRequire={!isLogin}
        />
      </div>
      {/* 渲染所有弹窗组件 */}
      {dialogs}
    </>
  )
}

export default memo(
  DesktopBalance,
  (prevProps, nextProps) =>
    isEqual(prevProps.baseCoin, nextProps.baseCoin) &&
    prevProps.loadingSocket === nextProps.loadingSocket &&
    isEqual(prevProps.balanceData, nextProps.balanceData),
)
