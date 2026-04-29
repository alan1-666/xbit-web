import { memo, useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { useAppDispatch } from '@/redux/store'
import { routerActions } from '@/redux/modules/router.slice'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_SYMBOL_LIST, GET_CATEGORY_LIST } from '@/services/symbol.dex.service'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import CategoryTabs from '@/pages/futures-market/components/CategoryTabsPC'
import { CATEGORY_ALL } from '@/pages/futures-market/hooks/useHandleGetData'
import { CoinSelectDropdownListVirtual } from './CoinSelectDropdownVirtual'

interface CoinSelectDropdownProps {
  isOpen: boolean
  onClose: () => void
  currentSymbol: string
  className?: string
  anchorRef?: React.RefObject<HTMLElement>
}

type SortType = 'symbol' | 'price' | 'change' | 'funding' | 'volume'
type SortOrder = 'asc' | 'desc'

const useGetCategories = () => {
  const { data, isFetching } = useReactQuery({
    queryKey: ['GET_CATEGORY_LIST'],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_CATEGORY_LIST,
      })
      return res?.data
    },
    retry: 1,
    staleTime: 60 * 60 * 1000,
  })

  return {
    categories: [CATEGORY_ALL, ...(data?.getCategory?.categories || [])],
    loading: !data && isFetching,
  }
}

const useGetSymbolListByCategory = (condition: 'category', categoryArgs?: string) => {
  let input: { condition: 'category' | 'volume'; category?: string } = {
    condition: condition === 'category' && categoryArgs === CATEGORY_ALL ? 'volume' : condition,
  }

  if (condition === 'category' && categoryArgs && categoryArgs !== CATEGORY_ALL) {
    input = {
      condition: 'category',
      category: categoryArgs,
    }
  }

  const { data, isFetching } = useReactQuery({
    queryKey: ['GET_SYMBOL_LIST_DROPDOWN', condition, categoryArgs],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input },
      })
      return res?.data
    },
    retry: 1,
  })

  return {
    symbolList: data?.getSymbolList?.list || [],
    loading: !data && isFetching,
  }
}

