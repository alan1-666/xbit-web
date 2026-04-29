import Tag from '@/components/common/Tag'
import Text from '@/components/common/Text'
import { getOrderTypeDescription, getTpOrSlChild } from '@/components/futuresDetails/trade/tools'
import { xOpenOrders } from '@/components/futuresDetails/trade/types'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { formatNumberWithCommas } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SortHeader from '../../SortHeader'
import useTradingDashboard from '../useTradingDashboard'

interface CurrentOrdersTableColumnsProps {
  orders: xOpenOrders[]
}

const CurrentOrdersTableColumns = ({ orders }: CurrentOrdersTableColumnsProps) => {
  const { t } = useTranslation()
  const { cancelOrder } = useTradingDashboard()

  const { sortedData, handleSort, getSortIndicator } = useSortableTable<xOpenOrders>(orders)

  const sortIndicators = useMemo(
    () => ({
      coin: getSortIndicator('coin', '#6A2AE0'),
      orderType: getSortIndicator('orderType', '#6A2AE0'),
      origSz: getSortIndicator('origSz', '#6A2AE0'),
      limitPx: getSortIndicator('limitPx', '#6A2AE0'),
      completedSz: getSortIndicator('completedSz', '#6A2AE0'),
      tif: getSortIndicator('tif', '#6A2AE0'),
      timestamp: getSortIndicator('timestamp', '#6A2AE0'),
      triggerCondition: getSortIndicator('triggerCondition', '#6A2AE0'),
    }),
    [getSortIndicator],
  )

  const sortHandlers = useMemo(
    () => ({
      coin: () => handleSort('coin'),
      orderType: () => handleSort('orderType'),
      origSz: () => handleSort('origSz'),
      limitPx: () => handleSort('limitPx'),
      completedSz: () => handleSort('completedSz'),
      tif: () => handleSort('tif'),
      timestamp: () => handleSort('timestamp'),
      triggerCondition: () => handleSort('triggerCondition'),
    }),
    [handleSort],
  )
  const useTableColumns = () => {
    const columnHelper = createColumnHelper<xOpenOrders>()

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
                      label={side === 'B' ? t('futuresDetails.common.long') : t('futuresDetails.common.short')}
                      color={side === 'B' ? '#00FFB4' : '#F25461'}
                      containerClassName="rounded-[4px] px-1 py-0.75 mx-2"
                    />
                  </div>
                </div>
              </div>
            )
          },
        }),
        columnHelper.accessor('orderType', {
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader
                text={t('transaction.type')}
                onSort={sortHandlers.orderType}
                sortIndicator={sortIndicators.orderType}
              />
            </div>
          ),
          cell: (info) => {
            const orderType = info.getValue()
            const typeDesc = getOrderTypeDescription(orderType)

            return (
              <div className="flex gap-1">
                <Text text={typeDesc} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('origSz', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader
                  text={t('currentOrdersList.orderQuantity')}
                  onSort={sortHandlers.origSz}
                  sortIndicator={sortIndicators.origSz}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const origSz = info.getValue()
            const { coin } = info.row.original
            const origSz_1 = parseFloat(info.row.original.origSz_1 || '0')
            const originSize = parseFloat(origSz) === 0 ? t('futuresDetails.common.allPosition') : origSz_1
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={`${originSize} ${coin}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('limitPx', {
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader
                text={t('currentOrdersList.orderPrice')}
                onSort={sortHandlers.limitPx}
                sortIndicator={sortIndicators.limitPx}
              />
            </div>
          ),
          cell: (info) => {
            const limitPx = info.getValue()
            const { orderType } = info.row.original
            const orderPrice =
              orderType.indexOf('Market') > -1 ? t('futuresDetails.common.market') : formatNumberWithCommas(limitPx)
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={orderPrice} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),
        columnHelper.accessor('completedSz', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('futuresDetails.common.completedQuantity')}
                  onSort={sortHandlers.completedSz}
                  sortIndicator={sortIndicators.completedSz}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const completedSz = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative">
                <Text text={`${completedSz}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),

        columnHelper.accessor('triggerPx', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <Text text={t('futuresDetails.common.triggerPrice')} fontSize={12} fontWeight="light" color="#FFFFFF80" className="!font-[330]" />
              </div>
            </div>
          ),
          cell: (info) => {
            const orderInfo = info.row.original
            return (
              <div className="flex w-full">
                {orderInfo.isTrigger || orderInfo.children.length ? (
                  <div>
                    <div className="flex items-center">
                      {!orderInfo.children.length ? (
                        <>
                         <p>{formatNumberWithCommas(orderInfo.triggerPx)}</p>
                        </>
                      ) : (
                        <>
                          --
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>--</>
                )}
              </div>
            )
          },
        }),
        columnHelper.accessor('tif', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <Text text={t('position.TakeProfitandStopLoss')} fontSize={12} fontWeight="light" color="#FFFFFF80" className="!font-[330]" />
              </div>
            </div>
          ),
          cell: (info) => {
            const orderInfo = info.row.original
            
            const tpOpenOrder = getTpOrSlChild(orderInfo, 'tp')[0]
            const slOpenOrder = getTpOrSlChild(orderInfo, 'sl')[0]

            return (
              <div className="flex w-full">
                {orderInfo.isTrigger || orderInfo.children.length ? (
                  <div>
                    <div className="flex items-center">
                      {!orderInfo.children.length ? (
                        <>
                          --
                        </>
                      ) : (
                        <>
                          <p className="font-bold">
                            <span className="text-rise font-semibold">{tpOpenOrder?.triggerPx || '-'}</span>
                            <span className="text-[#FFFFFF80] mx-0.5">/</span>
                            <span className="text-fall font-semibold">{slOpenOrder?.triggerPx || '-'}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>--</>
                )}
              </div>
            )
          },
        }),

        columnHelper.accessor('reduceOnly', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <Text text={t('position.reduceOnly')} fontSize={12} fontWeight="light" color="#FFFFFF80" className="!font-[330]" />
              </div>
            </div>
          ),
          cell: (info) => {
            const reduceOnlyText = info.getValue() ? t('futuresDetails.common.yes') : t('futuresDetails.common.no')
            return (
              <div className="flex gap-1 flex-col">
                <Text text={reduceOnlyText} fontSize={14} className={'!font-[450]'} />
              </div>
            )
          },
        }),

        
        columnHelper.accessor('timestamp', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('currentOrdersList.OrderTime')}
                  onSort={sortHandlers.timestamp}
                  sortIndicator={sortIndicators.timestamp}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            // const { liquidationPx, coin } = info.row.original
            const timestamp = info.getValue()

            const formattedTime = dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss')

            return (
              <div className="flex gap-1 flex-col">
                <Text text={formattedTime} fontSize={14} className={'!font-[450]'} />
              </div>
            )
          },
        }),
        columnHelper.accessor('triggerCondition', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <Text
                  text={t('walletDetail.activityTable.actions')}
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="!font-[330]"
                />
              </div>
            </div>
          ),
          cell: (info) => {
            return (
              <div>
                <span onClick={() => cancelOrder(info.row.original)} className="flex gap-1 cursor-pointer">
                  <img
                    src="/images/icons/redo.svg"
                    alt="share"
                    className="w-[20px] h-[20px] cursor-pointer hover:scale-[1.1] !pointer-events-auto"
                  />
                  <Text text={t('currentOrdersList.Cancel')} fontSize={14} className={'!font-[380]'} />
                </span>
              </div>
            )
          },
        }),
      ],
      [columnHelper],
    )
  }

  return {
    sortedData,
    useTableColumns,
  }
}

export default CurrentOrdersTableColumns
