import Text from '@/components/common/Text'
import { LeverageBadge } from '@/components/futuresDiscover/table/crypto-table'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { memo, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHandleGetData, { CATEGORY_ALL } from '../hooks/useHandleGetData'
import useSortableTable from '../hooks/useSortableTable'
import { useMergedData } from '../hooks/useSymbolListSubscription'
import CategoryTabs from './category-tabs'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { useTranslation } from 'react-i18next'
import { CoinIcon, PairName } from './market-overview-table-utils'
import { setCategories, setCategoryData, setData, SymbolListState, ISymbolList, SymbolListCondition } from '@/redux/modules/symbolList.slide'

const DEFAULT_PAGE_SIZE = 20

const SortHeader = memo(
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
      <Text text={text} fontSize={11} fontWeight="light" color="#878B99" className="cursor-pointer" />
      <div className="flex flex-col ml-1 cursor-pointer">
        <IconSortUp currentColor={sortIndicator.upColor} />
        <IconSortDown currentColor={sortIndicator.downColor} />
      </div>
    </div>
  ),
)

SortHeader.displayName = 'SortHeader'

const useSortHandlers = (
  handleSort: (field: string) => void,
  getSortIndicator: (field: string, activeColor?: string) => any,
) => {
  const BRAND_COLOR = '#843BEA'

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
      symbol: getSortIndicator('symbol', BRAND_COLOR),
      marketCap: getSortIndicator('marketCap', BRAND_COLOR),
      currentPrice: getSortIndicator('currentPrice', BRAND_COLOR),
      volume: getSortIndicator('volume', BRAND_COLOR),
      changPxPercent: getSortIndicator('changPxPercent', BRAND_COLOR),
    }),
    [getSortIndicator],
  )

  return { sortHandlers, sortIndicators }
}

