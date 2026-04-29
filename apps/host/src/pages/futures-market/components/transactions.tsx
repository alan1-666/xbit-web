import Text from '@/components/common/Text'
import { LeverageBadge, PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, memo, useEffect, useState } from 'react'
import useHandleGetData from '../hooks/useHandleGetData'
import { useNavigate } from 'react-router-dom'
import { useMergedData } from '../hooks/useSymbolListSubscription'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ISymbolList, setData, SymbolListState } from '@/redux/modules/symbolList.slide'
import { useTranslation } from 'react-i18next'
import { CoinIcon, MarketKind, PairName } from './market-overview-table-utils'
import { UITab } from '@/types/uiTabs'

const DEFAULT_PAGE_SIZE = 20

const useTableColumns = (marketKind: MarketKind) => {
  const columnHelper = createColumnHelper<ISymbolList>()
  const { t } = useTranslation()
  return useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-1.5">
              <Text text={t('tokenSearchDrawer.tableHeaders.token')} fontSize={11} fontWeight="light" color="#5E5C66" />
              <div className="w-px h-3 bg-[#414141]"></div>
              <Text
                text={t('tokenSearchDrawer.tableHeaders.marketCap')}
                fontSize={11}
                fontWeight="light"
                color="#5E5C66"
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, maxLeverage, marketCap } = info.row.original
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
          <div className="flex items-center gap-1.5 justify-end">
            <Text text={t('tokenSearchDrawer.tableHeaders.price')} fontSize={11} fontWeight="light" color="#5E5C66" />
            <div className="w-px h-3 bg-[#414141]"></div>

            <Text text={t('tokenSearchDrawer.tableHeaders.volume')} fontSize={11} fontWeight="light" color="#5E5C66" />
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
          <div className="flex justify-end gap-2">
            <div className="flex items-center text-right">
              <Text
                text={t('tokenSearchDrawer.tableHeaders.24hChange')}
                fontSize={11}
                fontWeight="light"
                color="#5E5C66"
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
    [columnHelper, marketKind, t],
  )
}

const useRowNavigation = () => {
  const navigate = useNavigate()

  return useCallback(
    (row: ISymbolList) => {
      navigate(`/futures/${row.symbol}`)
    },
    [navigate],
  )
}

const useTableProps = () => {
  return useMemo(
    () => ({
      isStickyHeader: true,
      containerClassName: '!border-none _hidescrollbar',
      tableHeaderClassName: 'text-[#5E5C66] text-[calc(1rem*(12/16))] font-[400]',
      tableHeaderRowClassName: '!border-none',
      tableCellClassName:
        'group-hover:!bg-[#27272a] cursor-pointer !border-none !py-3 justify-end px-table-cell w-27-precent',
      tableHeadClassName: 'px-table-cell bg-[#0A0A0A] w-27-precent',
      tableRowClassName: '!border-none',
      // tableClassName: "table-fixed"
    }),
    [],
  )
}

const Transactions = ({
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
  const dispatch = useAppDispatch()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
  const {
    lists: { volume },
  } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)
  const { t } = useTranslation()
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
  const { isLoading, setIsLoadingSymbol, loadSymbolListFromCache, handleGetSymbolList } = useHandleGetData({
    condition: 'volume',
    skip: volume?.length !== 0,
  })
  const currentData = useMergedData(volume, symbolData)

  const sortedData = useMemo(() => {
    return [...currentData].sort((a, b) => {
      const aVolume = Number(a.volume) || 0
      const bVolume = Number(b.volume) || 0
      return bVolume - aVolume
    })
  }, [currentData])

  const columns = useTableColumns(marketKind)
  const handleRowClick = useRowNavigation()
  const tableProps = useTableProps()

  const visibleData = useMemo(() => {
    return sortedData
  }, [sortedData, type, visibleCount])

  const onBottomReached = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= sortedData.length) {
        return prev
      }
      return Math.min(prev + DEFAULT_PAGE_SIZE, sortedData.length)
    })
  }, [sortedData.length])

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
        setIsLoadingSymbol(false)
      }
    }

    initializeSymbolList()
  }, [filter])

  return (
    <div className="relative pt-2">
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
        isLoading={isLoading}
        columns={columns}
        data={visibleData}
        onRowClick={handleRowClick}
        rowHeight={61}
        onBottomReached={onBottomReached}
        scrollElement={scrollElement || undefined}
        {...tableProps}
        containerClassName={'!border-none _hidescrollbar !overflow-visible'}
        cusTomMaxHeight={'none'}
        disableMaxHeight={true}
        tableHeaderClassName="text-[#5E5C66] text-[calc(1rem*(11/16))] font-[400] !top-[36px]"
      />
    </div>
  )
}

export default memo(Transactions)
