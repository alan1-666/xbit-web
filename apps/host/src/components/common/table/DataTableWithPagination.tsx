import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { IconEmpty, IconSortDown, IconSortUp } from '@/components/icon'
import { LoadingTable } from '@/components/common/LoadingTable'
import { Trans, useTranslation } from 'react-i18next'

export type SortOrder = 'asc' | 'desc' | null

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  totalCount?: number
  isLoading?: boolean
  isLostNetwork?: boolean
  pageSize?: number
  currentPage?: number // Prop mới để bạn quản lý từ bên ngoài
  onPageChange?: (page: number) => void
  onSortChange?: (sortKey: string | null, sortOrder: SortOrder) => void
  onRowClick?: (row: T) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
  isManualPagination?: boolean
  defaultSorting?: SortingState
  enableSortingRemoval?: boolean | ((options: { column: Column<T> }) => boolean)
}

export function DataTableWithPagination<T>({
  data,
  columns,
  totalCount = 0,
  isLoading = false,
  isLostNetwork = false,
  onPageChange,
  onSortChange,
  onRowClick,
  pageSize = 10,
  currentPage = 1,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 40, 50],
  isManualPagination = true,
  defaultSorting = [],
  enableSortingRemoval = true,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const effectiveTotalCount = isManualPagination ? totalCount : data.length
  const totalPages = useMemo(() => Math.ceil(effectiveTotalCount / pageSize), [effectiveTotalCount, pageSize])
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    // enableSortingRemoval: enableSortingRemoval as any,
    manualPagination: isManualPagination,
    rowCount: isManualPagination ? totalCount : undefined,
    // manualSorting: true,
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater

      let finalSorting = nextSorting
      if (nextSorting.length === 0 && sorting.length > 0) {
        const currentSort = sorting[0]
        let canRemove = true

        if (typeof enableSortingRemoval === 'function') {
          // Create a minimal mock column with ID to satisfy the check
          canRemove = enableSortingRemoval({ column: { id: currentSort.id } } as any)
        } else if (typeof enableSortingRemoval === 'boolean') {
          canRemove = enableSortingRemoval
        }

        if (!canRemove) {
          // Prevent removal: toggle direction instead
          finalSorting = [{ ...currentSort, desc: !currentSort.desc }]
        }
      }

      setSorting(finalSorting)

      if (finalSorting.length > 0) {
        // onSortChange?.(finalSorting[0].id, finalSorting[0].desc ? 'desc' : 'asc')
        const sortId = finalSorting[0].id
        const direction = finalSorting[0].desc ? 'desc' : 'asc'
        onSortChange?.(sortId, direction)
      } else {
        onSortChange?.(null, null)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const getSortIcon = (column: any) => {
    const isSorted = column.getIsSorted()
    return (
      <div className="flex items-center flex-col ml-1">
        <IconSortUp currentColor={isSorted === 'asc' ? '#9B2CFC' : '#645F7B'} />
        <IconSortDown currentColor={isSorted === 'desc' ? '#9B2CFC' : '#645F7B'} />
      </div>
    )
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      if (totalPages > 1) pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border-none bg-[#121214] overflow-hidden">
        <Table className="w-full  ">
          <TableHeader className="bg-[#1F1E25]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        'h-9.5 text-[12px] text-[#6C6A74] select-none',
                        isSortable && 'cursor-pointer hover:text-gray-200',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          'flex items-center',
                          header.column.columnDef.meta?.align === 'center' && 'justify-center',
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && getSortIcon(header.column)}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLostNetwork ? (
              <TableRow className="border-none">
                <TableCell colSpan={columns.length} className="text-center py-8 h-90">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-[#6C6A74] text-sm">{t('table.lostNetwork')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow className="border-none">
                <TableCell colSpan={columns.length} className="text-center py-8 h-[360px]">
                  <div className="flex items-center justify-center">
                    <LoadingTable />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow className="border-none">
                <TableCell colSpan={columns.length} className="text-center py-8 h-[360px]">
                  <div className="flex items-center justify-center flex-col">
                    <IconEmpty />
                    <span className="text-[#6C6A74] text-[14px] leading-[1.2] text-center">{t('history.nodata')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn('border-none hover:bg-zinc-900/50 transition-colors', {
                    'bg-[#121214]': index % 2 === 0,
                    'bg-[#18181b]': index % 2 !== 0,
                  })}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-[#CACACA] py-4 text-[12px] leading-none"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between gap-4 w-fit ml-auto mb-6 mt-8">
        <div className="text-sm text-gray-400">
          <Trans
            i18nKey="table.totalItems"
            values={{ total: effectiveTotalCount }}
            components={{
              1: <span className="font-semibold text-gray-300" />,
            }}
          />
          {/* {t('table.totalItems', { total: effectiveTotalCount })} */}
          {/* 共 <span className="font-semibold text-gray-300">{effectiveTotalCount}</span> 条 */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (typeof page === 'number' && page !== currentPage) {
                  onPageChange?.(page)
                }
              }}
              className={cn(
                'h-8 w-8 rounded text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : typeof page === 'number'
                    ? 'border border-zinc-700 bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                    : 'text-gray-400 cursor-default',
              )}
            >
              {page}
            </button>
          ))}

          <Button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        <Select
          value={pageSize.toString()}
          onValueChange={(val) => {
            onItemsPerPageChange?.(Number(val))
          }}
        >
          <SelectTrigger className="w-fit min-w-24 h-8 border-zinc-700 bg-zinc-900 text-gray-300 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-gray-300">
            {itemsPerPageOptions.map((opt) => (
              <SelectItem key={opt} value={opt.toString()}>
                {/* {opt} 条 */}
                {t('table.perPage', { total: opt })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
