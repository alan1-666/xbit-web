import { cn } from '@/lib/utils'
import { DataTable, DataTableProps } from '@/pages/home/data-table'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { ColumnDef, HeaderContext } from '@tanstack/react-table'
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconCheckCircleSolid, IconFilter, IconFiltered, IconFilteredHead, IconSortDown, IconSortUp } from '../icon'
import XTooltip from './XTooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { PAGE_SIZE } from '@/lib/constant'

export type TSortDirection = 'asc' | 'desc' | false

export type TSortConfig = {
  key: string
  value: TSortDirection
}

export function XCustomSortFunction<TData, TValue>(
  rowA: TData,
  rowB: TData,
  callback: (row: TData) => TValue,
  type: 'string' | 'number' | 'date' | 'value',
  defaultDirection: 'asc' | 'desc' = 'desc',
) {
  const valueA = callback(rowA)
  const valueB = callback(rowB)
  if (type === 'string') {
    return (
      String(valueA).localeCompare(String(valueB), undefined, { numeric: true, sensitivity: 'base' }) *
      (defaultDirection === 'asc' ? -1 : 1)
    )
  }
  if (type === 'number') {
    return (Number(valueA) - Number(valueB)) * (defaultDirection === 'asc' ? -1 : 1)
  }
  if (type === 'date') {
    const dateA = new Date(valueA as string | number | Date).getTime()
    const dateB = new Date(valueB as string | number | Date).getTime()
    return (dateA - dateB) * (defaultDirection === 'asc' ? 1 : -1)
  }
  if (type === 'value') {
    return (Number(valueA) - Number(valueB)) * (defaultDirection === 'asc' ? -1 : 1)
  }
  return 0
}

/**
 * Props for the XSortHead component
 */
export interface SortHeadProps extends HeaderContext<any, any> {
  /** Translation key for the sort header text */
  tKey: string
  /** Additional CSS classes for styling */
  className?: string
  /** Initial sort value - 'asc' for ascending, 'desc' for descending, false for no sort */
  initialSort?: TSortDirection
  /** Callback function called when sort direction changes */
  onSortChange?: (sort: TSortDirection) => void
  /** If true, the sort will be handled by the client-side logic */
  isSortClient?: boolean
  /** If true, the sort will be handled by the server-side logic */
  isClientSort?: boolean
  /** If false, sorting cannot be removed (only toggle between asc/desc). Default: true */
  enableSortingRemoval?: boolean
}

export const XSortHead = (props: SortHeadProps) => {
  const { column, tKey, className = '', initialSort = false, onSortChange, isClientSort = true, enableSortingRemoval = true } = props
  const { isDesktop } = useResponsive()
  const [sort, setSort] = useState<TSortDirection>(initialSort)
  useEffect(() => {
    if (isClientSort) {
      //set column toggle sorting
      switch (initialSort) {
        case false:
          column.clearSorting()
          break
        case 'desc':
          column.toggleSorting(true)
          break
        case 'asc':
          column.toggleSorting(false)
          break
        default:
          break
      }
    }
  }, [initialSort])
  const toggleSort = () => {
    if (isClientSort) {
      switch (sort) {
        case false:
          column.toggleSorting(true)
          onSortChange?.('desc')
          setSort('desc')
          break
        case 'desc':
          column.toggleSorting(false)
          onSortChange?.('asc')
          setSort('asc')
          break
        case 'asc':
          if (enableSortingRemoval) {
            column.clearSorting()
            onSortChange?.(false)
            setSort(false)
          } else {
            // Skip unsorted state, go back to desc
            column.toggleSorting(true)
            onSortChange?.('desc')
            setSort('desc')
          }
          break
        default:
          break
      }
    } else {
      onSortChange?.(sort)
    }
  }
  return (
    <div className={cn('text-[calc(11rem/16)] flex items-center text-[#FFFFFF80]', className)}>
      <div className="flex items-center cursor-pointer select-none" onClick={toggleSort}>
        <span className={cn('w-max', isDesktop ? 'text-[12px]' : 'text-[11px]')}>{tKey}</span>
        <div className="flex flex-col !size-[14px] items-center">
          <IconSortUp currentColor={sort === 'asc' ? 'var(--impartal)' : '#FFFFFF50'} />
          <IconSortDown currentColor={sort === 'desc' ? 'var(--impartal)' : '#FFFFFF50'} />
        </div>
      </div>
    </div>
  )
}

