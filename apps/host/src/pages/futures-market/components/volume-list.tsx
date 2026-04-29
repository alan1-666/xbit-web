import Text from '@/components/common/Text'
import { LeverageBadge } from '@/components/futuresDiscover/table/crypto-table'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHandleGetData, { CATEGORY_ALL } from '../hooks/useHandleGetData'
import useSortableTable from '../hooks/useSortableTable'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ISymbolList, setCategoryData, setData, SymbolListState } from '@/redux/modules/symbolList.slide'
import { useTranslation } from 'react-i18next'
import { UITab } from '@/types/uiTabs'
import { CoinIcon, MarketKind, PairName } from './market-overview-table-utils'

const SortHeader = React.memo(
  ({
    text,
    onSort,
    sortIndicator,
  }: {
    text: string
    onSort: () => void
    sortIndicator: { upColor: string; downColor: string }
  }) => (
    <div className="flex cursor-pointer" onClick={onSort}>
      <Text text={text} fontSize={11} fontWeight="light" color="#5E5C66" className="cursor-pointer" />
      <div className="flex flex-col ml-1 cursor-pointer">
        <IconSortUp currentColor={sortIndicator.upColor} />
        <IconSortDown currentColor={sortIndicator.downColor} />
      </div>
    </div>
  ),
)

SortHeader.displayName = 'SortHeader'

const DEFAULT_PAGE_SIZE = 20

