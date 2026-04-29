import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ElementType } from 'react'
import { DataTableProps } from '@components/common/datatables/DataTableProps.tsx'
import { Table } from '@components/ui/table.tsx'
import { PureDataTableHeader } from '@components/common/datatables/PureDataTableHeader.tsx'
import { PureDataTableBody } from '@components/common/datatables/PureDataTableBody.tsx'

export const PureDataTable = <T, R extends ElementType = 'div'>(props: DataTableProps<T, R>) => {
  const {
    data,
    columns,
    sorting,
    onSortingChange,
    getRowId,
    headerRowClassName,
    headerCellClassName,
    headerClassName,
    rowClassName,
    cellWrapper,
    cellWrapperPropsFn,
    striped,
    onRowClick,
    cellClassName,
  } = props
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

  return (
    <Table>
      <PureDataTableHeader
        table={table}
        headerClassName={headerClassName}
        headerRowClassName={headerRowClassName}
        headerCellClassName={headerCellClassName}
      />
      <PureDataTableBody<T, R>
        table={table}
        rowClassName={rowClassName}
        cellWrapper={cellWrapper}
        cellWrapperPropsFn={cellWrapperPropsFn}
        striped={striped}
        onRowClick={onRowClick}
        cellClassName={cellClassName}
      />
    </Table>
  )
}
