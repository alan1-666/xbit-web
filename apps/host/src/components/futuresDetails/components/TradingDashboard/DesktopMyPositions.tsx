import { ServiceConfig } from '@/lib/gql/service-config'
import { memo, useState } from 'react'
import { xPositions } from '../../trade/types'
import { DataTable } from '../DataTable'
import MarketPriceCloseDialog from '../MarketPriceCloseDialog'
import TpslDialog from '../TpslDialog'
import MarginDialog from '../MarginDialog'
import MyPositionsTableColumns from './hooks/TableColumns/MyPositionsTableColumns'
import useFilterMyPosition from './hooks/useFilterMyPosition'
import { isEqual } from 'lodash-es'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import DesktopShare from '../../desktopShare'

interface DesktopMyPositionsProps {
  positions: xPositions[]
  baseCoin: string
  loadingSocket: boolean
  setCurrentTab?: (tab: string) => void
}

const DesktopMyPositions = ({ baseCoin, positions, loadingSocket, setCurrentTab }: DesktopMyPositionsProps) => {
  const isLogin = useCheckLoginOnArb()
  const [open, setOpen] = useState(false)
  const [isOpenMargin, setIsOpenMargin] = useState(false)
  const [showMarketPriceClose, setShowMarketPriceClose] = useState(false)
  const [info, setInfo] = useState<xPositions | undefined>(undefined)
  const [openShare, setOpenShare] = useState<boolean>(false)
  const [shareInfo, setShareInfo] = useState<xPositions | undefined>(undefined)
  // filter function based on showCurrentCoinOnly button and Direction
  const { filterPostions } = useFilterMyPosition({
    baseCoin,
    positions,
  })
  const { sortedData, useTableColumns } = MyPositionsTableColumns({
    positions: filterPostions,
    setInfo,
    setOpen,
    setIsOpenMargin,
    setShowMarketPriceClose,
    setCurrentTab,
    setOpenShare,
    setShareInfo,
  })

  return (
    <div className="h-full flex flex-col">
      <DataTable<xPositions, any>
        columns={useTableColumns()}
        data={sortedData}
        isLoading={loadingSocket}
        isStickyHeader={true}
        // isStickyLastColumn={true}
        minTableWidth="1300px"
        stickyBg="#0A0A0A"
        containerClassName="!border-none no-scrollbar"
        // containerClassName="!border-none"
        tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
        tableHeaderRowClassName="!border-none"
        tableCellClassName="!border-none rouder-first-item"
        tableBodyRowClassName="border-b-0 h-[48px] highlight-even-column"
        isShowLoginRequire={!isLogin}
      />

      {info && <TpslDialog open={open} setOpen={setOpen} setInfo={setInfo} info={info} baseCoin={baseCoin} />}
      {info && <MarginDialog open={isOpenMargin} setOpen={setIsOpenMargin} info={info} />}
      {info && (
        <MarketPriceCloseDialog
          open={showMarketPriceClose}
          setOpen={setShowMarketPriceClose}
          info={info}
          baseCoin={baseCoin}
        />
      )}
      {shareInfo && <DesktopShare open={openShare} onClose={setOpenShare} info={shareInfo} shareType="order" />}
    </div>
  )
}

export default memo(DesktopMyPositions, (prevProps, nextProps) => {
  return (
    prevProps.loadingSocket === nextProps.loadingSocket &&
    prevProps.baseCoin === nextProps.baseCoin &&
    isEqual(prevProps.positions, nextProps.positions)
  )
})
