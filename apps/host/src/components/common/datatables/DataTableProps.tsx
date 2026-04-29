import { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from 'react'
import { DataTableHandle } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { OnChangeFn, Row, SortingState, ColumnDef } from '@tanstack/react-table'

export interface DataTableBodyProps<T, R extends ElementType = 'div'> {
  tableBodyClassName?: string
  cellWrapper?: R
  cellWrapperPropsFn?: (row: T) => ComponentPropsWithoutRef<R>
  striped?: boolean
  onRowClick?: (row: T) => void
  rowClassName?: string
  cellClassName?: string
}

export interface DataTableHeaderProps {
  headerClassName?: string
  headerRowClassName?: string
  headerCellClassName?: string
}

export interface DataTableProps<T, R extends ElementType = 'div'>
  extends DataTableBodyProps<T, R>,
    DataTableHeaderProps {
  className?: string
  data: T[]
  columns: ColumnDef<T>[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onLoadMore?: () => void
  isLoading?: boolean
  rowHeight?: number
  getRowId?: (originalRow: T, index: number, parent?: Row<T>) => string
  hasNextPage?: boolean
  ref?: Ref<DataTableHandle>
  noDataComponent?: ReactNode
  tableClassName?: string
}