const useCategoryManagement = (
  categoriesData: string[],
  handleGetSymbolList: (category: string) => void,
  categoryDataStore: Record<string, ISymbolList[]>,
  loadSymbolListFromCache: (
    condition: SymbolListCondition | 'favorite',
    category?: string,
  ) => Promise<any[] | undefined>,
  setIsLoadingSymbol: (value: SetStateAction<boolean>) => void,
) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (categoriesData?.length > 0 && !selectedCategory) {
      const firstCategory = categoriesData[0]
      setSelectedCategory(firstCategory)

      loadCategoryData(firstCategory)
    }
  }, [categoriesData, selectedCategory])

  const loadCategoryData = async (categoryName: string) => {
    if (categoryDataStore[categoryName]?.length > 0) {
      return
    }

    const cacheCondition = categoryName === CATEGORY_ALL ? 'volume' : 'category'
    const cacheKey = categoryName === CATEGORY_ALL ? undefined : categoryName

    const cachedData = await loadSymbolListFromCache(cacheCondition, cacheKey)

    if (cachedData && cachedData?.length !== 0) {
      dispatch(
        setCategoryData({
          category: categoryName,
          data: cachedData as ISymbolList[],
        }),
      )

      dispatch(
        setData({
          condition: 'category',
          data: cachedData as ISymbolList[],
        }),
      )
    } else {
      handleGetSymbolList(categoryName)
    }
  }

  const handleCategoryChange = useCallback(
    async (categoryValue: string) => {
      if (!categoryDataStore[categoryValue]?.length) {
        setIsLoadingSymbol(true)
      }

      setSelectedCategory(categoryValue)
      await loadCategoryData(categoryValue)
    },
    [handleGetSymbolList, categoryDataStore],
  )

  return { selectedCategory, handleCategoryChange }
}
const useTableColumnsWithSort = (sortHandlers: any, sortIndicators: any) => {
  const columnHelper = createColumnHelper<ISymbolList>()
  const { t } = useTranslation()
  return useMemo(
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
                  <PairName symbol={symbol} marketKind="futures" />
                  <LeverageBadge value={maxLeverage as unknown as string} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] text-[#908E98] lining-nums">{formatMoney(marketCap)}</div>
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
                color="#908E98"
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
}

const ClassificationList = ({ symbolData, type }: { symbolData: ISymbolList[]; type: string }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
  const {
    categories,
    categoryData,
    lists: { volume },
  } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  const {
    isLoading,
    isLoadingCategory,
    handleGetSymbolList,
    setIsLoadingSymbol,
    loadSymbolListFromCache,
    handleGetCategoryList,
    setIsLoadingCategory,
    loadCategoryListFromCache,
  } = useHandleGetData({
    condition: 'category',
    isCategory: true,
    skip: true,
  })

  const { selectedCategory, handleCategoryChange } = useCategoryManagement(
    categories,
    handleGetSymbolList,
    categoryData,
    loadSymbolListFromCache,
    setIsLoadingSymbol,
  )

  const currentData = useMergedData(selectedCategory ? categoryData?.[selectedCategory] : volume, symbolData)
  const { sortedData, handleSort, getSortIndicator } = useSortableTable<ISymbolList>(currentData)

  useEffect(() => {
    if (type === 'home') {
      setVisibleCount(DEFAULT_PAGE_SIZE)
    }
  }, [selectedCategory, type])

  const { sortHandlers, sortIndicators } = useSortHandlers(handleSort, getSortIndicator)
  const columns = useTableColumnsWithSort(sortHandlers, sortIndicators)

  const handleRowClick = useCallback(
    (row: ISymbolList) => {
      navigate(`/futures/${row.symbol}`)
    },
    [navigate],
  )

  const isTableLoading = useMemo(() => isLoading || isLoadingCategory, [isLoading, isLoadingCategory])

  useEffect(() => {
    const initializeCategoryList = async () => {
      if (categories.length !== 0) {
        setIsLoadingCategory(false)
        return
      }
      const cacheLoaded = await loadCategoryListFromCache()

      if (!cacheLoaded?.length) {
        await handleGetCategoryList()
      } else {
        dispatch(setCategories(cacheLoaded))
      }
      setIsLoadingCategory(false)
    }
    setIsLoadingSymbol(false)
    initializeCategoryList()
  }, [])

  const preloadCategoriesCache = async (categoriesList: string[]) => {
    for (const categoryName of categoriesList) {
      if (!categoryData[categoryName] || categoryData[categoryName].length === 0) {
        try {
          const cacheCondition = categoryName === CATEGORY_ALL ? 'volume' : 'category'
          const cacheKey = categoryName === CATEGORY_ALL ? undefined : categoryName

          const cachedData = await loadSymbolListFromCache(cacheCondition, cacheKey)

          if (cachedData && cachedData?.length > 0) {
            dispatch(
              setCategoryData({
                category: categoryName,
                data: cachedData as ISymbolList[],
              }),
            )
          }
        } catch (error) {
          console.warn(`Error preloading cache for category ${categoryName}:`, error)
        }
      }
    }
  }

  useEffect(() => {
    if (categories.length > 0) {
      preloadCategoriesCache(categories)
    }
  }, [categories])

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
  return (
    <div className="relative">
      <CategoryTabs
        tabs={categories}
        activeTab={selectedCategory}
        isLoadingCategory={isLoadingCategory}
        onTabChange={handleCategoryChange}
        className="sticky top-[36px] z-20 bg-[#0A0A0A]"
      />

      <TableVirtual<ISymbolList, any>
        isLoading={isTableLoading}
        columns={columns}
        data={visibleData}
        isStickyHeader={true}
        // tableClassName="table-fixed"
        // containerClassName={type === 'home' ? "!border-none _hidescrollbar !max-h-none !pb-0" : "!border-none _hidescrollbar"}
        containerClassName={`!border-none _hidescrollbar !overflow-visible`}
        cusTomMaxHeight={'none'}
        disableMaxHeight={true}
        tableHeaderClassName="text-[#908E98] text-[calc(1rem*(11/16))] font-[400] !top-[80px]"
        tableHeaderRowClassName="!border-none"
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-3 justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell bg-[#0A0A0A] w-27-precent h-3 py-1.5"
        onRowClick={handleRowClick}
        onBottomReached={onBottomReached}
        tableRowClassName="!border-none"
        isCategoryTab
        rowHeight={61}
        paddingBottom={type === 'home' ? '80px' : '0'}
        wrapperClassName="min-h-full"
        cusTomMaxHeightPC="100%"
      />
    </div>
  )
}

export default memo(ClassificationList)
