import Text from '@/components/common/Text'
import { IconEmpty } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
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
import { useVirtualizer } from '@tanstack/react-virtual'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'

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
  onRowClick?: (data: any) => void
  onBottomReached?: () => void
  isFetchMore?: boolean
  ref?: React.Ref<HTMLDivElement>
  noDataText?: string
  noDataClassName?: string
  isShowLoginRequire?: boolean
  emptyComponent?: React.ReactNode
  initialSorting?: SortingState
  initialFilters?: ColumnFiltersState
  isStickyLastColumn?: boolean
  minTableWidth?: string
  // Virtual scrolling props
  enableVirtual?: boolean
  estimateSize?: number
  overscan?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  skeletonComponent = <SkeletonList count={10} classNameItem="h-12 w-full" className="w-full" />,
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
  ref,
  noDataText,
  isShowLoginRequire = false,
  noDataClassName = '',
  emptyComponent,
  initialSorting = [],
  initialFilters = [],
  isStickyLastColumn = false,
  minTableWidth = '1200px',
  // Virtual scrolling defaults
  enableVirtual = false,
  estimateSize = 48,
  overscan = 10,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const isLogin = useCheckLoginOnArb()
  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const rows = table.getRowModel().rows

  // Virtual scrolling setup - FIX: Remove enabled condition
  const rowVirtualizer = useVirtualizer({
    count: enableVirtual ? rows.length : 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  // Sync horizontal scroll between header and body for virtual mode
  useEffect(() => {
    if (!enableVirtual || !tableContainerRef.current || !headerRef.current) return

    const bodyContainer = tableContainerRef.current
    const headerContainer = headerRef.current

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      target.scrollLeft = source.scrollLeft
    }

    const handleBodyScroll = () => {
      syncScroll(bodyContainer, headerContainer)
    }

    const handleHeaderScroll = () => {
      syncScroll(headerContainer, bodyContainer)
    }

    bodyContainer.addEventListener('scroll', handleBodyScroll)
    headerContainer.addEventListener('scroll', handleHeaderScroll)

    return () => {
      bodyContainer.removeEventListener('scroll', handleBodyScroll)
      headerContainer.removeEventListener('scroll', handleHeaderScroll)
    }
  }, [enableVirtual])

  useEffect(() => {
      if (isLogin && showLoginDrawer) {
        setShowLoginDrawer(false)
      }
    }, [showLoginDrawer, isLogin])

  const handleRowClick = (row: Row<TData>) => {
    if (onRowClick && row) {
      onRowClick(row.original)
    }
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

    if (scrollPercentage >= 0.75) {
      onBottomReached?.()
    }
  }

  // Regular table body rendering
  const renderRegularRows = () => {
    if (isLoading) {
      return (
        <TableRow className={tableBodyRowClassName}>
          <TableCell colSpan={columns.length} className={cn('h-12 text-center w-full', tableCellClassName)}>
            {skeletonComponent}
          </TableCell>
        </TableRow>
      )
    }

    if (rows.length === 0) {
      return (
        <TableRow className={tableBodyRowClassName}>
          <TableCell colSpan={columns.length} className={cn('h-48', tableCellClassName)}></TableCell>
        </TableRow>
      )
    }

    return rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
        className={tableBodyRowClassName}
        onClick={() => handleRowClick(row)}
      >
        {row.getVisibleCells().map((cell, index) => {
          const isFirstColumn = index === 0
          const isLastColumn = index === row.getVisibleCells().length - 1

          return (
            <TableCell
              key={cell.id}
              className={cn(
                'z-0',
                tableCellClassName,
                isFirstColumn && isStickyFirstColumn && 'sticky left-0 z-10',
                isLastColumn && isStickyLastColumn && 'sticky right-0 z-10 sticky-shadow-right min-w-[180px]',
              )}
              style={{
                ...(isFirstColumn && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                ...(isLastColumn && isStickyLastColumn && stickyBg ? { background: stickyBg } : {}),
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
    ))
  }

  const renderVirtualRows = () => {
    if (isLoading || !enableVirtual) return null

    const virtualRows = rowVirtualizer.getVirtualItems()
    const totalSize = rowVirtualizer.getTotalSize()

    return (
      <div
        style={{
          height: totalSize,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null

          return (
            <div
              key={`${row.id}-${virtualRow.index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn('flex items-center', tableBodyRowClassName)}
              onClick={() => handleRowClick(row)}
            >
              {row.getVisibleCells().map((cell, index) => {
                // console.log(cell.column.columnDef.minSize)
                const isFirstColumn = index === 0
                const isLastColumn = index === row.getVisibleCells().length - 1
                const colWidth = `${100 / row.getVisibleCells().length}%`
                const colMinWidth = cell.column.columnDef.minSize
                const colMaxWidth = cell.column.columnDef.maxSize

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      'px-4 py-2 flex-1 flex items-center',
                      tableCellClassName,
                      isFirstColumn && isStickyFirstColumn && 'sticky left-0 z-10',
                      isLastColumn && isStickyLastColumn && 'sticky right-0 z-10',
                    )}
                    style={{
                      width: colWidth,
                      minWidth: `${colMinWidth}px`,
                      maxWidth: `${colMaxWidth}px`,
                      ...(isFirstColumn && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                      ...(isLastColumn && isStickyLastColumn && stickyBg ? { background: stickyBg } : {}),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  if (enableVirtual) {
    return (
      <div className={cn('relative w-full h-full flex flex-col', rows.length === 0 && 'min-h-[35dvh]')}>
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            'flex-shrink-0 overflow-x-auto overflow-y-hidden',
            tableHeaderClassName,
            isStickyHeader && 'sticky top-0 z-20',
          )}
        >
          <div style={{ minWidth: minTableWidth, flexShrink: 0 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className={cn('flex', tableHeaderRowClassName)}>
                {headerGroup.headers.map((header, index) => {
                  const isFirstColumn = index === 0
                  const isLastColumn = index === headerGroup.headers.length - 1
                  const colMinWidth = header.column.columnDef.minSize

                  return (
                    <div
                      key={header.id}
                      className={cn(
                        'px-4 py-2 font-medium text-left flex-1',
                        tableHeadClassName,
                        isFirstColumn && isStickyFirstColumn && 'sticky left-0 z-20',
                        isLastColumn && isStickyLastColumn && 'sticky right-0 z-20',
                      )}
                      style={{
                        minWidth: `${colMinWidth}px`,
                        ...(isFirstColumn && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                        ...(isLastColumn && isStickyLastColumn && stickyBg ? { background: stickyBg } : {}),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div
          ref={tableContainerRef}
          className={cn('flex-1 overflow-auto custom-scrollbar', containerClassName)}
          onScroll={handleScroll}
        >
          <div style={{ minWidth: minTableWidth, flexShrink: 0 }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-12 w-full">{skeletonComponent}</div>
            ) : (
              renderVirtualRows()
            )}
          </div>
        </div>

        {/* Empty State */}
        {!isShowLoginRequire && rows.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center top-[83px]">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[14px] text-center max-w-[320px]">
              {noDataText ?? t('history.nodata')}
            </span>
          </div>
        )}

        {isShowLoginRequire && rows.length === 0 && !isLoading && (
          <div
            className={cn(
              'flex flex-col items-center justify-center absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10',
              noDataClassName,
            )}
          >
            <Text text={t('login.authRequire')} className="font-[!330]" fontSize={12} color="#FFFFFFB2" />

            <Button
              variant="ghost"
              className="bg-[#6A2AE0] !max-h-[26px] mt-2 text-white text-[calc(1rem*(12/16))] leading-[1] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] hover:bg-[#5300ec]"
              onClick={() => { setShowLoginDrawer(true)}}
            >
              {t('login.LoginOrSignup')}
            </Button>
          </div>
        )}
        <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      </div>
    )
  }

  // Regular table (non-virtual) with sticky last column
  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className={cn(
          'overflow-x-auto overflow-y-auto  !z-[5]',
          data?.length === 0 && 'min-h-[220px]',
          containerClassName,
          isStickyHeader && 'relative',
        )}
        onScroll={handleScroll}
        ref={ref}
      >
        {/* 横向滚动包裹层 */}
        <Table
          className={cn(
            tableClassName,
            'w-full table-auto border-collapse',
            isStickyHeader && 'relative !z-[1]',
          )}
          style={{ minWidth: minTableWidth }}
        >
          <TableHeader className={cn(tableHeaderClassName, isStickyHeader && 'sticky top-0 z-20 bg-[#141418]')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
                {headerGroup.headers.map((header, index) => {
                  const isFirstColumn = index === 0
                  const isLastColumn = index === headerGroup.headers.length - 1
                  const colMaxWidth = headerGroup.headers[index].column.columnDef.maxSize
                  const colWidth = headerGroup.headers[index].column.columnDef.size
                  const colMinWidth = headerGroup.headers[index].column.columnDef.minSize

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'z-0',
                        tableHeadClassName,
                        isFirstColumn && isStickyFirstColumn && 'sticky left-0 z-20',
                        isLastColumn && isStickyLastColumn && `sticky right-0 z-20 sticky-shadow-right`,
                      )}
                      style={{
                        maxWidth: `${colMaxWidth}px`,
                        width: `${colWidth}px`,
                        minWidth: `${colMinWidth}px`,
                        ...(isFirstColumn && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                        ...(isLastColumn && isStickyLastColumn && stickyBg ? { background: stickyBg } : {}),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={tableBodyClassName}>
            {renderRegularRows()}
            {isFetchMore && (
              <TableRow>
                <TableCell colSpan={columns.length} className={cn('h-12 text-center w-full', tableCellClassName)}>
                  {skeletonComponent}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {!isShowLoginRequire &&
        rows.length === 0 &&
        !isLoading &&
         (
          <div
            className={cn(
              'flex flex-col items-center justify-center absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10',
              noDataClassName,
            )}
          >
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[14px] text-center max-w-[320px]">
              {noDataText ?? t('history.nodata')}
            </span>
          </div>
        )}

      {isShowLoginRequire && rows.length === 0 && !isLoading && (
        <div
          className={cn(
            'flex flex-col items-center justify-center absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10',
            noDataClassName,
          )}
        >
          <Text text={t('login.authRequire')} className="font-[!330]" fontSize={12} color="#FFFFFFB2" />

          <Button
            variant="ghost"
            className="bg-[#6A2AE0] !max-h-[26px] mt-2 text-white text-[calc(1rem*(12/16))] leading-[1] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] hover:bg-[#5300ec]"
            onClick={() => { setShowLoginDrawer(true)}}
          >
            {t('login.LoginOrSignup')}
          </Button>
        </div>
      )}
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </div>
  )
}
