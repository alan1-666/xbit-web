import { memo, useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { useAppDispatch } from '@/redux/store'
import { routerActions } from '@/redux/modules/router.slice'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { ISymbolList } from '@/redux/modules/symbolList.slide'

interface CoinSelectDropdownVirtualProps {
  isOpen: boolean
  onClose: () => void
  currentSymbol: string
  className?: string
  anchorRef?: React.RefObject<HTMLElement>
}

type SortType = 'symbol' | 'price' | 'change' | 'funding' | 'volume'
type SortOrder = 'asc' | 'desc'

const useGetSymbolList = () => {
  const { data } = useReactQuery({
    queryKey: ['GET_SYMBOL_LIST_DROPDOWN'],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: {
          input: {
            condition: 'volume'
          }
        },
      })
      return res?.data
    },
    retry: 1,
    staleTime: 60 * 1000, // 1分钟缓存
  })

  return {
    symbolList: data?.getSymbolList?.list || [],
  }
}

// 创建表格列配置
const useDropdownColumns = (currentSymbol: string, onSymbolSelect: (symbol: string) => void) => {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<ISymbolList>()

  return useMemo(() => [
    // 币种信息列
    columnHelper.accessor('symbol', {
      header: () => (
        <div className="flex items-center gap-1 flex-1">
          <span>{t('tokenSearchDrawer.tableHeaders.token')}</span>
        </div>
      ),
      cell: (info) => {
        const { symbol, maxLeverage } = info.row.original
        const isCurrentSymbol = symbol === currentSymbol
        
        return (
          <div className={cn(
            "flex items-center gap-2 flex-1 min-w-0 cursor-pointer",
            isCurrentSymbol && "bg-[#ECECED]/8"
          )}>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-white text-sm">{symbol}</span>
                <span className="text-[#9AA4B2] text-xs">/USD</span>
                <span className="px-1.5 py-0.5 rounded bg-[#00FFB4]/10 text-[#00FF85] text-[10px] font-semibold uppercase">
                  {maxLeverage}x
                </span>
              </div>
            </div>
          </div>
        )
      },
    }),

    // 价格列
    columnHelper.accessor('currentPrice', {
      header: () => (
        <div className="flex items-center gap-1 w-28 justify-end">
          <span>{t('tokenSearchDrawer.tableHeaders.price')}</span>
        </div>
      ),
      cell: (info) => {
        const currentPrice = info.getValue()
        return (
          <div className="w-24 text-right">
            <div className="text-white text-sm font-medium">
              {formatNumberWithCommas(currentPrice?.toString() || '0', 6)}
            </div>
          </div>
        )
      },
    }),

    // 24h变化列
    columnHelper.accessor('changPxPercent', {
      header: () => (
        <div className="flex items-center gap-1 w-24 justify-end">
          <span>24h%</span>
        </div>
      ),
      cell: (info) => {
        const changePercent = Number(info.getValue()) || 0
        const isPositive = changePercent >= 0
        
        return (
          <div className="w-24 text-right">
            <div className={cn(
              "text-sm font-medium",
              isPositive ? "text-[#00C566]" : "text-[#F25461]"
            )}>
              {isPositive ? '+' : ''}{formatPercentage(changePercent)}%
            </div>
          </div>
        )
      },
    }),

    // 成交量列
    columnHelper.accessor('volume', {
      header: () => (
        <div className="flex items-center gap-1 w-36 justify-end">
          <span>{t('tokenSearchDrawer.tableHeaders.volume')}</span>
        </div>
      ),
      cell: (info) => {
        const volume = info.getValue()
        return (
          <div className="w-36 text-right">
            <div className="text-white/90 text-sm">
              {formatNumberWithCommas(volume?.toString() || '0', 2)}
            </div>
          </div>
        )
      },
    }),

    // 资金费列
    columnHelper.accessor('changPxPercent', {
      id: 'funding',
      header: () => (
        <div className="flex items-center gap-1 w-24 justify-end">
          <span>{t('futuresDetails.common.fundingRate')}</span>
        </div>
      ),
      cell: (info) => {
        const changePercent = Number(info.getValue()) || 0
        const isPositive = changePercent >= 0
        
        return (
          <div className="w-24 text-right">
            <div className={cn(
              "text-sm font-medium",
              isPositive ? "text-[#00C566]" : "text-[#F25461]"
            )}>
              {isPositive ? '+' : ''}{formatPercentage(changePercent)}%
            </div>
          </div>
        )
      },
    }),
  ], [t, currentSymbol, onSymbolSelect])
}

