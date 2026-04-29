import Text from '@/components/common/Text'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { OrderTradeItem, useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useAppSelector } from '@/redux/store'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'

const LatestTransaction = ({ isActive, scrollElement }: { isActive: boolean, scrollElement?: HTMLDivElement | null }) => {
  const { t } = useTranslation()
  const { baseCoin } = useAppSelector(symbolInfoSelector)
  const data = useOrderTradeData(baseCoin)
  
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const depthTick = Number(tradeConfigs.depthTick) ||  tiers?.[0]?.tick || 0
  const tier = useMemo(() => tiers.find((item: any) => item.tick === depthTick), [tiers, depthTick]);

  const TokenAccuracy = tier?.tick


  const getDecimalPlaces = (num: number): number => {
    if (!num || num === 0) return 0;
    const str = num.toString();
    if (str.indexOf('.') === -1) return 0;
    return str.split('.')[1].length;
  };

  const tokenAccuracyDecimals = useMemo(() => {
    return TokenAccuracy ? getDecimalPlaces(TokenAccuracy) : 2;
  }, [TokenAccuracy]);
  



  const columns: ColumnDef<OrderTradeItem>[] = [
    {
      accessorKey: 'price',
      header: () => (
        <div className="flex justify-start">
          <Text text={`${t('futuresDetails.common.price')}`} fontSize={11} fontWeight="medium" color="#FFFFFF80" />
        </div>
      ),
      cell: ({ row, getValue }) => {
        return (
          <div className="flex justify-start">
            <Text
              text={formatNumberWithCommas(Number(getValue()).toFixed(tokenAccuracyDecimals))  }
              fontSize={12}
              fontWeight="regular"
              color={row.original.side === 'Buy' ? 'var(--desktop-rise)' : 'var(--desktop-fall)'}
            />
          </div>
        )
      },
    },
    {
      accessorKey: `quantity`,
      header: () => (
        <div className="flex items-center justify-end">
          <Text text={`${t('futuresDetails.common.quantity')} (${baseCoin})`} fontSize={11} fontWeight="medium" color="#FFFFFF80" />
        </div>
      ),
      cell: ({ getValue }) => {
        return (
          <div className="flex items-center justify-end">
            <Text text={getValue() as string} fontSize={12} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: 'time',
      header: () => (
        <div className="flex items-center justify-end">
          <Text text={t('futuresDetails.common.time')} fontSize={11} fontWeight="medium" color="#FFFFFF80" />
        </div>
      ),
      cell: (info) => {
        return (
          <div className="flex items-center justify-end">
            <Text text={info.getValue() as string} fontSize={12} fontWeight="regular" />
          </div>
        )
      },
    },
  ]

  return (
    <>
      {isActive && (
        <TableVirtual
          columns={columns}
          data={data}
          // isStickyHeader
          stickyBg="rgb(23,24,27)"
          cusTomMaxHeight="none"
          disableMaxHeight={true}
          containerClassName="border-none _hidescrollbar"
          tableClassName=""
          tableHeaderRowClassName="text-[calc(1rem*(11/16))] text-[#FFFFFF80] whitespace-nowrap !border-b-0"
          tableHeadClassName="app-font-light !px-2 py-1 items-center justify-center pb-0"
          tableBodyClassName=""
          tableBodyRowClassName="group whitespace-nowrap !border-[#ECECED14]"
          tableCellClassName="cursor-pointer px-2 py-1 border-box"
          tableRowClassName="border-none"
          rowHeight={16}
          scrollElement={scrollElement || undefined}
        />
      )}
    </>
  )
}
export default LatestTransaction
