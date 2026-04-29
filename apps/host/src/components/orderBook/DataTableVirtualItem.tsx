import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  Row,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import React, { useState, useRef, CSSProperties, useEffect } from 'react'
import { cn } from '@/lib/utils.ts'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link } from 'react-router-dom'

interface DataTableVirtualItemProps<TData, TValue> {
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
  onRowClick?: (data: any) => void
  onBottomReached?: () => void
  estimateSize?: number
  handleBgRowClassName?: (row: Row<TData>) => string
  handleBgRowStyle?: (row: Row<TData>) => CSSProperties
  noDataText?: string
  isShowCta?: boolean
}

export function DataTableVirtualItem<TData, TValue>({
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
  estimateSize = 20,
  handleBgRowStyle,
  handleBgRowClassName,
  noDataText,
  isShowCta = false,
}: DataTableVirtualItemProps<TData, TValue>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>([])
  const parentRef = useRef<HTMLTableElement>(null)

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

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize, // Adjust if your row height differs
    overscan: 10,
  })

  const totalSize = rowVirtualizer.getTotalSize()
  const virtualRows = rowVirtualizer.getVirtualItems()

  const headerWidths = useRef<number[]>([])

  useEffect(() => {
    const headers = document.querySelectorAll('thead th')
    headerWidths.current = Array.from(headers).map((th) => th.getBoundingClientRect().width)
  }, [columns, sorting, data])

  return (
    <div
      ref={parentRef}
      className={cn('rounded-md border overflow-auto', containerClassName, isStickyHeader && 'relative')}
    >
      <Table
        className={cn(tableClassName, isStickyHeader && 'relative w-full h-full')}
        onScroll={(event: React.UIEvent<HTMLDivElement>) => {
          const target = event.currentTarget

          const isVerticalScrollNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 10

          if (isVerticalScrollNearBottom && target.scrollTop > 0) {
            const el = parentRef.current
            if (el && el.scrollTop + el.clientHeight >= el.scrollHeight * 0.75) {
              onBottomReached?.()
            }
          }
        }}
      >
        <TableHeader className={cn(tableHeaderClassName, isStickyHeader ? ' sticky-table-header' : '')}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={cn('z-0', tableHeadClassName, index === 0 && isStickyFirstColumn && 'sticky left-0 z-1')}
                  style={{
                    ...(headerWidths.current[index] !== undefined && {
                      width: `${headerWidths.current[index] + 2 * index + 5}px`,
                    }),
                    ...(index === 0 && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                  }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          className={cn('relative', tableBodyClassName)}
          style={{ height: `${totalSize}px`, position: 'relative' }}
        >
          {rows.length === 0 ? (
            <TableRow className={cn('!w-full')}>
              <TableCell colSpan={columns.length} className={cn('!h-[240px] text-center ', tableCellClassName)}>
                <div className="!w-full flex flex-col items-center justify-center fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <IconEmpty />
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
              </TableCell>
            </TableRow>
          ) : (
            virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(tableBodyRowClassName, 'absolute w-full')}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    top: 0,
                    left: 0,
                  }}
                  onClick={() => {
                    onRowClick?.(row.original)
                    console.log('row', row)
                  }}
                >
                  <td className={cn(handleBgRowClassName?.(row))} style={handleBgRowStyle?.(row)}></td>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'z-0',
                        tableCellClassName,
                        index === 0 && isStickyFirstColumn && 'sticky left-0 z-1',
                      )}
                      style={{
                        ...(headerWidths.current[index] !== undefined && {
                          width: `${headerWidths.current[index] + 2 * index + 5}px`,
                        }),
                        ...(index === 0 && isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