const VolumeList = ({
  symbolData,
  type,
  marketKind = 'futures',
  scrollElement,
}: {
  symbolData: ISymbolList[]
  type: string
  marketKind?: MarketKind
  scrollElement?: HTMLDivElement | null
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
  const columnHelper = createColumnHelper<ISymbolList>()
  const { lists } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)
  const { volume } = lists
  const tabFilters: UITab[] = [
    // {
    //   value: 'Spot',
    //   label: t('header.spots'),
    // },
    {
      value: 'Contract',
      label: t('assets.futures.futures'),
    },
  ]
  const [filter] = useState<string | undefined>(tabFilters[0].value)

  const { isLoading, handleGetSymbolList, loadSymbolListFromCache, setIsLoadingSymbol } = useHandleGetData({
    condition: 'volume',
    skip: volume?.length !== 0,
  })

  const currentData = useMemo(() => {
    if (!volume || volume.length === 0) {
      return []
    }

    if (!symbolData || symbolData.length === 0) {
      return volume
    }

    const symbolDataMap = new Map(symbolData.map((item) => [item.symbol, item]))

    return volume.map((apiItem) => {
      const subscriptionItem = symbolDataMap.get(apiItem.symbol)
      return subscriptionItem || apiItem
    })
  }, [symbolData, volume])

  const { sortedData, handleSort, getSortIndicator } = useSortableTable<ISymbolList>(currentData)

  const visibleData = useMemo(() => {
    return sortedData
  }, [sortedData, type, visibleCount])

  const onBottomReached = useCallback(() => {
    if (type !== 'home') {
      return
    }
    setVisibleCount((prev) => {
      if (prev >= sortedData.length) {
        return prev
      }
      return Math.min(prev + DEFAULT_PAGE_SIZE, sortedData.length)
    })
  }, [type, sortedData.length])

  const handleRowClick = useCallback(
    (row: ISymbolList) => {
      navigate(`/futures/${row.symbol}`)
    },
    [navigate],
  )

  const sortHandlers = useMemo(
    () => ({
      symbol: () => handleSort('symbol'),
      marketCap: () => handleSort('marketCap'),
      currentPrice: () => handleSort('currentPrice'),
      volume: () => handleSort('volume'),
      changPxPercent: () => handleSort('changPxPercent'),
    }),
    [handleSort],
  )

  const sortIndicators = useMemo(
    () => ({
      symbol: getSortIndicator('symbol'),
      marketCap: getSortIndicator('marketCap'),
      currentPrice: getSortIndicator('currentPrice'),
      volume: getSortIndicator('volume'),
      changPxPercent: getSortIndicator('changPxPercent'),
    }),
    [getSortIndicator],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-1.5">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.token')}
                onSort={sortHandlers.symbol}
                sortIndicator={sortIndicators.symbol}
              />
              <div className="w-px h-3 bg-[#414141]"></div>
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.marketCap')}
                onSort={sortHandlers.marketCap}
                sortIndicator={sortIndicators.marketCap}
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, marketCap, maxLeverage } = info.row.original

          return (
            <div className="flex items-center gap-2">
              <CoinIcon symbol={symbol} />
              <div className="flex flex-col gap-1">
                <div className="flex items-end">
                  <PairName symbol={symbol} marketKind={marketKind} />
                  <LeverageBadge value={maxLeverage as unknown as string} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] text-[#FFFFFF80] lining-nums">{formatMoney(marketCap)}</div>
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('currentPrice', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.price')}
                onSort={sortHandlers.currentPrice}
                sortIndicator={sortIndicators.currentPrice}
              />
              <div className="w-px h-3 bg-[#414141]"></div>

              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.volume')}
                onSort={sortHandlers.volume}
                sortIndicator={sortIndicators.volume}
              />
            </div>
          </div>
        ),
        cell: (info: any) => {
          const currentPrice = info.getValue()
          const volume = info.row.original.volume

          return (
            <div className="flex items-end gap-1 flex-col relative">
              <Text
                text={formatNumberWithCommas(`${currentPrice}`, 9)}
                fontSize={14}
                fontWeight="medium"
                className="lining-nums"
              />
              <Text
                text={formatMoney(volume)}
                fontSize={12}
                fontWeight="regular"
                color="#FFFFFF80"
                className="lining-nums"
              />
            </div>
          )
        },
      }),
      columnHelper.accessor('changPxPercent', {
        header: () => (
          <div className="flex justify-end gap-2 ">
            <div className="flex items-center text-right">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.24hChange')}
                onSort={sortHandlers.changPxPercent}
                sortIndicator={sortIndicators.changPxPercent}
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ],
    [columnHelper, sortHandlers, sortIndicators],
  )

  useEffect(() => {
    const initializeSymbolList = async () => {
      if (volume?.length !== 0) {
        setIsLoadingSymbol(false)
        // return
      }
      const cacheLoaded = await loadSymbolListFromCache('volume', filter)

      if (!cacheLoaded?.length) {
        await handleGetSymbolList(filter)
      } else {
        dispatch(setData({ condition: 'volume', data: cacheLoaded as ISymbolList[] }))
        dispatch(
          setCategoryData({
            category: CATEGORY_ALL,
            data: cacheLoaded as ISymbolList[],
          }),
        )
        setIsLoadingSymbol(false)
      }
    }

    initializeSymbolList()
  }, [filter])
  return (
    <div className="relative">
      {/* <div className="flex items-center gap-2 pt-2.5 pb-2">
        {tabFilters.map((tab: UITab, index: number) => {
          return (
            <div
              className={cn(
                'text-[12px] font-semibold text-[#FFFFFF80] px-2 py-0.5 rounded-full cursor-pointer hover:text-[#FAFAFA]',
                {
                  'text-[FAFAFA] bg-[#18181D]': filter === tab.value,
                },
              )}
              key={index}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </div>
          )
        })}
      </div> */}
      <TableVirtual<ISymbolList, any>
        columns={columns}
        data={visibleData}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        isStickyHeader={true}
        onBottomReached={onBottomReached}
        scrollElement={scrollElement || undefined}
        containerClassName={'!border-none _hidescrollbar !overflow-visible'}
        cusTomMaxHeight={'none'}
        disableMaxHeight={true}
        tableHeaderClassName="text-[#5E5C66] text-[12px] font-[300] !top-[36px] [&_tr]:!border-none border-b-0"
        tableHeaderRowClassName="!border-none "
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-3 justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell bg-[#0A0A0A] w-27-precent pt-4 pb-2.5"
        tableRowClassName="!border-none"
        rowHeight={61}
      />
    </div>
  )
}

export default React.memo(VolumeList)
