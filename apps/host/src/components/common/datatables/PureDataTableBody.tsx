import { flexRender, Table } from '@tanstack/react-table'
import { TableBody, TableCell, TableRow } from '@components/ui/table.tsx'
import { DataTableBodyProps } from '@components/common/datatables/DataTableProps.tsx'
import { ComponentPropsWithoutRef, ElementType, Fragment } from 'react'
import { cn } from '@/lib/utils.ts'

export interface PureDataTableBodyProps<T, R extends ElementType> extends DataTableBodyProps<T, R> {
  table: Table<T>
}

export const PureDataTableBody = <T, R extends ElementType>(props: PureDataTableBodyProps<T, R>) => {
  const {
    table,
    rowClassName,
    cellWrapper: CellWrapper = Fragment,
    cellWrapperPropsFn = () => ({}) as ComponentPropsWithoutRef<R>,
    striped = false,
    onRowClick,
    cellClassName,
  } = props
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => {
        const wrapperProps = cellWrapperPropsFn?.(row.original)
        return (
          <TableRow
            key={row.id}
            className={cn(
              'box-border border-b border-[#ECECED0A] cursor-pointer hover:bg-[#ECECED1F]',
              striped && row.index % 2 === 1 ? 'bg-[#ECECED0A]' : '',
              rowClassName,
            )}
            onClick={() => onRowClick?.(row.original)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className={cn(cellClassName, cell.column.columnDef.meta?.className)}>
                <CellWrapper key={cell.id} {...wrapperProps}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </CellWrapper>
              </TableCell>
            ))}
          </TableRow>
        )
      })}
    </TableBody>
  )
}
