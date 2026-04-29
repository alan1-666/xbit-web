import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  Row,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React, { useState, useCallback, useMemo, memo, forwardRef, useEffect, RefObject, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { IconEmpty, IconSortDown, IconSortUp } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { SkeletonList } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { LoadMore } from '@/components/ui/loading-spinner'
import { debounce } from 'lodash-es'
import { ConnectWalletPrompt } from '@components/memeDetail/MemeDetailBottomTabsPc.tsx'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  isLoading?: boolean
  skeletonComponent?: React.ReactNode
  data: TData[]
  isStickyHeader?: boolean
  isStickyFirstColumn?: boolean
  stickyBg?: string
  containerClassName?: string
  tableClassName?: string
  tableHeaderClassName?: string
  tableHeaderRowClassName?: string
  tableHeadClassName?: string
  tableBodyClassName?: string
  tableBodyRowClassName?: string
  tableCellClassName?: string
  onRowClick?: (data: TData) => void
  onBottomReached?: () => void
  isFetchMore?: boolean
  ref?: React.Ref<HTMLDivElement>
  noDataText?: string
  noDataClassName?: string
  isShowCta?: boolean
  emptyComponent?: React.ReactNode
  initialSorting?: SortingState
  initialFilters?: ColumnFiltersState
  //range 0-1
  percentageLoadMore?: number
  isShowLoadMore?: boolean
  useScrollWindow?: boolean
  showBlankState?: boolean
  iconEmptyComponent?: React.ReactNode
  isConnected?: boolean
  isFollowed?: boolean
  // Row styling props
  oddRowClassName?: string
  evenRowClassName?: string
  loadMoreRef?: RefObject<null>
  isSortFE?: boolean
  shadowFirstColumn?: string
  isLostNetwork?: boolean
  /** If false, sorting cannot be removed (only toggle between asc/desc). Default: true */
  enableSortingRemoval?: boolean
}

export const EmptyState = memo<{
  noDataText?: string
  noDataClassName?: string
  isShowCta?: boolean
  iconEmptyComponent?: React.ReactNode
}>(({ noDataText, noDataClassName, isShowCta, iconEmptyComponent }) => {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10',
        noDataClassName,
      )}
    >
      {iconEmptyComponent}
      <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">
        {noDataText ?? t('history.nodata')}
      </span>
      {isShowCta && (
        <Link
          to={'/meme/smart-money?walletType=SmartMoney&tab=topTalents'}
          className="purple-btn-gradient !max-h-[42px] mt-4 text-white text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px_12.5px] rounded-[50px]"
        >
          {t('emptyFollowing.cta')}
        </Link>
      )}
    </div>
  )
})

interface NoDataStateProps {
  isFollowed: boolean
  isConnected: boolean
  emptyComponent?: React.ReactNode
  noDataText?: string
  noDataClassName?: string
  isShowCta?: boolean
  iconEmptyComponent?: React.ReactNode
}

const NoDataState = ({
  isFollowed,
  isConnected,
  emptyComponent,
  noDataText,
  noDataClassName,
  isShowCta,
  iconEmptyComponent,
}: NoDataStateProps) => {
  if (isFollowed && !isConnected) {
    return <NotLoginState isConnected={isConnected} />
  }
  return emptyComponent ? (
    emptyComponent
  ) : (
    <EmptyState
      noDataText={noDataText}
      noDataClassName={noDataClassName}
      isShowCta={isShowCta}
      iconEmptyComponent={iconEmptyComponent}
    />
  )
}

export const NotLoginState = memo<{ isConnected?: boolean }>(({ isConnected }) => {
  const { t } = useTranslation()
  const [openDrawer, setOpenDrawer] = useState(false)
  const handleOnLogin = () => {
    if (!isConnected) setOpenDrawer(true)
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10',
      )}
    >
      <ConnectWalletPrompt onLogin={handleOnLogin} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} t={t} />
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

interface TableRowComponentProps {
  row: Row<any>
  columns: ColumnDef<any, any>[]
  isStickyFirstColumn?: boolean
  stickyBg?: string
  tableBodyRowClassName?: string
  tableCellClassName?: string
  onRowClick?: (data: any) => void
  isFetchMore?: boolean
  skeletonComponent?: React.ReactNode
  oddRowClassName?: string
  evenRowClassName?: string
  isOdd: boolean
  shadowFirstColumn?: string
}

