import Text from '@/components/common/Text'
import { xFundingHistory } from '@/components/futuresDetails/trade/types'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { formatNumberWithCommas } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SortHeader from '../../SortHeader'

const DesktopHistoryOrderColumns = ({ orderInfo }: { orderInfo: xFundingHistory[] }) => {
  const { t } = useTranslation()
  const { sortedData, handleSort, getSortIndicator } = useSortableTable<xFundingHistory>(orderInfo)

  const sortIndicators = useMemo(
    () => ({
      time: getSortIndicator('time', '#6A2AE0'),
      delta_coin: getSortIndicator('delta_coin', '#6A2AE0'),
      delta_szi: getSortIndicator('delta_szi', '#6A2AE0'),
      delta_usdc: getSortIndicator('delta_usdc', '#6A2AE0'),
      delta_side: getSortIndicator('delta_side', '#6A2AE0'),
      delta_fundingRate: getSortIndicator('delta_fundingRate', '#6A2AE0'),
    }),
    [getSortIndicator],
  )

  const sortHandlers = useMemo(
    () => ({
      time: () => handleSort('time'),
      delta_coin: () => handleSort('delta_coin'),
      delta_szi: () => handleSort('delta_szi'),
      delta_usdc: () => handleSort('delta_usdc'),
      delta_side: () => handleSort('delta_side'),
      delta_fundingRate: () => handleSort('delta_fundingRate'),
    }),
    [handleSort],
  )
  

  const useTableColumns = () => {
    const columnHelper = createColumnHelper<xFundingHistory>()

    return useMemo(
      () => [
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
                <Text text={formattedTime} fontSize={14} className={'!font-[330]'} />
              </div>    
            )
          },
        }),
        columnHelper.accessor('delta_coin', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('history.token')} onSort={sortHandlers.delta_coin} sortIndicator={sortIndicators.delta_coin} />
              </div>
            </div>
          ),
          cell: (info) => {
            const delta_coin = info.getValue()
            return (
              <div className="flex gap-1 flex-col">
                <Text text={delta_coin} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
          minSize: 195,
        }),

        columnHelper.accessor('delta_szi', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('position.quantity')} onSort={sortHandlers.delta_szi} sortIndicator={sortIndicators.delta_szi} />
              </div>
            </div>
          ),
          cell: (info) => {
            const delta_szi = Number(info.getValue())
            const { delta_coin } = info.row.original
            return (
              <div className="flex gap-1 flex-col">
                <Text text={`${delta_szi} ${delta_coin}`} fontSize={14} className="!font-[380]" />
              </div>
            )
          },
        }),

        columnHelper.accessor('delta_side', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader text={t('position.direction')} onSort={sortHandlers.delta_side} sortIndicator={sortIndicators.delta_side} />
              </div>
            </div>
          ),
          cell: (info) => {
            const delta_side = info.getValue()
            const sideText = delta_side === 'Short' ? t('futuresDetails.common.short') : t('futuresDetails.common.long')
            return (
              <div className="flex gap-1 flex-col">
                <Text text={`${sideText}`} fontSize={14} className={`!font-[380] ${delta_side === 'Short' ? '!text-fall' : '!text-rise'}`} />
              </div>
            )
          },
        }),



        columnHelper.accessor('delta_usdc', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader text={t('position.payment')} onSort={sortHandlers.delta_usdc} sortIndicator={sortIndicators.delta_usdc} />
              </div>
            </div>
          ),
          cell: (info) => {
            const delta_usdc = info.getValue()

            return (
              <div className="flex w-full">
                <Text text={"$"+ delta_usdc} fontSize={14} className={`!font-[380] ${Number(delta_usdc) < 0 ? '!text-fall' : '!text-rise'}`} />
              </div>
            )
          },
        }),
        columnHelper.accessor('delta_fundingRate', {
          minSize: 185,
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader text={t('position.rate')} onSort={sortHandlers.delta_fundingRate} sortIndicator={sortIndicators.delta_fundingRate} />
              </div>
            </div>
          ),
          cell: (info) => {
            const rate = Number(info.getValue())
            const delta_fundingRate = isNaN(rate) ? '--' : (rate * 100).toFixed(4)

            return (
              <div className="flex gap-1 flex-col">
                <Text text={`${delta_fundingRate}%`} fontSize={14} className={'!font-[330]'} />
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
