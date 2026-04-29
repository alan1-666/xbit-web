import Text from '@/components/common/Text'
import { LeverageBadge, PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { formatMoney, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { ISymbolList } from '../type'
import useHandleGetData from '../hooks/useHandleGetData'

const TrendingTable = () => {
  const columnHelper = createColumnHelper<ISymbolList>()
  const { isLoading, symbolList } = useHandleGetData({ condition: 'trend' })

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                <Text text="币种" fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <div className="flex flex-col ml-1 cursor-pointer">
                  <IconSortUp currentColor={'#00FFB4'} />
                  <IconSortDown currentColor={'#FFFFFF80'} />
                </div>
              </div>
              <div className="flex">
                <Text text="市值" fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <div className="flex flex-col ml-1 cursor-pointer">
                  <IconSortUp currentColor={'#FFFFFF80'} />
                  <IconSortDown currentColor={'#FFFFFF80'} />
                </div>
              </div>
            </div>
          </div>
        ),
        cell: (info) => (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Text text={info.row.original.symbol} fontSize={14} fontWeight="medium" />
                <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
                <Text text={'USDC'} fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <LeverageBadge value={`${info.row.original.maxLeverage}`} />
              </div>
              <div className="flex gap-1 items-end">
                <div className="text-[calc(1rem*(12/16))] tex-[#FFFFFFB2]">
                  {formatMoney(info.row.original.marketCap)}
                </div>
              </div>
            </div>
          </div>
        ),
      }),

      columnHelper.accessor('currentPrice', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                <Text text="价格" fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <div className="flex flex-col ml-1 cursor-pointer">
                  <IconSortUp currentColor={'#FFFFFF80'} />
                  <IconSortDown currentColor={'#FFFFFF80'} />
                </div>
              </div>

              <div className="flex">
                <Text text="成交额" fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <div className="flex flex-col ml-1 cursor-pointer">
                  <IconSortUp currentColor={'#FFFFFF80'} />
                  <IconSortDown currentColor={'#FFFFFF80'} />
                </div>
              </div>
            </div>
          </div>
        ),
        cell: (info: any) => (
          <div className="flex items-end gap-1 flex-col relative">
            <Text text={formatMoney(info.getValue())} fontSize={14} fontWeight="medium" />
            <Text text={formatMoney(info.row.original.volume)} fontSize={11} fontWeight="regular" color="#FFFFFFB2" />
          </div>
        ),
      }),
      columnHelper.accessor('changPxPercent', {
        header: () => (
          <div className="flex justify-end gap-2 ">
            <div className="flex items-center text-right">
              <div className="flex">
                <Text text="涨跌幅" fontSize={11} fontWeight="light" color="#FFFFFF80" />

                <div className="flex flex-col ml-1 cursor-pointer">
                  <IconSortUp currentColor={'#FFFFFF80'} />
                  <IconSortDown currentColor={'#FFFFFF80'} />
                </div>
              </div>
            </div>
          </div>
        ),
        cell: (info) => {
          return <PriceChange value={formatPercentage(info.getValue())} isPositive={Number(info.getValue()) > 0} />
        },
      }),
    ],
    [columnHelper],
  )

  return (
    <div className="relative pb-4">
      <TableVirtual<ISymbolList, any>
        isLoading={isLoading}
        columns={columns}
        data={[]}
        isStickyHeader={true}
        containerClassName="!border-none _hidescrollbar"
        tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
        tableHeaderRowClassName="!border-none "
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-2.5 justify-end"
      />
    </div>
  )
}

export default TrendingTable
