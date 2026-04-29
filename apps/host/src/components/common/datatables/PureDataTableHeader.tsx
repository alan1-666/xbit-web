import { flexRender, Table } from '@tanstack/react-table'
import { TableHead, TableHeader, TableRow } from '@components/ui/table.tsx'
import { DataTableHeaderProps } from '@components/common/datatables/DataTableProps.tsx'

export interface PureDataTableHeaderProps<T> extends DataTableHeaderProps {
  table: Table<T>
}
export const PureDataTableHeader = <T,>(props: PureDataTableHeaderProps<T>) => {
  const { table, headerCellClassName, headerClassName, headerRowClassName } = props
  return (
    <TableHeader className={headerClassName}>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className={headerRowClassName}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id} className={headerCellClassName}>
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}