const CoinSelectDropdown = memo<CoinSelectDropdownProps>(({ isOpen, onClose, currentSymbol, className, anchorRef }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortType, setSortType] = useState<SortType>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [activeTab, setActiveTab] = useState<'contracts' | 'favorites'>('contracts')
  const tabs = useMemo(() => [
    { value: 'favorites', label: t('tokenSearchDrawer.tabs.favorites') },
    { value: 'contracts', label: t('futuresDetails.common.contract') },
  ], [t])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab((tab as 'contracts' | 'favorites'))
  }, [])

  // 分类 tabs 逻辑（仅 UI 展示，不影响现有列表数据与排序逻辑）
  const { categories, loading: isLoadingCategory } = useGetCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_ALL)
  const handleCategoryChange = useCallback((categoryValue: string) => {
    setSelectedCategory(categoryValue)
  }, [])

  const { symbolList: categorySymbolList } = useGetSymbolListByCategory('category', selectedCategory)
  const {
    symbolsFavorite: favoriteSymbols,
    getFavoriteSymbols,
  } = useHandleGetData({
    condition: 'volume',
    isFavorite: isOpen,
    isDisabledNomalList: true,
  })

  // 获取自选列表
  useEffect(() => {
    if (isOpen) {
      getFavoriteSymbols()
    }
  }, [isOpen, getFavoriteSymbols])

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 计算定位（基于锚点元素）
  useLayoutEffect(() => {
    if (!isOpen) return
    const updatePosition = () => {
      const anchorEl = anchorRef?.current
      if (!anchorEl) return
      const rect = anchorEl.getBoundingClientRect()
      const dropdownWidth = 480
      const gap = 8 // 与锚点的间距，对应 mt-2
      let left = rect.left
      // 右侧不越界
      left = Math.min(left, window.innerWidth - dropdownWidth - 8)
      left = Math.max(8, left)
      const top = rect.bottom + gap
      setPosition({ top, left, width: dropdownWidth })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, anchorRef])

  // 搜索过滤（“合约”使用分类后的数据，“自选”使用自选列表）
  const filteredSymbols = useMemo(() => {
    const currentList = activeTab === 'favorites' ? favoriteSymbols : categorySymbolList

    if (!searchTerm) return currentList

    return currentList.filter(symbol =>
      symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categorySymbolList, favoriteSymbols, searchTerm, activeTab])

  // 排序
  const sortedSymbols = useMemo(() => {
    const sorted = [...filteredSymbols].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortType) {
        case 'symbol':
          aValue = a.symbol
          bValue = b.symbol
          break
        case 'price':
          aValue = Number(a.currentPrice) || 0
          bValue = Number(b.currentPrice) || 0
          break
        case 'change':
          aValue = Number(a.changPxPercent) || 0
          bValue = Number(b.changPxPercent) || 0
          break
        case 'funding':
          // 这里按照需求使用 changPxPercent 字段
          aValue = Number(a.changPxPercent) || 0
          bValue = Number(b.changPxPercent) || 0
          break
        case 'volume':
          aValue = Number(a.volume) || 0
          bValue = Number(b.volume) || 0
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [filteredSymbols, sortType, sortOrder])

  const DEFAULT_SORT: { type: SortType; order: SortOrder } = useMemo(() => ({ type: 'volume', order: 'desc' }), [])

  const setSortAsc = useCallback((type: SortType) => {
    // 若再次点击同列同方向，则重置为默认排序
    if (sortType === type && sortOrder === 'asc') {
      setSortType(DEFAULT_SORT.type)
      setSortOrder(DEFAULT_SORT.order)
      return
    }
    setSortType(type)
    setSortOrder('asc')
  }, [sortType, sortOrder, DEFAULT_SORT])

  const setSortDesc = useCallback((type: SortType) => {
    // 若再次点击同列同方向，则重置为默认排序
    if (sortType === type && sortOrder === 'desc') {
      setSortType(DEFAULT_SORT.type)
      setSortOrder(DEFAULT_SORT.order)
      return
    }
    setSortType(type)
    setSortOrder('desc')
  }, [sortType, sortOrder, DEFAULT_SORT])

  const handleSymbolSelect = useCallback((symbol: string) => {
    dispatch(routerActions.setHeaderTab('crypto'))
    navigate(`/futures/${symbol}`)
    onClose()
  }, [navigate, dispatch, onClose])

  const getSortIcon = useCallback((type: SortType) => {
    const isActive = sortType === type
    const upActive = isActive && sortOrder === 'asc'
    const downActive = isActive && sortOrder === 'desc'

    return (
      <div className="flex flex-col ml-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSortAsc(type) }}
          className="leading-none"
          aria-label="sort-asc"
        >
          <img
            src="/images/futuresDetail/triangle.svg"
            alt="asc"
            className={cn("w-1.5 h-1.5 rotate-180", upActive ? "opacity-100" : "opacity-50")}
          />
          
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSortDesc(type) }}
          className="leading-none"
          aria-label="sort-desc"
        >
          <img
            src="/images/futuresDetail/triangle.svg"
            alt="desc"
            className={cn("w-1.5 h-1.5", downActive ? "opacity-100" : "opacity-50")}
          />
        </button>
      </div>
    )
  }, [sortType, sortOrder, setSortAsc, setSortDesc])

  if (!isOpen) return null

  const dropdownNode = (
    <div
      ref={dropdownRef}
      className={cn(
        "w-[620px] bg-[#232329] rounded-2xl shadow-2xl z-[1100] text-white",
        className
      )}
      style={{
        position: 'fixed',
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
      }}
    >
      {/* 顶部标题与关闭 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2E39]">
        <div className="text-sm text-[#C7CBD5]">{t('search.search')}</div>
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#9AA4B2]">
            <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"/>
          </svg>
        </button>
      </div>

      {/* 搜索框 */}
      <div className="px-5 pt-4 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA4B2]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t('tokenSearchDrawer.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#ECECED]/8 rounded-4xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563]"
          />
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex items-center px-5 gap-3">
        <div className="w-full">
          <MovingLineTabs
            tabs={tabs}
            defaultTab={activeTab}
            onTabChange={handleTabChange}
            containerClassName="after:hidden w-full linear-gradien-border-buttom rounded-t-[8px] p-0 bg-inherit z-1 relative "
            tabsClassName="w-full px-2 gap-x-4"
            wrapperClassName="z-1"
            itemClassName={'font-[400] text-[calc(1rem*(15/16))] px-0'}
            tabsListClassName="p-0"
            itemClassNameActive="!text-[calc(1rem*(16/16))] !font-[500]"
          />
        </div>
      </div>

      {/* 分类 Tabs（采用 ContractSection 的 CategoryTabs 逻辑，仅 UI 展示）*/}
      <div className="px-5 pt-3 pb-2">
        <CategoryTabs
          tabs={categories}
          activeTab={selectedCategory}
          isLoadingCategory={isLoadingCategory}
          onTabChange={handleCategoryChange}
        />
      </div>

      {/* 表头 */}
      <div className="flex items-center px-5 py-2 text-[11px] text-[#fff]/50">
        <div className="flex items-center gap-1 flex-1">
          <span>{t('tokenSearchDrawer.tableHeaders.token')}</span>
          {getSortIcon('symbol')}
        </div>
        <div className="flex items-center gap-1 w-28 justify-end">
          <span>{t('tokenSearchDrawer.tableHeaders.price')}</span>
          {getSortIcon('price')}
        </div>
        <div className="flex items-center gap-1 w-24 justify-end">
          <span>{t('tokenSearchDrawer.tableHeaders.24hChange')}</span>
          {getSortIcon('change')}
        </div>
        <div className="flex items-center gap-1 w-36 justify-end">
          <span>{t('tokenSearchDrawer.tableHeaders.volume')}</span>
          {getSortIcon('volume')}
        </div>
        <div className="flex items-center gap-1 w-24 justify-end">
          <span>{t('futuresDetails.common.fundingRate')}</span>
          {getSortIcon('funding')}
        </div>
      </div>

      {/* 列表内容 */}
      <div className="max-h-[300px] overflow-y-auto">
        {sortedSymbols.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[#9AA4B2] text-sm">
            {searchTerm ? t('wallet.noSearchResults') : t('wallet.noData')}
          </div>
        ) : (
          <CoinSelectDropdownListVirtual
            data={sortedSymbols as any}
            currentSymbol={currentSymbol}
            onRowClick={(row) => handleSymbolSelect(row.symbol)}
            rowHeight={40}
          />
        )}
      </div>
    </div>
  )

  if (!isOpen) return null
  // 使用 portal 渲染到 body，避免父级 overflow/transform 影响
  return createPortal(dropdownNode, document.body)
})

CoinSelectDropdown.displayName = 'CoinSelectDropdown'

export default CoinSelectDropdown