const CoinSelectDropdownVirtual = memo<CoinSelectDropdownVirtualProps>(({ 
  isOpen, 
  onClose, 
  currentSymbol, 
  className, 
  anchorRef 
}) => {
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

  const { symbolList } = useGetSymbolList()
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
      const dropdownWidth = 620
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

  // 搜索过滤
  const filteredSymbols = useMemo(() => {
    const currentList = activeTab === 'favorites' ? favoriteSymbols : symbolList

    if (!searchTerm) return currentList

    return currentList.filter(symbol =>
      symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [symbolList, favoriteSymbols, searchTerm, activeTab])

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

  const handleSymbolSelect = useCallback((symbolData: ISymbolList) => {
    dispatch(routerActions.setHeaderTab('crypto'))
    navigate(`/futures/${symbolData.symbol}`)
    onClose()
  }, [navigate, dispatch, onClose])

  // 创建表格列
  const columns = useDropdownColumns(currentSymbol, handleSymbolSelect)

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

      {/* 分类 Chips（占位，不改变列表）*/}
      <div className="px-5 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['全部','AI币','DeFi','Gaming','Layer1','Layer2'].map((c) => (
            <span
              key={c}
              className="shrink-0 px-3 py-1 rounded-lg text-[11px] bg-[#ECECED]/12 text-[#9AA4B2]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 虚拟化表格 */}
      <div className="h-[300px]">
        <TableVirtual<ISymbolList, any>
          columns={columns}
          data={sortedSymbols}
          isStickyHeader={false}
          onRowClick={handleSymbolSelect}
          containerClassName="!border-none _hidescrollbar h-full"
          tableHeaderClassName="text-[#FFFFFF80] text-[calc(1rem*(11/16))] font-[400] px-5 bg-[#232329]"
          tableHeaderRowClassName="!border-none"
          tableCellClassName="group-hover:!bg-[#ECECED14] cursor-pointer !border-none !py-3 px-5"
          emptyText={searchTerm ? t('wallet.noSearchResults') : t('wallet.noData')}
          tableRowClassName="!border-none transition-colors hover:bg-[#ECECED]/4"
          tableHeadClassName="px-0 h-[40px]"
          rowHeight={40}
          cusTomMaxHeight="300px"
        />
      </div>
    </div>
  )

  // 使用 portal 渲染到 body，避免父级 overflow/transform 影响
  return createPortal(dropdownNode, document.body)
})

CoinSelectDropdownVirtual.displayName = 'CoinSelectDropdownVirtual'

export default CoinSelectDropdownVirtual

// 仅用于在已有下拉布局中复用的虚拟化列表组件
// 父组件负责渲染搜索、tabs、表头等；该组件只渲染行，保持样式和点击逻辑
export const CoinSelectDropdownListVirtual = memo(function CoinSelectDropdownListVirtual({
  data,
  currentSymbol,
  onRowClick,
  rowHeight = 40,
}: {
  data: ISymbolList[]
  currentSymbol: string
  onRowClick: (symbol: ISymbolList) => void
  rowHeight?: number
}) {
  const columnHelper = createColumnHelper<ISymbolList>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => null,
        cell: (info) => {
          const { symbol, maxLeverage } = info.row.original
          const isCurrentSymbol = symbol === currentSymbol
          return (
            <div
              className={cn(
                'flex items-center px-4 py-3 cursor-pointer transition-colors',
                'hover:bg-[#ECECED]/4',
                isCurrentSymbol && 'bg-[#ECECED]/8',
              )}
              onClick={() => onRowClick(info.row.original)}
            >
              {/* 币种信息 */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-white text-sm">{symbol}</span>
                    <span className="text-[#9AA4B2] text-xs">/USD</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#00FFB4]/10 text-[#00FF85] text-[10px] font-semibold uppercase">{maxLeverage}x</span>
                  </div>
                </div>
              </div>

              {/* 价格 */}
              <div className="w-24 text-right">
                <div className="text-white text-sm font-medium">
                  {formatNumberWithCommas(info.row.original.currentPrice?.toString() || '0', 6)}
                </div>
              </div>

              {/* 24h变化 */}
              <div className="w-24 text-right">
                {(() => {
                  const changePercent = Number(info.row.original.changPxPercent) || 0
                  const isPositive = changePercent >= 0
                  return (
                    <div
                      className={cn('text-sm font-medium', isPositive ? 'text-[#00C566]' : 'text-[#F25461]')}
                    >
                      {isPositive ? '+' : ''}
                      {formatPercentage(changePercent)}%
                    </div>
                  )
                })()}
              </div>

              {/* 成交量 */}
              <div className="w-36 text-right">
                <div className="text-white/90 text-sm">
                  {formatNumberWithCommas(info.row.original.volume?.toString() || '0', 2)}
                </div>
              </div>

              {/* 资金费（使用 changPxPercent 字段显示） */}
              <div className="w-24 text-right">
                {(() => {
                  const changePercent = Number(info.row.original.changPxPercent) || 0
                  const isPositive = changePercent >= 0
                  return (
                    <div
                      className={cn('text-sm font-medium', isPositive ? 'text-[#00C566]' : 'text-[#F25461]')}
                    >
                      {isPositive ? '+' : ''}
                      {formatPercentage(changePercent)}%
                    </div>
                  )
                })()}
              </div>
            </div>
          )
        },
      }),
    ],
    [currentSymbol, onRowClick],
  )

  return (
    <TableVirtual<ISymbolList, any>
      columns={columns}
      data={data}
      isStickyHeader={false}
      isShowHeader={false}
      onRowClick={onRowClick as any}
      containerClassName="!border-none _hidescrollbar h-full"
      tableHeaderClassName=""
      tableHeaderRowClassName="!border-none"
      tableCellClassName="!border-none !py-0 px-0"
      tableRowClassName="!border-none"
      tableHeadClassName="px-0 h-0"
      rowHeight={rowHeight}
      cusTomMaxHeight="300px"
    />
  )
})

