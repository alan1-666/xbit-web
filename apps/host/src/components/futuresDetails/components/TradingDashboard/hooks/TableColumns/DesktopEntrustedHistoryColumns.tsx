import Text from '@/components/common/Text'
import { xEntrustedHistory } from '@/components/futuresDetails/trade/types'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SortHeader from '../../SortHeader'

const DesktopHistoryOrderColumns = ({ orderInfo }: { orderInfo: xEntrustedHistory[] }) => {
  const { t } = useTranslation()
  const { sortedData, handleSort, getSortIndicator } = useSortableTable<xEntrustedHistory>(orderInfo)

  const sortIndicators = useMemo(
    () => ({
      statusTimestamp: getSortIndicator('statusTimestamp', '#6A2AE0'),
      order_orderType: getSortIndicator('order_orderType', '#6A2AE0'),
      order_coin: getSortIndicator('order_coin', '#6A2AE0'),
      order_side: getSortIndicator('order_side', '#6A2AE0'),
      order_sz: getSortIndicator('order_sz', '#6A2AE0'),
      order_filledSz: getSortIndicator('order_filledSz', '#6A2AE0'),
      order_orderValue: getSortIndicator('order_orderValue', '#6A2AE0'),
      order_limitPx: getSortIndicator('order_limitPx', '#6A2AE0'),
      order_reduceOnly: getSortIndicator('order_reduceOnly', '#6A2AE0'),
      order_triggerCondition: getSortIndicator('order_triggerCondition', '#6A2AE0'),
      order_triggerPx: getSortIndicator('order_triggerPx', '#6A2AE0'),
      status: getSortIndicator('status', '#6A2AE0'),
      order_oid: getSortIndicator('order_oid', '#6A2AE0'),
    }),
    [getSortIndicator],
  )

  const sortHandlers = useMemo(
    () => ({
      statusTimestamp: () => handleSort('statusTimestamp'),
      order_orderType: () => handleSort('order_orderType'),
      order_coin: () => handleSort('order_coin'),
      order_side: () => handleSort('order_side'),
      order_sz: () => handleSort('order_sz'),
      order_filledSz: () => handleSort('order_filledSz'),
      order_orderValue: () => handleSort('order_orderValue'),
      order_limitPx: () => handleSort('order_limitPx'),
      order_reduceOnly: () => handleSort('order_reduceOnly'),
      order_triggerCondition: () => handleSort('order_triggerCondition'),
      order_triggerPx: () => handleSort('order_triggerPx'),
      status: () => handleSort('status'),
      order_oid: () => handleSort('order_oid'),
    }),
    [handleSort],
  )
  

  const useTableColumns = () => {
    const columnHelper = createColumnHelper<xEntrustedHistory>()

    return useMemo(
      () => [
        columnHelper.accessor('statusTimestamp', {
          minSize: 180,
          maxSize: 180,
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader text={t('history.time')} onSort={sortHandlers.statusTimestamp} sortIndicator={sortIndicators.statusTimestamp} />
              </div>
            </div>
          ),
          cell: (info) => {
            const statusTimestamp = info.getValue()

            const formattedstatusTimestamp = dayjs(statusTimestamp).format('YYYY/MM/DD HH:mm:ss')

            return (
              <div className="flex gap-1 flex-col whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={formattedstatusTimestamp} fontSize={14} className={'!font-[330]'} />
              </div>    
            )
          },
        }),

        columnHelper.accessor('order_orderType', {
          minSize: 120,
          // maxSize: 120,
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('history.type')} onSort={sortHandlers.order_orderType} sortIndicator={sortIndicators.order_orderType} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_orderType = info.getValue()
            return (
              <div className="flex gap-1 flex-col whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_orderType} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),

        columnHelper.accessor('order_coin', {
          minSize: 80,
          // maxSize: 80,
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('history.token')} onSort={sortHandlers.order_coin} sortIndicator={sortIndicators.order_coin} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_coin = info.getValue()
            return (
              <div className="flex gap-1 flex-col whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_coin} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),


        columnHelper.accessor('order_side', {
          minSize: 80,
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('futuresDetails.common.direction')} onSort={sortHandlers.order_side} sortIndicator={sortIndicators.order_side} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_side = info.getValue()
            const order_side_text = info.getValue() === 'B' ? t('futuresDetails.common.long') : t('futuresDetails.common.short')

            return (
              <div className="flex gap-1 flex-col whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={`${order_side_text}`} fontSize={14} className={`!font-[380] ${order_side === 'B' ? '!text-rise' : '!text-fall'}`} />
              </div>
            )
          },
        }),


        columnHelper.accessor('order_sz', {
          minSize: 80,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.quantity')} onSort={sortHandlers.order_sz} sortIndicator={sortIndicators.order_sz} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_sz = info.getValue()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_sz!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),

        columnHelper.accessor('order_filledSz', {
          minSize: 90,
          // maxSize:90,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.completedQuantity')} onSort={sortHandlers.order_filledSz} sortIndicator={sortIndicators.order_filledSz} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_filledSz = Number(info.getValue()) === 0 ? '--' : info.getValue()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_filledSz!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),


        columnHelper.accessor('order_orderValue', {
          minSize: 120,
          // maxSize: 120,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('futuresDetails.common.orderValue')} onSort={sortHandlers.order_orderValue} sortIndicator={sortIndicators.order_orderValue} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_orderValue = info.getValue()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_orderValue!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),

        columnHelper.accessor('order_limitPx', {
          // size: 120,
          minSize: 90,
          // maxSize: 120,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('futuresDetails.common.price')} onSort={sortHandlers.order_limitPx} sortIndicator={sortIndicators.order_limitPx} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_limitPx = Number(info.getValue())
            const { order_orderType } = info.row.original
            const price = order_orderType === 'Market' ? 'Market' : `${order_limitPx}`

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={price!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),


        columnHelper.accessor('order_reduceOnly', {
          minSize: 120,
          // maxSize: 80,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.reduceOnly')} onSort={sortHandlers.order_reduceOnly} sortIndicator={sortIndicators.order_reduceOnly} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_reduceOnly = info.getValue() ? t('position.yes') : t('position.no')

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_reduceOnly!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),

        columnHelper.accessor('order_triggerCondition', {
          minSize: 200,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.triggerCondition')} onSort={sortHandlers.order_triggerCondition} sortIndicator={sortIndicators.order_triggerCondition} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_triggerCondition = info.getValue()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_triggerCondition!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),
        

        columnHelper.accessor('order_triggerPx', {
          // size: 80,
          minSize: 80,
          // maxSize: 80,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={'TP/SL'} onSort={sortHandlers.order_triggerPx} sortIndicator={sortIndicators.order_triggerPx} />
              </div>
            </div>
          ),
          cell: (info) => {
            const tpsl = '--'

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={tpsl!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),

        columnHelper.accessor('status', {
          // size: 100,
          minSize: 100,
          // maxSize: 100,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.status')} onSort={sortHandlers.status} sortIndicator={sortIndicators.status} />
              </div>
            </div>
          ),
          cell: (info) => {
            const status = info.getValue()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={status!} fontSize={14} className={`!font-[380]`} />
              </div>
            )
          },
        }),


        columnHelper.accessor('order_oid', {
          // size: 150,
          minSize: 150,
          // maxSize: 150,
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.orderId')} onSort={sortHandlers.order_oid} sortIndicator={sortIndicators.order_oid} />
              </div>
            </div>
          ),
          cell: (info) => {
            const order_oid = info.getValue().toString()

            return (
              <div className="flex w-full whitespace-nowrap overflow-hidden text-ellipsis">
                <Text text={order_oid!} fontSize={14} className={`!font-[380]`} />
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
