import { cn } from '@/lib/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table.tsx'
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
  getSortedRowModel,
  Updater,
} from '@tanstack/react-table'
import { IconSortDown, IconSortUp } from '@components/icon'
import { CSSProperties, useCallback, useRef, ElementType, ComponentPropsWithoutRef, Fragment, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { Loading } from '@/components/common/Loading'

type ColumnMeta = {
  style?: CSSProperties
}

export type ColumnDefWithMeta<T> = ColumnDef<T> & {
  meta?: ColumnMeta
}

/**
 * A virtualized data table component using react-table and react-virtual.
 *
 * @template T - The type of data in each row.
 * @template R - The type of the row wrapper element.
 * @param {VirtualizedDataTableProps<T, R>} props - The props for the component.
 * @returns {JSX.Element} The rendered virtualized data table.
 *
 * @example
 * ```tsx
 * const columns: ColumnDefWithMeta<MyDataType>[] = [
 *   {
 *     header: 'Name',
 *     accessorKey: 'name',
 *     meta: { style: { width: '200px' } },
 *   },
 *   // more columns...
 * ];
 *
 * <VirtualizedDataTable
 *   data={myData}
 *   columns={columns}
 *   estimateSize={50}
 *   onLoadMore={loadMoreData}
 * />
 * ```
 *
 * @see {@link https://tanstack.com/table/v8/docs/guide/introduction} for react-table documentation.
 * @see {@link https://tanstack.com/virtual/v3/docs/guide/introduction} for react-virtual documentation.
 *
 * @remarks
 * - The component supports sorting, custom row wrappers, and infinite scrolling.
 * - The `onLoadMore` callback is triggered when the user scrolls near the end of the list.
 * - The `getItemKey` function can be provided for stable item keys in virtualization.
 * - The `sortDirections` prop allows customization of sorting order cycles.
 * - The `rowWrapper` prop allows wrapping each row with a custom component, useful for adding additional functionality or styling.
 * - The `rowWrapperPropsFn` prop allows passing dynamic props to the row wrapper based on the row data.
 * - The `headerClassName` and `rowClassName` props allow for additional styling of the header and rows respectively.
 * - The `isLoading` prop displays a loading skeleton when data is being fetched.
 * - The `striped` prop adds alternating row colors for better readability.
 * - The `onRowClick` prop allows handling row click events.
 * - The `estimateSize` prop is crucial for performance, as it helps the virtualizer calculate the total height of the list.
 * - The component is designed to be flexible and reusable across different data types and use cases.
 * - Ensure to provide appropriate styles for the table and its elements to match your application's design.
 */
export interface VirtualizedDataTableProps<T, R extends ElementType = 'div'> {
  className?: string
  data: T[]
  columns: ColumnDefWithMeta<T>[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  estimateSize: number
  overscan?: number
  rowWrapper?: R
  rowWrapperPropsFn?: (row: T) => ComponentPropsWithoutRef<R>
  striped?: boolean
  onRowClick?: (row: T) => void
  onLoadMore?: () => void
  isLoading?: boolean
  getItemKey?: (index: number) => number | string | bigint
  headerClassName?: string
  rowClassName?: string
  emptyText?: string
  sortDirections?: ('asc' | 'desc' | undefined)[]
  hasNextPage?: boolean
}

export const VirtualizedDataTable = <T, R extends ElementType = 'div'>(props: VirtualizedDataTableProps<T, R>) => {
  const {
    className,
    data,
    columns,
    sorting,
    onSortingChange,
    estimateSize,
    overscan = 5,
    rowWrapper: RowWrapper = Fragment,
    rowWrapperPropsFn = () => ({}) as ComponentPropsWithoutRef<R>,
    striped = false,
    onRowClick,
    onLoadMore,
    isLoading = false,
    getItemKey,
    headerClassName,
    rowClassName,
    sortDirections = ['desc', 'asc', undefined],
    emptyText,
    hasNextPage,
  } = props
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: data,
    columns: columns,
    enableSorting: true,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleSort = useCallback((column: Column<T>) => {
    if (!column.columnDef.enableSorting) return
    const currentSort = column.getIsSorted()
    const currentIndex = sortDirections.indexOf(currentSort as 'asc' | 'desc' | undefined)
    const nextIndex = (currentIndex + 1) % sortDirections.length
    const nextSort = sortDirections[nextIndex]
    if (nextSort === 'asc') {
      column.toggleSorting(false, false)
    } else if (nextSort === 'desc') {
      column.toggleSorting(true, false)
    } else {
      column.toggleSorting(undefined, false)
    }
  }, [])

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => estimateSize,
    getScrollElement: () => tableContainerRef.current,
    overscan: overscan,
    getItemKey: getItemKey,
  })

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) {
      return
    }
    if (lastItem.index >= rows.length - 3) {
      onLoadMore?.()
    }
  }, [rowVirtualizer.getVirtualItems()])

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        'overflow-auto overscroll-contain relative h-[calc(100dvh-100px)] border rounded-[6px] mt-2',
        data.length > 0 ? 'no-vertical-scrollbar' : 'no-scrollbar',
        className,
      )}
    >
      <Table className="grid">
        <TableHeader className="grid sticky top-0 z-[1] bg-[#0A0A0A] rounded-[6px]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={cn('flex w-full', headerClassName)}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="flex"
                  style={
                    (header.column.columnDef.meta as ColumnMeta)?.style
                      ? (header.column.columnDef.meta as ColumnMeta)?.style
                      : { width: header.column.getSize() }
                  }
                >
                  <div
                    className={cn(
                      header.column.columnDef.enableSorting ? 'cursor-pointer select-none' : '',
                      'flex items-center font-normal text-[#FFFFFF80] text-[calc(14rem/16)]',
                    )}
                    onClick={() => handleSort(header.column)}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.columnDef.enableSorting ? (
                      <div className="pl-0.5">
                        <IconSortUp currentColor={header.column.getIsSorted() === 'asc' ? '#AB57FF' : '#FFFFFF80'} />
                        <IconSortDown currentColor={header.column.getIsSorted() === 'desc' ? '#AB57FF' : '#FFFFFF80'} />
                      </div>
                    ) : null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 20 }).map((_, index) => (
              <Skeleton key={index} className="w-full" style={{ height: estimateSize }} />
            ))}
          </div>
        )}
        <TableBody
          className="grid relative"
          style={{ height: `${rowVirtualizer.getTotalSize() + (hasNextPage ? 60 : 0)}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            const props = rowWrapperPropsFn(row.original)
            return (
              <RowWrapper key={virtualRow.key} className="h-fit" {...props}>
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  className={cn(
                    'flex absolute top-0 w-full box-border !border-b border-[#ECECED0A] cursor-pointer hover:bg-[#ECECED1F]',
                    striped && row.index % 2 === 1 ? 'bg-[#ECECED0A]' : '',
                    rowClassName,
                  )}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="flex items-center"
                      style={
                        (cell.column.columnDef.meta as ColumnMeta)?.style
                          ? (cell.column.columnDef.meta as ColumnMeta)?.style
                          : { width: cell.column.getSize() }
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </RowWrapper>
            )
          })}
          {hasNextPage && (
            <div className="h-[60px] absolute top-0 inset-x-0 flex items-center justify-center" style={{transform: `translateY(${rowVirtualizer.getTotalSize()}px)`}}>
              <Loading />
            </div>
          )}
        </TableBody>
      </Table>
      {!isLoading && rows.length === 0 && (
          <div className="justify-center items-center flex" style={{height: 'calc(100% - 41px)'}}>
            <EmptyList emptyText={emptyText} />
          </div>
        )}
    </div>
  )
}
