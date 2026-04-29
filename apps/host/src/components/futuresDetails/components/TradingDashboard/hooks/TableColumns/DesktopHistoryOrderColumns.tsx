import Tag from '@/components/common/Tag'
import Text from '@/components/common/Text'
import { xHistoryTrade } from '@/components/futuresDetails/trade/types'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SortHeader from '../../SortHeader'
import { Link } from 'react-router-dom'

const DesktopHistoryOrderColumns = ({ orderInfo, setOpenShare, setInfo }: { orderInfo: xHistoryTrade[], setOpenShare: (open: boolean) => void, setInfo: (info: any) => void }) => {
  const { t } = useTranslation()
  const { sortedData, handleSort, getSortIndicator } = useSortableTable<xHistoryTrade>(orderInfo)
  const sortIndicators = useMemo(
    () => ({
      coin: getSortIndicator('coin', '#6A2AE0'),
      closedPnl: getSortIndicator('closedPnl', '#6A2AE0'),
      sz: getSortIndicator('sz', '#6A2AE0'),
      px: getSortIndicator('px', '#6A2AE0'),
      orderValue: getSortIndicator('orderValue', '#6A2AE0'),
      fee: getSortIndicator('fee', '#6A2AE0'),
      time: getSortIndicator('time', '#6A2AE0'),
    }),
    [getSortIndicator],
  )

  const sortHandlers = useMemo(
    () => ({
      coin: () => handleSort('coin'),
      closedPnl: () => handleSort('closedPnl'),
      sz: () => handleSort('sz'),
      px: () => handleSort('px'),
      orderValue: () => handleSort('orderValue'),
      fee: () => handleSort('fee'),
      time: () => handleSort('time'),
    }),
    [handleSort],
  )
  
  const dirText = (orderInfo: xHistoryTrade) => {
    switch (orderInfo.dir) {
      case 'Close Long':
        return t('futuresDetails.common.closeLong')
      case 'Close Short':
        return t('futuresDetails.common.closeShort')
      case 'Open Long':
        return t('futuresDetails.common.long')
      case 'Open Short':
        return t('futuresDetails.common.short')
      case 'Liquidated Cross Long':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Cross Short':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Isolated Long':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Isolated Short':
        return t('futuresDetails.common.liquidated')
      case 'Auto-Deleveraging':
        return t('futuresDetails.common.autoDeleveraging')
      default:
        return orderInfo.dir
    }
  }

  const useTableColumns = () => {
    const columnHelper = createColumnHelper<xHistoryTrade>()

    return useMemo(
      () => [
        columnHelper.accessor('coin', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('history.token')} onSort={sortHandlers.coin} sortIndicator={sortIndicators.coin} />
              </div>
            </div>
          ),
          cell: (info) => {
            const symbol = info.getValue()
            const { side } = info.row.original

            return (
              <div className="flex items-center space-x-3 w-full">
                <div className="flex flex-col gap-1">
                  <div className="flex items-end">
                    <Text text={symbol} fontSize={14} className="!font-[380]" />

                    <Tag
                      label={dirText(info.row.original)}
                      color={side === 'B' ? '#00FFB4' : '#F25461'}
                      containerClassName="rounded-[4px] px-1 py-0.75 mx-2"
                    />
                  </div>
                </div>
              </div>
            )
          },
          minSize: 195,
        }),
        columnHelper.accessor('closedPnl', {
          minSize: 160,
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader
                text={t('position.realizedPnl')}
                onSort={sortHandlers.closedPnl}
                sortIndicator={sortIndicators.closedPnl}
              />
            </div>
          ),
          cell: (info) => {
            const closedPnl = info.getValue()

            return (
              <div className="flex gap-1 w-full items-center">
                <span className={`!font-[380] text-[14px] ${Number(closedPnl) < 0 ? 'text-fall' : (Number(closedPnl) === 0 ? 'text-[#FFFFFF]' : 'text-rise')}`}>{`${closedPnl} USDC`}</span>
                {(info.row.original.dir === "Close Long" || info.row.original.dir === "Close Short") && (
                <img
                  src="/images/futuresDetail/share-icon-new.svg"
                  alt="share"
                  className="w-[16px] h-[16px] cursor-pointer  !pointer-events-auto"
                  onClick={() => 
                    {
                      setOpenShare(true)
                      setInfo({
                        coin: info.row.original.coin,
                        dir: info.row.original.dir,
                        transaction: info.row.original.orderValue,
                        closePrice: info.row.original.px,
                        unrealizedPnl: Number(info.row.original.closedPnl),
                      })
                    }
                  }
                />
                )}
              </div>
            )
          },
        }),
        columnHelper.accessor('sz', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('position.quantity')} onSort={sortHandlers.sz} sortIndicator={sortIndicators.sz} />
              </div>
            </div>
          ),
          cell: (info) => {
            const origSz = info.getValue()
            const { coin } = info.row.original
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={`${origSz} ${coin}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('px', {
          minSize: 160,
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader
                text={t('position.transactionPrice')}
                onSort={sortHandlers.px}
                sortIndicator={sortIndicators.px}
              />
            </div>
          ),
          cell: (info) => {
            const px = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={px} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('orderValue', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('futuresDetailsOrder.volume')}
                  onSort={sortHandlers.orderValue}
                  sortIndicator={sortIndicators.orderValue}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const orderValue = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative">
                <Text text={orderValue + ' USDC'} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('fee', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.fee')} onSort={sortHandlers.fee} sortIndicator={sortIndicators.fee} />
              </div>
            </div>
          ),
          cell: (info) => {
            const fee = info.getValue() + ' USDC'

            return (
              <div className="flex w-full">
                <Text text={fee} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('time', {
          minSize: 185,
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader text={t('futuresDetailsOrder.tradeTime')} onSort={sortHandlers.time} sortIndicator={sortIndicators.time} />
              </div>
            </div>
          ),
          cell: (info) => {
            const time = info.getValue()

            const formattedTime = dayjs(time).format('YYYY/MM/DD HH:mm:ss')

            return (
              <div className="flex gap-1 flex-col">
                <Link to={`https://hypurrscan.io/tx/${info.row.original.hash}`} target="_blank">
                  <Text text={formattedTime} fontSize={13} className={'!font-[330] underline'} />
                </Link>
              </div>    
            )
          },
        }),
      ],
      [columnHelper, sortHandlers, sortIndicators],
    )
  }

  return {
    sortedData,
    useTableColumns,
  }
}

export default DesktopHistoryOrderColumns
