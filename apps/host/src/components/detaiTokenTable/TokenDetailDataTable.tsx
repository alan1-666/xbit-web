import {
  Cell,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
  HTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils.ts'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { TokenDetailColumnKeys } from '@/types/enums.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'

interface DataTableProps<TData, TValue> {
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  isNormalRender?: boolean
  allowShowEmptyIcon?: boolean
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
  loading?: boolean
  rowHeight?: number
  onVisibleItemsChanged: (items: TData[]) => void
  isPC?: boolean
  setIsScrollingDown?: Dispatch<SetStateAction<boolean>>
  paused?: boolean
  tableBodyProps?: HTMLAttributes<HTMLTableSectionElement>
}

// Export interface cho ref handle
export interface TokenDetailDataTableHandle {
  scrollToTop: () => void
}

// memo Header component
const MemoizedTableHeader = memo<{
  headerGroups: any[]
  tableHeaderClassName?: string
  tableHeaderRowClassName?: string
  tableHeadClassName?: string
  isStickyHeader?: boolean
  isStickyFirstColumn?: boolean
  stickyBg?: string
}>(
  ({
    headerGroups,
    tableHeaderClassName,
    tableHeaderRowClassName,
    tableHeadClassName,
    isStickyHeader,
    isStickyFirstColumn,
    stickyBg,
  }) => {
    return (
      <TableHeader className={cn(tableHeaderClassName, isStickyHeader && 'sticky top-0 z-[10]')}>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
            {headerGroup.headers.map((header: any, index: any) => (
              <TableHead
                key={header.id}
                className={cn('z-0', tableHeadClassName, index === 0 && isStickyFirstColumn && 'sticky left-0 z-[10]')}
                style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.headerGroups.length === nextProps.headerGroups.length &&
      prevProps.tableHeaderClassName === nextProps.tableHeaderClassName &&
      prevProps.tableHeaderRowClassName === nextProps.tableHeaderRowClassName &&
      prevProps.tableHeadClassName === nextProps.tableHeadClassName &&
      prevProps.isStickyHeader === nextProps.isStickyHeader &&
      prevProps.isStickyFirstColumn === nextProps.isStickyFirstColumn &&
      prevProps.stickyBg === nextProps.stickyBg
    )
  },
)

MemoizedTableHeader.displayName = 'MemoizedTableHeader'

const TokenDetailDataTable = forwardRef<TokenDetailDataTableHandle, DataTableProps<any, any>>(
  (
    {
      getRowId,
      isNormalRender,
      allowShowEmptyIcon = true,
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
      loading,
      rowHeight = 40, // Default row height
      onVisibleItemsChanged,
      isPC,
      setIsScrollingDown,
      tableBodyProps,
      // paused,
    },
    ref,
  ) => {
    const { t } = useTranslation()
    const [sorting, setSorting] = useState<SortingState>([])
    const tableContainerRef = useRef<HTMLDivElement>(null)
    // const [data, setData] = useState(originalData)
    //
    // useEffect(() => {
    //   if (paused) return
    //   setData(originalData)
    // }, [paused, originalData])

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { sorting },
      getRowId
    })

    const { rows } = table.getRowModel()

    const headerGroups = useMemo(() => table.getHeaderGroups(), [table.options.columns])

    const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => tableContainerRef.current,
      estimateSize: () => rowHeight,
    })

    useImperativeHandle(
      ref,
      () => ({
        scrollToTop: () => {
          if (virtualizer) {
            virtualizer.scrollToIndex(0)
          }
        },
      }),
      [virtualizer],
    )

    const lastScrollTopRef = useRef(0)
    const SCROLL_THRESHOLD = 50 // Must scroll at least 50px to detect

    useEffect(() => {
      if (!setIsScrollingDown) return

      const container = tableContainerRef.current
      if (!container) return

      const handleScroll = () => {
        const currentScrollTop = container.scrollTop
        const scrollDiff = currentScrollTop - lastScrollTopRef.current

        if (scrollDiff >= SCROLL_THRESHOLD) {
          setIsScrollingDown?.(true)
          lastScrollTopRef.current = currentScrollTop
        } else if (scrollDiff <= -SCROLL_THRESHOLD) {
          setIsScrollingDown?.(false)
          lastScrollTopRef.current = currentScrollTop
        }
      }

      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    const paddingTop = virtualizer.getVirtualItems().length > 0 ? virtualizer.getVirtualItems()[0]?.start || 0 : 0
    const paddingBottom =
      virtualizer.getVirtualItems().length > 0
        ? virtualizer.getTotalSize() -
          (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end || 0)
        : 0

    const handleRowClick = (row: Row<any>) => {
      onRowClick?.(row.original)
    }

    // useEffect(() => {
    //   // Re-measure after data changes
    //   virtualizer.measure()
    // }, [data, virtualizer])

    useEffect(() => {
      const virtualItems = virtualizer.getVirtualItems()
      const visibleItems = virtualItems.map((item) => rows[item.index].original)
      onVisibleItemsChanged(visibleItems)
    }, [virtualizer.getVirtualItems()])

    useEffect(() => {
      const lastItem = virtualizer.getVirtualItems().slice(-1)[0]
      if (lastItem && lastItem.index === rows.length - 1) {
        onBottomReached?.()
      }
    }, [virtualizer.getVirtualItems(), rows.length])

    const renderCell = (cell: Cell<any, unknown>, index: number) => {
      const commonProps = {
        key: cell.id,
        className: cn('z-0', tableCellClassName, index === 0 && isStickyFirstColumn && 'sticky left-0 z-1'),
        style: isStickyFirstColumn && stickyBg ? { background: stickyBg } : {},
      }

      const txType = (cell.row.original as RealtimeTransaction).type
      const filterTxType = txType === RealtimeTransactionType.AddLiquidity ||
        txType === RealtimeTransactionType.RemoveLiquidity ||
        txType === RealtimeTransactionType.Burn
      if (
        filterTxType && !isNormalRender
      ) {
        if (cell.column.id === TokenDetailColumnKeys.SOLD_PRICE || cell.column.id === TokenDetailColumnKeys.VOLUME) {
          return null
        }
        if (cell.column.id === TokenDetailColumnKeys.TRANSACTION_AMOUNT) {
          return (
            <TableCell {...commonProps} key={commonProps.key} colSpan={3}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        }
      }

      return (
        <TableCell {...commonProps} key={commonProps.key}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      )
    }

    const renderBody = () => {
      if (loading) {
        return (
          <TableRow className={tableBodyRowClassName}>
            <TableCell colSpan={columns.length} className={cn('h-24 text-center', tableCellClassName)}>
              <Skeleton className="w-full h-full" />
            </TableCell>
          </TableRow>
        )
      }

      if (rows.length === 0 && allowShowEmptyIcon) {
        return (
          <TableRow className={cn(tableBodyRowClassName, 'h-24')}>
            <TableCell colSpan={columns.length} className={cn('h-24 text-center', tableCellClassName)}>
              <div className="flex flex-col items-center justify-center fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <IconEmpty />
                <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
              </div>
            </TableCell>
          </TableRow>
        )
      }

      return (
        <>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <TableRow
                key={row.id}
                data-index={virtualRow.index}
                ref={(el) => virtualizer.measureElement(el)}
                data-state={row.getIsSelected() && 'selected'}
                className={tableBodyRowClassName}
                onClick={() => handleRowClick(row)}
              >
                {row.getVisibleCells().map(renderCell)}
              </TableRow>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </>
      )
    }

    return (
      <div
        ref={tableContainerRef}
        className={cn(
          'rounded-md border overflow-y-auto no-scrollbar',
          containerClassName,
          isStickyHeader && 'relative',
        )}
      >
        <Table className={cn(tableClassName, isStickyHeader && 'relative w-full h-full')}>
          {!isPC ? (
            <TableHeader className={cn(tableHeaderClassName, isStickyHeader && 'sticky top-0 z-[10]')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={tableHeaderRowClassName}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'z-0',
                        tableHeadClassName,
                        index === 0 && isStickyFirstColumn && 'sticky left-0 z-[10]',
                      )}
                      style={isStickyFirstColumn && stickyBg ? { background: stickyBg } : {}}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          ) : (
            <MemoizedTableHeader
              headerGroups={headerGroups}
              tableHeaderClassName={tableHeaderClassName}
              tableHeaderRowClassName={tableHeaderRowClassName}
              tableHeadClassName={tableHeadClassName}
              isStickyHeader={isStickyHeader}
              isStickyFirstColumn={isStickyFirstColumn}
              stickyBg={stickyBg}
            />
          )}

          <TableBody className={tableBodyClassName} {...tableBodyProps}>
            {renderBody()}
          </TableBody>
        </Table>
      </div>
    )
  },
)

TokenDetailDataTable.displayName = 'TokenDetailDataTable'

// @ts-ignore
export default TokenDetailDataTable