const TableRowComponent = ({
  row,
  columns,
  isStickyFirstColumn,
  stickyBg,
  tableBodyRowClassName,
  tableCellClassName,
  onRowClick,
  isFetchMore,
  skeletonComponent,
  oddRowClassName,
  evenRowClassName,
  isOdd,
  shadowFirstColumn
}: TableRowComponentProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick?.(row.original)
  }, [onRowClick, row.original])

  const rowClassName = cn(tableBodyRowClassName, isOdd ? oddRowClassName : evenRowClassName)

  // Memoize columns.length to avoid recalculation
  const columnsLength = columns.length

  return (
    <TableRow data-state={row.getIsSelected() && 'selected'} className={rowClassName} onClick={handleRowClick}>
      {row.getVisibleCells().map((cell, index) => (
        <TableCell
          key={cell.id}
          className={cn('z-0', tableCellClassName, index === 0 && isStickyFirstColumn && 'sticky left-0 z-1 bg-inherit bg-clip-padding', 
            index === 0 && isStickyFirstColumn && shadowFirstColumn,
          )}
          style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      {isFetchMore && (
        <TableCell colSpan={columnsLength} className={cn('h-24 text-center', tableCellClassName)}>
          {skeletonComponent}
        </TableCell>
      )}
    </TableRow>
  )
}

export const DataTable = forwardRef<HTMLDivElement, DataTableProps<any, any>>(
  (
    {
      columns,
      data,
      isLoading = false,
      skeletonComponent: skeletonComponentProps,
      isStickyHeader,
      isStickyFirstColumn,
      stickyBg,
      containerClassName,
      tableClassName,
      tableHeaderClassName,
      tableHeaderRowClassName,
      tableHeadClassName,
      tableBodyClassName,
      tableBodyRowClassName,
      tableCellClassName,
      onRowClick,
      onBottomReached,
      isFetchMore,
      noDataText,
      isShowCta = false,
      noDataClassName = '',
      emptyComponent,
      initialSorting = [],
      initialFilters = [],
      percentageLoadMore = 0.75,
      isShowLoadMore = false,
      useScrollWindow = false,
      showBlankState = true,
      iconEmptyComponent = <IconEmpty />,
      isConnected = false,
      isFollowed = false,
      oddRowClassName,
      evenRowClassName,
      loadMoreRef,
      isSortFE = false,
      shadowFirstColumn,
      isLostNetwork = false,
      enableSortingRemoval = true,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const { t } = useTranslation()
    const [sorting, setSorting] = useState<SortingState>(initialSorting)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters)
    const skeletonComponent = useMemo(() => {
      if (!skeletonComponentProps) return <SkeletonList count={10} classNameItem="h-[97px]" />
      return skeletonComponentProps
    }, [skeletonComponentProps])

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
      enableSortingRemoval: enableSortingRemoval,
      state: {
        sorting,
        columnFilters,
      },
      initialState: {
        sorting: initialSorting,
        columnFilters: initialFilters,
      },
    })

    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget
        const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

        if (scrollPercentage >= (percentageLoadMore > 1 ? 1 : percentageLoadMore)) {
          onBottomReached?.()
        }
      },
      [onBottomReached, percentageLoadMore],
    )

    useEffect(() => {
      if (!internalRef?.current) return

      const container = internalRef.current
      let scrollTimeout: NodeJS.Timeout | undefined
      let startX: number | undefined
      let startY: number | undefined
      let isDirectionLocked = false

      const handleScroll = () => {
        clearTimeout(scrollTimeout)

        scrollTimeout = setTimeout(() => {
          container.classList.remove('disable-x', 'disable-y')
          startX = undefined
          startY = undefined
          isDirectionLocked = false
        }, 150)

        if (isDirectionLocked) return

        startX ??= container.scrollLeft
        startY ??= container.scrollTop

        const deltaX = Math.abs(container.scrollLeft - startX)
        const deltaY = Math.abs(container.scrollTop - startY)
        const threshold = 10

        if (deltaX > deltaY + threshold) {
          container.classList.add('disable-y')
          container.classList.remove('disable-x')
          isDirectionLocked = true
        } else if (deltaY > deltaX + threshold) {
          container.classList.add('disable-x')
          container.classList.remove('disable-y')
          isDirectionLocked = true
        }
      }

      container.addEventListener('scroll', handleScroll)

      return () => {
        container.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimeout)
      }
    }, [])

    useEffect(() => {
      const handleWindowScroll = debounce(() => {
        const scrollTop = window.scrollY || window.pageYOffset
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollPercentage = (scrollTop + windowHeight) / documentHeight

        if (scrollPercentage >= (percentageLoadMore > 1 ? 0.75 : Math.max(percentageLoadMore, 0.75))) {
          onBottomReached?.()
        }
      }, 200) // 200ms debounce

      window.addEventListener('scroll', handleWindowScroll)

      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleWindowScroll)
        handleWindowScroll.cancel() // Cancel any pending debounced calls
      }
    }, [onBottomReached])

    const hasData = useMemo(() => data?.length > 0, [data?.length])
    const showEmptyState = !isLoading && !hasData && showBlankState && !isLostNetwork

    const getSortIcon = (column: any) => {
      const isSorted = column.getIsSorted()
      return (
        <div className="flex items-center flex-col ml-1">
          <IconSortUp currentColor={isSorted === 'asc' ? '#9B2CFC' : '#645F7B'} />
          <IconSortDown currentColor={isSorted === 'desc' ? '#9B2CFC' : '#645F7B'} />
        </div>
      )
    }

    return (
      <div className="relative w-full h-full z-2">
        <div
          className={cn(
            'rounded-md border overflow-auto !z-[5]',
            data?.length === 0 && 'min-h-[220px]',
            containerClassName,
            isStickyHeader && 'relative',
            !hasData ? 'no-scrollbar' : 'x-scroll',
          )}
          onScroll={useScrollWindow ? undefined : handleScroll}
          ref={(node) => {
            internalRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
        >
          <Table className={cn(tableClassName, isStickyHeader && 'relative w-full h-full !z-[1]')}>
            <TableHeader className={cn(tableHeaderClassName, isStickyHeader && 'sticky top-0 z-2')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
                  {headerGroup.headers.map((header, index) => {
                    const isSortable = header.column.getCanSort() && isSortFE
                    return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'z-0',
                        tableHeadClassName,
                        index === 0 && isStickyFirstColumn && 'sticky left-0 z-1 bg-inherit bg-clip-padding',
                        index === 0 && isStickyFirstColumn && shadowFirstColumn,
                        isSortable && 'cursor-pointer hover:text-gray-200',
                      )}
                      style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
                      onClick={(event) => {
                        if(isSortable) {
                          header.column.getToggleSortingHandler()?.(event)  
                        }
                      }}
                    >
                      <div 
                      className={cn(
                          "flex items-center",
                          header.column.columnDef.meta?.align === 'center' && "justify-center"
                        )}
                        >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && getSortIcon(header.column)}
                      </div>
                    </TableHead>
                  )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={tableBodyClassName}>
              {isLostNetwork ? (
                <TableRow className="border-none">
                  <TableCell colSpan={columns.length} className="text-center py-8 h-100">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-[#6C6A74] text-sm">{t('table.lostNetwork')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ): isLoading ? (
                <TableRow className={tableBodyRowClassName}>
                  <TableCell colSpan={columns.length} className={cn('h-24 text-center', tableCellClassName)}>
                    {skeletonComponent}
                  </TableCell>
                </TableRow>
              ) : !hasData ? (
                <TableRow className={tableBodyRowClassName}>
                  <TableCell colSpan={columns.length} className={cn('h-48', tableCellClassName)}></TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.map((row, index) => (
                    <TableRowComponent
                      key={row.id}
                      row={row}
                      columns={columns}
                      isStickyFirstColumn={isStickyFirstColumn}
                      stickyBg={stickyBg}
                      tableBodyRowClassName={tableBodyRowClassName}
                      tableCellClassName={tableCellClassName}
                      onRowClick={onRowClick}
                      isFetchMore={isFetchMore}
                      skeletonComponent={skeletonComponent}
                      oddRowClassName={oddRowClassName}
                      evenRowClassName={evenRowClassName}
                      shadowFirstColumn={shadowFirstColumn}
                      isOdd={index % 2 === 1}
                    />
                  ))
              )}
            </TableBody>
          </Table>
          {isShowLoadMore ? (
            <div ref={loadMoreRef} className="h-[80px] w-full flex justify-center items-center pt-[0px]">
              <LoadMore />
            </div>
          ) : null}
        </div>
        {showEmptyState && (
          <NoDataState
            isFollowed={isFollowed}
            isConnected={isConnected}
            emptyComponent={emptyComponent}
            noDataText={noDataText}
            noDataClassName={noDataClassName}
            isShowCta={isShowCta}
            iconEmptyComponent={iconEmptyComponent}
          />
        )}
      </div>
    )
  },
)

DataTable.displayName = 'DataTable'
