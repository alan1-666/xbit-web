import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  Row,
  getFilteredRowModel,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'

interface DraggableDataTableProps<TData, TValue> {
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
  ref?: React.Ref<HTMLDivElement>
  isLoading?: boolean
  // Thay đổi định nghĩa generic cho DraggableRowComponent
  DraggableRowComponent: React.ComponentType<{ row: Row<TData>; children: React.ReactNode }>
}

export function DraggableDataTable<TData, TValue>({
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
  ref,
  DraggableRowComponent,
  isLoading,
}: DraggableDataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>([])
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

  return (
    <div
      className={cn('rounded-md border overflow-auto', containerClassName, isStickyHeader && 'relative')}
      onScroll={handleScroll}
      ref={ref}
    >
      <Table className={cn(tableClassName, isStickyHeader && 'relative w-full h-full')}>
        <TableHeader className={cn(tableHeaderClassName, isStickyHeader && 'sticky top-0 z-2')}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn('z-0', tableHeadClassName, index === 0 && isStickyFirstColumn && 'sticky left-0 z-1')}
                    style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={tableBodyClassName}>
          {isLoading &&
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={3}>
                  <Skeleton key={i} className="h-[63px] mb-1" />
                </td>
              </tr>
            ))}

          {!isLoading && (
            <>
              {table.getRowModel().rows?.length === 0 ? (
                <TableRow className={tableBodyRowClassName}>
                  <TableCell colSpan={columns.length} className={cn('h-24 text-center', tableCellClassName)}>
                    <div className="flex flex-col items-center justify-center fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <IconEmpty />
                      <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <DraggableRowComponent key={row.id} row={row}>
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'z-0',
                          tableCellClassName,
                          index === 0 && isStickyFirstColumn && 'sticky left-0 z-1',
                        )}
                        style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
                        onClick={() => handleRowClick(row)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </DraggableRowComponent>
                ))
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
