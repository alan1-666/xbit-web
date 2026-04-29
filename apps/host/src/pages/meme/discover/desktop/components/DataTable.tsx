import { cn } from '@/lib/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table.tsx'
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { IconSortDown, IconSortUp } from '@components/icon'
import {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  ElementType,
  ComponentPropsWithoutRef,
  Fragment,
  Ref,
  useImperativeHandle,
  ReactNode,
} from 'react'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { AnimatePresence } from 'framer-motion'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { Loading } from '@components/common/Loading.tsx'

type ColumnMeta = {
  style?: CSSProperties
  className?: string
}

export type ColumnDefWithMeta<T> = ColumnDef<T> & {
  meta?: ColumnMeta
}

export interface DataTableProps<T, R extends ElementType = 'div'> {
  className?: string
  data: T[]
  columns: ColumnDefWithMeta<T>[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  rowWrapper?: R
  rowWrapperPropsFn?: (row: T, index: number) => Omit<ComponentPropsWithoutRef<R>, 'children'>
  striped?: boolean
  onRowClick?: (row: T) => void
  onLoadMore?: () => void
  isLoading?: boolean
  rowHeight?: number
  getRowId?: (originalRow: T, index: number, parent?: Row<T>) => string
  headerClassName?: string
  headerRowClassName?: string
  headerCellClassName?: string
  rowClassName?: string
  cellClassName?: string
  hasNextPage?: boolean
  ref?: Ref<DataTableHandle>
  noDataComponent?: ReactNode
  tableBodyClassName?: string
  tableClassName?: string
}

interface DataTableBodyProps<T, R extends ElementType = 'div'> {
  isLoading: boolean
  rowHeight: number
  rows: Row<T>[]
  rowWrapper: R
  rowWrapperPropsFn: (row: T, index: number) => ComponentPropsWithoutRef<R>
  striped: boolean
  onRowClick?: (row: T) => void
  hasNextPage?: boolean
  rowClassName?: string
  cellClassName?: string
  noDataComponent?: ReactNode
  tableBodyClassName?: string
}

export interface DataTableHandle {
  scrollToTop: () => void
}

const DataTableBody = <T, R extends ElementType = 'div'>(props: DataTableBodyProps<T, R>) => {
  const {
    isLoading,
    rowHeight,
    rows,
    rowWrapper: RowWrapper = Fragment,
    rowWrapperPropsFn = () => ({}) as ComponentPropsWithoutRef<R>,
    striped = false,
    onRowClick,
    rowClassName,
    cellClassName,
    noDataComponent,
    tableBodyClassName,
  } = props
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="w-full" style={{ height: rowHeight }} />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <div>{noDataComponent ? noDataComponent : <EmptyList />}</div>
  }

  return (
    <TableBody className={cn('grid', tableBodyClassName)}>
      <AnimatePresence>
        {rows.map((row, index) => {
          const props = rowWrapperPropsFn(row.original, index)
          return (
            <RowWrapper key={row.id} {...props}>
              <TableRow
                key={row.id}
                className={cn(
                  'flex w-full box-border border-b border-[#ECECED0A] cursor-pointer hover:bg-[#ECECED1F]',
                  striped && row.index % 2 === 1 ? 'bg-[#ECECED0A]' : '',
                  rowClassName,
                )}
                data-index={row.index}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'flex items-center',
                      cellClassName,
                      (cell.column.columnDef.meta as ColumnMeta)?.className,
                    )}
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
      </AnimatePresence>
    </TableBody>
  )
}

export const DataTable = <T, R extends ElementType = 'div'>(props: DataTableProps<T, R>) => {
  const {
    className,
    data,
    columns,
    sorting,
    onSortingChange,
    rowWrapper: RowWrapper = Fragment,
    rowWrapperPropsFn = () => ({}) as ComponentPropsWithoutRef<R>,
    striped = false,
    onRowClick,
    onLoadMore,
    isLoading = false,
    rowHeight = 48,
    getRowId,
    headerClassName,
    headerRowClassName,
    headerCellClassName,
    cellClassName,
    hasNextPage,
    ref,
    rowClassName,
    noDataComponent,
    tableBodyClassName,
    tableClassName,
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
    getRowId: getRowId,
  })

  const handleSort = useCallback((column: Column<T>) => {
    if (!column.columnDef.enableSorting) return
    const currentSort = column.getIsSorted()
    if (currentSort === 'desc') {
      column.toggleSorting(false, false)
    } else if (currentSort === 'asc') {
      column.toggleSorting(undefined, false)
    } else {
      column.toggleSorting(true, false)
    }
  }, [])

  useEffect(() => {
    if (!onLoadMore) return
    const container = tableContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const threshold = rowHeight * 3 // <-- use rowHeight from prop

      // 1. Check if table container itself is scrollable
      if (container.scrollHeight > container.clientHeight) {
        const { scrollTop, scrollHeight, clientHeight } = container
        if (scrollHeight - scrollTop - clientHeight <= threshold) {
          onLoadMore()
        }
        return
      }

      // 2. Fallback to global layout scroll container
      const layoutContent = document.getElementById('desktop-layout-content')
      if (layoutContent) {
        const { scrollTop, scrollHeight, clientHeight } = layoutContent
        if (scrollHeight - scrollTop - clientHeight <= threshold) {
          onLoadMore()
        }
        return
      }

      // 3. Fallback to standard window scrolling
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const windowScrollTop = window.scrollY || document.documentElement.scrollTop
      if (windowHeight + windowScrollTop >= docHeight - threshold) {
        onLoadMore()
      }
    }

    const layoutContent = document.getElementById('desktop-layout-content')
    const globalScrollTarget = layoutContent || window

    container.addEventListener('scroll', handleScroll)
    globalScrollTarget.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      globalScrollTarget.removeEventListener('scroll', handleScroll)
    }
  }, [onLoadMore, isLoading, rowHeight])

  const { rows } = table.getRowModel()

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
  }))

  return (
    <div ref={tableContainerRef} className={cn('relative w-full', className)}>
      <Table className={cn(tableClassName)}>
        <TableHeader className={cn(headerClassName)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={cn('flex w-full', headerRowClassName)}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'flex w-full',
                    headerCellClassName,
                    (header.column.columnDef.meta as ColumnMeta)?.className,
                  )}
                  style={
                    (header.column.columnDef.meta as ColumnMeta)?.style
                      ? (header.column.columnDef.meta as ColumnMeta)?.style
                      : { width: header.column.getSize() }
                  }
                >
                  <div
                    className={cn(
                      header.column.columnDef.enableSorting ? 'cursor-pointer select-none' : '',
                      'flex items-center font-normal text-[#FFFFFF80] text-[calc(14rem/16)] w-full',
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
        <DataTableBody
          isLoading={isLoading}
          rowHeight={rowHeight}
          rows={rows}
          rowWrapper={RowWrapper}
          rowWrapperPropsFn={rowWrapperPropsFn}
          striped={striped}
          onRowClick={onRowClick}
          hasNextPage={hasNextPage}
          rowClassName={rowClassName}
          cellClassName={cellClassName}
          tableBodyClassName={tableBodyClassName}
          noDataComponent={noDataComponent}
        />
      </Table>
      {hasNextPage ? (
        <div className="w-full h-24 flex items-center justify-center">
          <Loading />
        </div>
      ) : null}
    </div>
  )
}
