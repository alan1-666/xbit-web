import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useWindowSize } from 'react-use'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils.ts'
import { IconEmptyV3 } from '@components/icon'
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'
import React, { JSX, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SwipeableRow from './swipeable-row'

interface TableVirtualProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
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
  onRowClick?: (data: any, event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void
  onBottomReached?: () => void
  isLoading?: boolean
  enableSwipeToDelete?: boolean
  onSwipeDelete?: (data: any) => void
  swipeDeleteText?: string
  rowHeight?: number
  cusTomMaxHeight?: string
  renderFooter?: () => React.ReactNode
  emptyText?: string
  isShowHeader?: boolean
  tableRowClassName?: string
  isSearchList?: boolean
  isMemeSearchList?: boolean
  isCategoryTab?: boolean
  scrollElement?: HTMLDivElement
  cusTomMaxHeightPC?: string
  disableMaxHeight?: boolean
  isFuturesSearch?: boolean
  initialSorting?: SortingState
  emptyClass?: string
  paddingBottom?: string
  wrapperClassName?: string
}

const TableVirtualComponent = <TData, TValue>({
  columns,
  data,
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
  isLoading,
  enableSwipeToDelete = false,
  onSwipeDelete,
  rowHeight = 53,
  cusTomMaxHeight,
  renderFooter,
  emptyText,
  isShowHeader = true,
  isSearchList = false,
  tableRowClassName,
  isMemeSearchList,
  isCategoryTab,
  paddingBottom,
  scrollElement,
  cusTomMaxHeightPC,
  disableMaxHeight = false,
  initialSorting,
  wrapperClassName,
}: TableVirtualProps<TData, TValue>) => {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>(initialSorting || [])
  const parentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLTableRowElement>(null)
  const stickyHeaderRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [scrollMargin, setScrollMargin] = useState(0)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  })

  // Measure header height for proper spacing
  useEffect(() => {
    if (headerRef.current && isStickyHeader) {
      const height = headerRef.current.offsetHeight
      setHeaderHeight(height)
    }
  }, [isStickyHeader, isShowHeader, columns])

  const handleRowClick = useCallback(
    (row: Row<TData>, e?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (onRowClick && row) {
        onRowClick(row.original, e)
      }
    },
    [onRowClick],
  )

  const handleSwipeDelete = useCallback(
    (row: Row<TData>) => {
      if (onSwipeDelete && row) {
        onSwipeDelete(row.original)
      }
    },
    [onSwipeDelete],
  )

  const handleElementScroll = useCallback(
    (target: HTMLDivElement) => {
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

      if (scrollPercentage >= 0.75) {
        onBottomReached?.()
      }
    },
    [onBottomReached],
  )

  const handleScrollEvent = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      handleElementScroll(event.currentTarget)
    },
    [handleElementScroll],
  )

  const handleWindowScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    if (scrollPercentage >= 0.75) {
      onBottomReached?.()
    }
  }, [onBottomReached])

  const { rows } = table.getRowModel()
  const scrollTarget = scrollElement ? scrollElement : parentRef.current
  const useWindowScroll = !scrollTarget || scrollTarget.scrollHeight <= scrollTarget.clientHeight

  const elementVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollTarget,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const windowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeight,
    overscan: 10,
    scrollMargin,
  })

  const activeVirtualizer = useWindowScroll ? windowVirtualizer : elementVirtualizer
  const virtualRows = activeVirtualizer.getVirtualItems()
  const totalSize = activeVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const bottomSpacer =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0

  const { height } = useWindowSize()

  useEffect(() => {
    elementVirtualizer.measure()
    windowVirtualizer.measure()
  }, [rows.length, rowHeight, scrollMargin, elementVirtualizer, windowVirtualizer])

  useEffect(() => {
    if (parentRef.current) {
      const headerOffset = isStickyHeader && isShowHeader ? headerHeight : 0
      setScrollMargin(Math.max(parentRef.current.offsetTop - headerOffset, 0))
    }
  }, [height, headerHeight, isStickyHeader, isShowHeader])

  useEffect(() => {
    const currentOffset = activeVirtualizer.scrollOffset ?? 0
    requestAnimationFrame(() => {
      activeVirtualizer.scrollToOffset?.(currentOffset)
    })
  }, [scrollMargin, activeVirtualizer])

  useEffect(() => {
    if (rows.length === 0) return
    const scrollOffset = activeVirtualizer.scrollOffset ?? 0
    const viewportHeight = useWindowScroll ? window.innerHeight : scrollTarget?.clientHeight ?? 0
    if (viewportHeight <= 0) return
    const maxOffset = Math.max(totalSize - viewportHeight, 0)
    if (scrollOffset > maxOffset) {
      activeVirtualizer.scrollToOffset?.(maxOffset)
    }
  }, [rows.length, totalSize, useWindowScroll, scrollTarget, activeVirtualizer])

  useEffect(() => {
    if (useWindowScroll) {
      window.addEventListener('scroll', handleWindowScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', handleWindowScroll)
      }
    }
    if (!scrollElement) {
      return
    }
    const target = scrollElement
    const onScroll = () => handleElementScroll(target)
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', onScroll)
    }
  }, [useWindowScroll, scrollElement, handleElementScroll, handleWindowScroll])

  // Render sticky header separately
  const renderStickyHeader = () => {
    if (!isStickyHeader || !isShowHeader) return null

    return (
      <div
        ref={stickyHeaderRef}
        className={cn('sticky top-0 z-30 bg-[#19191E] overflow-hidden outline-none', tableHeaderClassName)}
        style={{
          position: 'sticky',
          zIndex: 30,
        }}
      >
        <Table className={cn(tableClassName)}>
          <TableHeader className={cn('relative')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={`sticky-${headerGroup.id}`} className={tableHeaderRowClassName} ref={headerRef}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={`sticky-${header.id}`}
                    className={cn(
                      'z-0 px-1 h-8.5',
                      tableHeadClassName,
                      index === 0 && isStickyFirstColumn && 'sticky left-0 z-1',
                    )}
                    style={{
                      ...(isStickyFirstColumn && stickyBg && index === 0 ? { background: stickyBg } : {}),
                      textAlign: index === 0 ? 'left' : 'right',
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full flex flex-col", wrapperClassName)}>
      {/* Sticky header rendered separately */}
      {renderStickyHeader()}

      <div
        className={cn('flex-1', containerClassName)}
        onScroll={handleScrollEvent}
        ref={parentRef}
        style={{
          paddingBottom: paddingBottom ? paddingBottom : isCategoryTab ? '120px' : scrollElement ? '0' : '100px',
          // maxHeight: 'calc(100dvh - 203px)',
          maxHeight: disableMaxHeight
            ? 'none'
            : cusTomMaxHeightPC
              ? cusTomMaxHeightPC
              : height >= 1000 && isMemeSearchList
                ? 'calc(100dvh - 270px)'
                : 'calc(100dvh - 203px)',
          // 当设置了cusTomMaxHeight为none时，使用100%高度
          height: cusTomMaxHeight === 'none' ? '100%' : 'auto',
          // 移动端滚动优化
          WebkitOverflowScrolling: 'touch', // iOS平滑滚动
          overscrollBehavior: 'contain', // 防止滚动链
          scrollBehavior: 'auto', // 禁用平滑滚动以提升性能
          // 硬件加速
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // iOS回弹控制
          overscrollBehaviorY: 'contain',
        }}
      >
        <div
          style={{
            height: cusTomMaxHeight === 'none' ? '100%' : 'auto',
            minHeight: cusTomMaxHeightPC ? 'unset' : cusTomMaxHeight === 'none' ? '100%' : 'calc(100vh - 300px)',
            // Offset for sticky header
            marginTop: isStickyHeader && isShowHeader ? `-${headerHeight}px` : 0,
          }}
          className={cn(rows.length === 0 && 'relative')}
        >
          <Table className={cn(tableClassName)}>
            {/* Regular header (hidden when sticky is enabled) */}
            {isShowHeader && !isStickyHeader && (
              <TableHeader className={cn(tableHeaderClassName)}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className={tableHeaderRowClassName} ref={headerRef}>
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'z-0 !px-1',
                          tableHeadClassName,
                          index === 0 && isStickyFirstColumn && 'sticky left-0 z-1',
                        )}
                        style={{
                          ...(isStickyFirstColumn && stickyBg && index === 0 ? { background: stickyBg } : {}),
                          textAlign: index === 0 ? 'left' : 'right',
                        }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}

            {/* Add spacer when sticky header is used */}
            {isStickyHeader && isShowHeader && (
              <thead>
                <tr style={{ height: headerHeight }}>
                  <td colSpan={columns.length} style={{ padding: 0, border: 'none' }} />
                </tr>
              </thead>
            )}

            <TableBody
              className={tableBodyClassName}
              style={{
                minHeight: cusTomMaxHeight === 'none' ? 'calc(100% - 40px)' : 'auto',
              }}
            >
              {isLoading &&
                Array.from({ length: 30 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={columns.length}>
                      <Skeleton key={i} className={cn('h-[63px] mb-1', isSearchList && 'mx-2')} />
                    </td>
                  </tr>
                ))}

              {!isLoading && (
                <>
                  {rows.length === 0 ? (
                    <TableRow className={tableBodyRowClassName}>
                      <TableCell colSpan={columns.length} className={cn('h-24 text-center', tableCellClassName)}>
                        <div className="flex flex-col items-center justify-center h-80">
                          <IconEmptyV3 />
                          <span className="text-[#908E98] text-[13px]">{emptyText || t('history.nodata')}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paddingTop > 0 && (
                        <tr>
                          <td colSpan={columns.length} style={{ height: `${paddingTop}px`, padding: 0 }} />
                        </tr>
                      )}
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index]
                      const rowContent = (
                        <TableRow
                          key={row.id}
                          style={{
                            height: `${rowHeight}px`,
                          }}
                          onClick={!enableSwipeToDelete ? (e) => handleRowClick(row, e) : undefined}
                          onMouseDown={
                            !enableSwipeToDelete
                              ? (e) => {
                                if (e.button === 1) {
                                  e.preventDefault()
                                  handleRowClick(row, e)
                                }
                              }
                              : undefined
                          }
                          className={cn(
                            tableRowClassName,
                            enableSwipeToDelete ? 'relative' : '',
                            !enableSwipeToDelete ? 'cursor-pointer' : '',
                          )}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className={cn('z-0 px-1 first-td-width', tableCellClassName)}
                              style={{
                                textAlign: cellIndex === 0 ? 'left' : 'right',
                                // paddingTop: '0px !important',
                                // paddingBottom: '0px !important'
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      )

                      if (enableSwipeToDelete && onSwipeDelete) {
                        return (
                          <tr
                            key={`swipe-${row.id}_${row.index}`}
                            style={{
                              height: `${rowHeight}px`,
                              display: 'table-row',
                            }}
                          >
                            <td
                              colSpan={columns.length}
                              style={{
                                padding: 0,
                                border: 'none',
                                position: 'relative',
                                height: '100%',
                              }}
                            >
                              <SwipeableRow
                                onSwipeDelete={() => handleSwipeDelete(row)}
                                deleteText={t('universal.detele')}
                                onClick={() => handleRowClick(row)}
                              >
                                <table style={{ width: '100%', tableLayout: 'fixed' }} className="virtual-table-custom">
                                  <tbody>
                                    {React.cloneElement(rowContent, {
                                      onClick: undefined,
                                      className: cn(tableBodyRowClassName, 'cursor-pointer'),
                                      style: {
                                        height: `${rowHeight}px`,
                                        transform: 'none',
                                      },
                                    })}
                                  </tbody>
                                </table>
                              </SwipeableRow>
                            </td>
                          </tr>
                        )
                      }

                      return rowContent
                    })}
                      {bottomSpacer > 0 && (
                        <tr>
                          <td colSpan={columns.length} style={{ height: `${bottomSpacer}px`, padding: 0 }} />
                        </tr>
                      )}
                    </>
                  )}
                </>
              )}
            </TableBody>
            {renderFooter && (
              <tfoot>
                <tr>
                  <td colSpan={columns.length}>
                    <div className={cn('mt-3 mx-auto pb-14')}>{renderFooter()}</div>
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>
      </div>
    </div>
  )
}

// Custom comparison function for memo
const arePropsEqual = <TData, TValue>(
  prevProps: TableVirtualProps<TData, TValue>,
  nextProps: TableVirtualProps<TData, TValue>,
): boolean => {
  // Compare primitive props
  if (
    prevProps.isStickyHeader !== nextProps.isStickyHeader ||
    prevProps.isStickyFirstColumn !== nextProps.isStickyFirstColumn ||
    prevProps.stickyBg !== nextProps.stickyBg ||
    prevProps.containerClassName !== nextProps.containerClassName ||
    prevProps.tableClassName !== nextProps.tableClassName ||
    prevProps.tableHeaderClassName !== nextProps.tableHeaderClassName ||
    prevProps.tableHeaderRowClassName !== nextProps.tableHeaderRowClassName ||
    prevProps.tableHeadClassName !== nextProps.tableHeadClassName ||
    prevProps.tableBodyClassName !== nextProps.tableBodyClassName ||
    prevProps.tableBodyRowClassName !== nextProps.tableBodyRowClassName ||
    prevProps.tableCellClassName !== nextProps.tableCellClassName ||
    prevProps.isLoading !== nextProps.isLoading ||
    prevProps.enableSwipeToDelete !== nextProps.enableSwipeToDelete ||
    prevProps.swipeDeleteText !== nextProps.swipeDeleteText ||
    prevProps.rowHeight !== nextProps.rowHeight ||
    prevProps.cusTomMaxHeight !== nextProps.cusTomMaxHeight ||
    prevProps.emptyText !== nextProps.emptyText ||
    prevProps.isShowHeader !== nextProps.isShowHeader ||
    prevProps.disableMaxHeight !== nextProps.disableMaxHeight
  ) {
    return false
  }

  // Compare data array length and shallow comparison
  if (prevProps.data.length !== nextProps.data.length) {
    return false
  }

  // Shallow comparison of data array items
  for (let i = 0; i < prevProps.data.length; i++) {
    if (prevProps.data[i] !== nextProps.data[i]) {
      return false
    }
  }

  // Compare columns array length
  if (prevProps.columns.length !== nextProps.columns.length) {
    return false
  }

  // Compare function references (they should be memoized by parent)
  if (
    prevProps.onRowClick !== nextProps.onRowClick ||
    prevProps.onBottomReached !== nextProps.onBottomReached ||
    prevProps.onSwipeDelete !== nextProps.onSwipeDelete ||
    prevProps.renderFooter !== nextProps.renderFooter
  ) {
    return false
  }

  return true
}

// Export the memoized component
export const TableVirtual = memo(TableVirtualComponent, arePropsEqual) as <TData, TValue>(
  props: TableVirtualProps<TData, TValue>,
) => JSX.Element
