import Text from '@/components/common/Text'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { LeverageBadge } from './crypto-table'
import { TableVirtual } from './table-virtual'

const TableNotDrag = () => {
  const data = useMemo(
    () => [
      {
        symbol: 'ETH',
        pair: 'USDT',
        leverage: '10X',
        marketCap: '$3.30亿',
        price: '$3302.12',
        volume: '$248.98亿',
        priceChange: 3.78,
      },
      {
        symbol: 'XRP',
        pair: 'USDT',
        leverage: '10X',
        marketCap: '$3.30亿',
        price: '$3302.12',
        volume: '$248.98亿',
        priceChange: -0.78,
      },
      {
        symbol: 'SOL',
        pair: 'USDT',
        leverage: '10X',
        marketCap: '$3.30亿',
        price: '$3302.12',
        volume: '$248.98亿',
        priceChange: 8.02,
      },
      {
        symbol: 'DOGE',
        pair: 'USDT',
        leverage: '10X',
        marketCap: '$3.30亿',
        price: '$3302.12',
        volume: '$248.98亿',
        priceChange: 6.68,
      },
      {
        symbol: 'USDC',
        pair: 'USDT',
        leverage: '10X',
        marketCap: '$3.30亿',
        price: '$3302.12',
        volume: '$248.98亿',
        priceChange: 83.78,
      },
    ],
    [],
  )

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              <Text text="币种" fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text="市值" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info: any) => (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Text text={info.row.original.symbol} fontSize={15} fontWeight="medium" />
                <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
                <Text text={info.row.original.pair} fontSize={11} fontWeight="light" color="#FFFFFF80" />
                <LeverageBadge value={info.row.original.leverage} />
              </div>
              <div className="flex gap-1 items-end">
                <div className="text-[calc(1rem*(12/16))] tex-[#FFFFFFB2]">{info.row.original.marketCap}</div>
              </div>
            </div>
          </div>
        ),
      }),

      columnHelper.accessor('price', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-0.5">
              <Text text="价格" fontSize={11} fontWeight="light" color="#FFFFFF80" />
              <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" />
              <Text text="成交额" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info: any) => (
          <div className="flex items-end gap-1 flex-col">
            <Text text={info.getValue()} fontSize={15} fontWeight="medium" />
          </div>
        ),
      }),
      columnHelper.accessor('volume', {
        header: () => (
          <div className="flex justify-end gap-2 ">
            <div className="flex items-center text-right">
              <Text text="24h涨跌幅" fontSize={11} fontWeight="light" color="#FFFFFF80" />
            </div>
          </div>
        ),
        cell: (info) => (
          <div className="flex items-end gap-1 flex-col">
            <Text text={info.getValue()} fontSize={15} fontWeight="medium" />
          </div>
        ),
      }),
    ],
    [columnHelper],
  )

  return (
    <div className="relative">
      <TableVirtual
        columns={columns}
        data={data}
        isStickyHeader={true}
        containerClassName="max-h-[400px] !border-none _hidescrollbar"
        tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(12/16))] font-[400]"
        tableHeaderRowClassName="!border-none "
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-2.5 justify-end"
      />
    </div>
  )
}

export default TableNotDrag