/**
 * Props for the XFilterHead component
 */
export interface FilterHeadProps extends HeaderContext<any, any> {
  /** The title displayed in the filter header */
  headTitle?: string
  /** The title displayed in the filter drawer */
  title?: string
  /** title className */
  titleClassName?: string
  /** Array of filter items with label and value */
  items: {
    label: string
    value: string
  }[]
  /** Initial filter value to be selected */
  initialFilter?: string
  /** Callback function called when filter value changes */
  onChangeFilter?: (value: string) => void
  /** Whether to show the filter icon */
  useIconFilter?: boolean
  /** If true, the filter will be handled by the search functionality */
  useSearch?: boolean
  /** If true, the filter will be handled by the client-side logic */
  isClientFilter?: boolean
  /** mobile or pc */
  isPC?: boolean
}

export const XFilterHead = memo((props: FilterHeadProps) => {
  const {
    column,
    initialFilter = '',
    onChangeFilter,
    items,
    headTitle,
    title,
    titleClassName = '',
    useIconFilter = true,
    useSearch = false,
    isClientFilter = true,
    isPC = false,
  } = props
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<string>(initialFilter)
  const { t } = useTranslation()
  useEffect(() => {
    if (isClientFilter) {
      column.setFilterValue(initialFilter)
    }
  }, [initialFilter])
  const onSelect = (value: string) => {
    setSelectedItem(value)
    setOpen(false)
    onChangeFilter?.(value)
    // Always update the column filter value to trigger onColumnFiltersChange
    if (isClientFilter) {
      column.setFilterValue(value)
    }
  }
  const toggle = () => {
    setOpen(!open)
  }

  const filteredItems = useMemo(() => {
    if (!search) return items
    return items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
  }, [search, items])
  return isPC ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          <span className={cn('whitespace-nowrap', isPC ? 'text-[12px]' : 'text-[11px]')}>{headTitle}</span>
          <span className="-ml-[1px]">
            {useIconFilter ? (
              selectedItem == items[0].value ? (
                <IconFilter className="!size-[14px]" />
              ) : (
                <IconFiltered className="!size-[14px] fill-white/50" />
              )
            ) : (
              <IconFilteredHead
                className="!size-[14px]"
                currentColor={selectedItem == items[0].value ? 'var(--impartal)' : '#878787'}
              />
            )}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('bg-[#232329] border border-[#ECECED0A] !p-0 w-[100px]', useSearch && 'w-[240px]')}
      >
        {title ? (
          <div
            className={cn(
              'text-[14px] leading-[1rem] text-[#FCFCFC] font-regular min-h-[38px] flex items-center px-[8px]',
              titleClassName,
            )}
          >
            {title}
          </div>
        ) : null}
        <div className="px-[0px]">
          {useSearch ? (
            <div className="mt-[6px] w-full flex items-center justify-between py-[calc(1rem*(13/16))] px-[calc(1rem*(15/16))] border-[0.5px] border-solid border-[#79778C29] rounded-[calc(1rem*(18/16))] text-[calc(1rem*(14/16))] mx-[8px]">
              <img alt="" className="size-[calc(1rem*(18/16))] mr-[8px]" src="/images/icons/search-icon.svg" />
              <input
                className="w-full h-full text-[#FFFFFFB2]"
                placeholder={t('walletCopy.searchToken')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          ) : null}
          <div className={cn('max-h-[235px] overflow-y-auto pr-0 pl-[8px]', useSearch && 'mt-[12px]', isPC && 'mt-0')}>
            {(useSearch ? filteredItems : items).map((item) => (
              <DropdownMenuItem
                key={item.value}
                className={cn(
                  'focus:bg-[] cursor-pointer min-h-[36px] flex items-center',
                  selectedItem === item.value ? 'bg-[#2A2839] text-[#FFFFFF]' : 'text-[#79778C]',
                )}
                onClick={() => {
                  onSelect(item.value)
                }}
              >
                <span className={cn('block text-[14px]', isPC && 'text-center')}>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          <span className={cn('whitespace-nowrap', isPC ? 'text-[12px]' : 'text-[11px]')}>{headTitle}</span>
          <span className="-ml-[1px]">
            {useIconFilter ? (
              selectedItem == items[0].value ? (
                <IconFilter className="!size-[14px]" />
              ) : (
                <IconFiltered className="!size-[14px] fill-white/50" />
              )
            ) : (
              <IconFilteredHead className="!size-[14px]" />
            )}
          </span>
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
          <DrawerHeader className="py-0 px-[12px] flex w-full items-center justify-between">
            <DialogTitle className="text-[calc(18rem/16)] leading-[calc(18rem/16)] app-font-medium mb-0.5 text-[#FFFFFF] flex items-center justify-between w-full">
              <span className={titleClassName}>{title}</span>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt=""
              />
            </DialogTitle>
          </DrawerHeader>
          <div className="px-[12px]">
            {useSearch ? (
              <div className="mt-[6px] w-full flex items-center justify-between py-[calc(1rem*(13/16))] px-[calc(1rem*(15/16))] bg-[#ECECED14] border-[0.5px] border-solid border-[#ECECED14] rounded-[calc(1rem*(18/16))] text-[calc(1rem*(14/16))]">
                <input
                  className="w-full h-full text-[#FFFFFFB2]"
                  placeholder={t('walletCopy.searchToken')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <img alt="" className="size-[calc(1rem*(18/16))]" src="/images/icons/search-icon.svg" />
              </div>
            ) : null}
            <div className="py-3">
              {(useSearch ? filteredItems : items).map((item, i) => (
                <div
                  key={item.value}
                  className={cn(
                    'py-4 border-b text-[1rem] app-font-medium flex items-center justify-between cursor-pointer border-t-[#ECECED00]',
                    i === 0 && 'border-t-0',
                  )}
                  onClick={() => onSelect(item.value)}
                >
                  <span className="text-[16px] leading-[1rem] text-white">{item.label}</span>
                  {selectedItem === item.value && <IconCheckCircleSolid />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
})

/**
 * Props for the XNormalHead component
 */
interface NormalHeadProps {
  /** Translation key for the header text */
  tKey?: string
  /** React children to render inside the header */
  children?: ReactNode
  /** Click handler for the header */
  onClick?: () => void
  /** Additional CSS classes for styling */
  className?: string
  /** Tooltip text to display on hover */
  tooltip?: string
  /** isPC: true if the component is in a PC environment */
  isPC?: boolean
}

export const XNormalHead = (props: NormalHeadProps) => {
  const { tKey, children, onClick, className, tooltip } = props
  const { isDesktop: isPC } = useResponsive()
  return (
    <div
      className={cn(
        'flex font-normal items-center w-max select-none cursor-default capitalize',
        isPC ? 'text-inherit text-[12px]' : 'text-[#FFFFFF80] text-[11px]',
        className,
      )}
      onClick={onClick}
    >
      {children ?? tKey}
      {tooltip && <XTooltip description={tooltip} title={tKey} />}
    </div>
  )
}

/**
 * Base props for the DataTableInfiniteScroll component
 */
type DataTableInfiniteScrollPropsBase<TData, TValue> = {
  /** Column definitions for the table */
  columns: ColumnDef<TData, TValue>[]
  /** Data to display in the table */
  data: TData[]
  /** Whether the table is in a loading state */
  isLoading?: boolean
  /** Whether more data is being fetched */
  isFetchingMore?: boolean
  /** Function to call when more data needs to be loaded */
  fetchMore?: () => void
  /** Whether there is more data available to load */
  hasMore?: boolean
  /** Additional props to pass to the underlying DataTable component */
  tableProps?: Partial<DataTableProps<TData, TValue>>
  /** Text to display when there is no data */
  noDataText?: string
  /** Configuration for initial sort state */
  sortConfig?: Record<string, TSortDirection>
  /** Configuration for initial filter state */
  filtersConfig?: Record<string, string>
  /** Whether to show a blank state when there is no data */
  showBlankState?: boolean
  isFollowed?: boolean
  isConnected?: boolean
}

/**
 * Props for DataTableInfiniteScroll with caching enabled
 */
type DataTableInfiniteScrollPropsWithCache<TData, TValue> = DataTableInfiniteScrollPropsBase<TData, TValue> & {
  /** Enable caching functionality */
  enableCache: true
  /** Unique key for storing cached data in localStorage */
  cacheKey: string
}

/**
 * Props for DataTableInfiniteScroll without caching
 */
type DataTableInfiniteScrollPropsWithoutCache<TData, TValue> = DataTableInfiniteScrollPropsBase<TData, TValue> & {
  /** Disable caching functionality */
  enableCache?: false
  /** Cache key is not allowed when caching is disabled */
  cacheKey?: never
}

/**
 * Union type for DataTableInfiniteScroll props - either with or without caching
 */
type DataTableInfiniteScrollProps<TData, TValue> =
  | DataTableInfiniteScrollPropsWithCache<TData, TValue>
  | DataTableInfiniteScrollPropsWithoutCache<TData, TValue>

export function DataTableInfiniteScroll<TData, TValue>({
  columns,
  data,
  isLoading = false,
  fetchMore,
  isFetchingMore = false,
  hasMore = true,
  tableProps = {
    isStickyHeader: true,
    isStickyFirstColumn: true,
    stickyBg: 'bg-white dark:bg-gray-800',
  },
  noDataText,
  enableCache = false,
  cacheKey = '',
  sortConfig,
  filtersConfig,
  showBlankState = true,
  isFollowed = false,
  isConnected = false,
}: DataTableInfiniteScrollProps<TData, TValue>) {
  const fetchingRef = useRef(false)
  const refTable = useRef<HTMLDivElement>(null)
  // Convert sortConfig to TanStack table's SortingState format
  const initialSorting = useMemo(() => {
    if (!sortConfig) return []
    const sorting: Array<{ id: string; desc: boolean }> = []
    Object.entries(sortConfig).forEach(([key, value]) => {
      if (value !== false) {
        sorting.push({
          id: key,
          desc: value === 'desc',
        })
      }
    })

    return sorting
  }, [sortConfig])
  //scrollTop on data change
  useEffect(() => {
    if (refTable.current && data.length <= PAGE_SIZE) {
      refTable.current.scrollTop = 0
    }
  }, [data])

  const initialFilters = useMemo(() => {
    if (!filtersConfig) return []
    return Object.entries(filtersConfig).map(([key, value]) => ({
      id: key,
      value,
    }))
  }, [filtersConfig])

  /**
   * Effect if enableCache is true, to handle cache logic
   * If the cache is enabled and a cache key is provided, it will attempt to retrieve
   * cached data from localStorage and use it to populate the table.
   */
  useEffect(() => {
    if (enableCache && cacheKey) {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          if (Array.isArray(parsedData)) {
            // If the data is an array, we can use it directly
            data = parsedData
          } else {
            // If the data is not an array, we can log an error or handle it accordingly
            console.error(`Cached data for key ${cacheKey} is not an array`)
          }
        } catch (error) {
          console.error(`Error parsing cached data for key ${cacheKey}:`, error)
        }
      }
    }
  }, [enableCache, cacheKey])

  const handleBottomReached = useCallback(() => {
    
    if (fetchMore && hasMore && !fetchingRef.current && !isFetchingMore) {
      fetchingRef.current = true
      Promise.resolve(fetchMore()).finally(() => {
        fetchingRef.current = false
      })
    }
  }, [fetchMore, hasMore])

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetchMore={isFetchingMore}
      onBottomReached={handleBottomReached}
      noDataText={noDataText}
      initialSorting={initialSorting}
      initialFilters={initialFilters}
      showBlankState={showBlankState}
      isFollowed={isFollowed}
      isConnected={isConnected}
      ref={refTable}
      {...tableProps}
    />
  )
}

XFilterHead.displayName = 'XFilterHead'
