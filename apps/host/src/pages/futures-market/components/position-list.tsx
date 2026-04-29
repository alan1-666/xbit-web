import Text from '@/components/common/Text'
import { LeverageBadge, PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { ISymbolList, setData, SymbolListState } from '@/redux/modules/symbolList.slide'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHandleGetData from '../hooks/useHandleGetData'
import { useMergedData } from '../hooks/useSymbolListSubscription'
import { useTranslation } from 'react-i18next'
import { UITab } from '@/types/uiTabs'
import { CoinIcon, MarketKind, PairName } from './market-overview-table-utils'
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
              <Text text={t('tokenSearchDrawer.tableHeaders.marketCap')} fontSize={11} fontWeight="light" color="#5E5C66" />
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

            <Text text={t('tokenSearchDrawer.tableHeaders.position')} fontSize={11} fontWeight="light" color="#5E5C66" />
          </div>
        ),
        cell: (info: any) => {
          const currentPrice = info.getValue()
          const { openInterest } = info.row.original
          // 转成 usd 价值
          const openInterestValue = Number(openInterest || 0)
          const price = Number(currentPrice || 0)
          // 计算USD价值 = 数量 * 当前价格
          const usdValue = openInterestValue * price
          return (
            <div className="flex items-end gap-1 flex-col relative">
              <Text
                text={formatNumberWithCommas(`${currentPrice}`, 9)}
                fontSize={14}
                fontWeight="medium"
                className="lining-nums"
              />
              <Text
                text={usdValue ? formatMoney(Number(usdValue)) : '--'}
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
              <Text text={t('tokenSearchDrawer.tableHeaders.24hChange')} fontSize={11} fontWeight="light" color="#5E5C66" />
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

const usePositionData = (symbolListCache: ISymbolList[], symbolData: ISymbolList[]) => {
  const currentData = useMergedData(symbolListCache, symbolData)

  const sortedList = useMemo(() => {
    if (!currentData.length) return []

    return [...currentData].sort((a, b) => {
      const openInterestValueA = Number(a.openInterest || 0)
      const priceA = Number(a.currentPrice || 0)
      const usdValueA = openInterestValueA * priceA

      const openInterestValueB = Number(b.openInterest || 0)
      const priceB = Number(b.currentPrice || 0)
      const usdValueB = openInterestValueB * priceB

      return usdValueB - usdValueA
    })
  }, [currentData])

  return { currentData: sortedList }
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

const PositionList = ({
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
    lists: { openInterest },
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
    condition: 'openInterest',
    skip: openInterest?.length !== 0,
  })
  const { currentData } = usePositionData(openInterest, symbolData)
  const columns = useTableColumns(marketKind)
  const handleRowClick = useRowNavigation()
  const tableProps = useTableProps()

  const visibleData = useMemo(() => {
    return currentData
  }, [currentData, type, visibleCount])

  const onBottomReached = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= currentData.length) {
        return prev
      }
      return Math.min(prev + DEFAULT_PAGE_SIZE, currentData.length)
    })
  }, [currentData.length])
  useEffect(() => {
    const initializeSymbolList = async () => {
      if (openInterest.length !== 0) {
        setIsLoadingSymbol(false)
        // return
      }
      const cacheLoaded = await loadSymbolListFromCache('openInterest', filter)

      if (!cacheLoaded?.length) {
        await handleGetSymbolList(filter)
      } else {
        dispatch(setData({ condition: 'openInterest', data: cacheLoaded as ISymbolList[] }))
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
                'text-[12px] font-semibold text-[#5E5C66] px-2 py-0.5 rounded-full cursor-pointer hover:text-[#FAFAFA]',
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

export default memo(PositionList)
