import React, { useMemo, useRef } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { IconEmpty } from '@components/icon'
import { ReactComponent as ArrowDownIcon } from '@/components/icon/supervisory/long_arrow_down.svg'
import { ReactComponent as ArrowTopIcon } from '@/components/icon/supervisory/long_arrow_top.svg'
import { ReactComponent as ArrowMiddleIcon } from '@/components/icon/supervisory/long_arrow_middle.svg'
import { useTranslation } from 'react-i18next'
import { EmptyList } from '../discover/EmptyList'

// 配置项
type ColumnMeta = {
  sortable?: boolean
  defaultSort?: 'asc' | 'desc'
  sortBy?: string
  compare?: (a: unknown, b: unknown) => number
  align?: 'left' | 'center' | 'right'
}

type Props<T extends object> = {
  columns: ColumnDef<T, any>[]
  data: T[]
  rowKey?: (row: T, index: number) => string | number
  minWidth?: number | string
  maxHeight?: string
  rowHeight?: number
  onRowClick?: (row: T) => void
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  minWidth = '100%',
  maxHeight,
  rowHeight = 48,
  onRowClick,
}: Props<T>) {
  const { t } = useTranslation()

  if (!columns || columns.length === 0) {
    return (
      <div className="flex justify-center items-center text-center">
        <IconEmpty />
        <div className="text-white/50 p-4">{t('smartMoney.addressDetail.noColumns')}</div>
      </div>
    )
  }

  // Sorting
  const normalizedColumns = useMemo(() => {
    return columns.map((col) => {
      const meta = (col.meta || {}) as ColumnMeta
      if (!meta.sortable) return col
      const next = { ...col } as any
      next.enableSorting = true

      if (meta.sortBy || meta.compare) {
        next.sortingFn = (rowA: any, rowB: any, columnId: string) => {
          const pick = (row: any) => (meta.sortBy ? row.original?.[meta.sortBy] : row.getValue(columnId))
          const a = pick(rowA)
          const b = pick(rowB)
          if (meta.compare) return meta.compare(a, b)

          const na = Number(a)
          const nb = Number(b)
          const bothNum = Number.isFinite(na) && Number.isFinite(nb)
          if (bothNum) return na - nb
          return String(a ?? '').localeCompare(String(b ?? ''))
        }
      }

      return next
    })
  }, [columns])

  const sortingEnabled = useMemo(
    () => normalizedColumns.some((c) => (c.meta as ColumnMeta)?.sortable),
    [normalizedColumns],
  )

  const defaultSorting = useMemo<SortingState>(() => {
    if (!sortingEnabled) return []
    return normalizedColumns
      .map((c) => {
        const meta = c.meta as ColumnMeta
        const id =
          typeof (c as any).id === 'string'
            ? (c as any).id
            : typeof (c as any).accessorKey === 'string'
              ? (c as any).accessorKey
              : undefined
        return meta?.defaultSort && id ? { id, desc: meta.defaultSort === 'desc' } : undefined
      })
      .filter((s): s is NonNullable<typeof s> => !!s)
  }, [normalizedColumns, sortingEnabled])

  const [sorting, setSorting] = React.useState<SortingState>(() => defaultSorting)

  const table = useReactTable({
    data,
    columns: normalizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any, index) => row?.id ?? String(index),
    state: sortingEnabled ? { sorting } : {},
    onSortingChange: sortingEnabled ? setSorting : undefined,
    getSortedRowModel: sortingEnabled ? getSortedRowModel() : undefined,
    enableSorting: sortingEnabled,
  })

  // virtualization only when data.length >= 100
  const useVirtual = data.length >= 100
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  })

  const virtualRows = useVirtual ? rowVirtualizer.getVirtualItems() : []
  const paddingTop = useVirtual && virtualRows.length > 0 ? virtualRows[0].start || 0 : 0
  const paddingBottom =
    useVirtual && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1].end || 0)
      : 0

  const containerStyle = {
    position: 'relative',
    maxHeight: maxHeight ?? '100%',
  }

  return (
    <div ref={parentRef} className="overflow-auto" style={containerStyle}>
      <table className="min-w-full border-separate" style={{ borderSpacing: 0, minWidth }}>
        <thead className="sticky top-0 z-10 bg-[#121319]">
          {table.getHeaderGroups().map((hg, index) => (
            <tr key={hg.id} className="text-xs text-white/60">
              {hg.headers.map((h, i) => {
                const canSort = sortingEnabled && h.column.getCanSort()
                const sorted = canSort ? h.column.getIsSorted() : false
                const meta = h.column.columnDef.meta as ColumnMeta | undefined
                const align = meta?.align ?? 'center'
                const alignCls = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                const columnSize = (h.column.columnDef as any).size
                return (
                  <th
                    key={h.id}
                    className={`h-[50px] pr-3 border-b border-white/10 ${alignCls} ${
                      canSort ? 'cursor-pointer select-none' : ''
                    }`}
                    onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                    title={canSort ? 'Click to sort' : undefined}
                    style={{
                      width: columnSize ? `${columnSize}px` : 'auto',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span className="inline-flex items-center gap-1 align-middle">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      {canSort && (
                        <span className="inline-block text-white/40">
                          {sorted === 'asc' ? (
                            <ArrowTopIcon />
                          ) : sorted === 'desc' ? (
                            <ArrowDownIcon className="text-[#FBFBFB]" />
                          ) : (
                            // <ArrowMiddleIcon />
                            <></>
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {useVirtual ? (
            <>
              {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }} />}
              {virtualRows.map((vr) => {
                const row = table.getRowModel().rows[vr.index]
                return (
                  <tr
                    key={rowKey ? rowKey(row.original, vr.index) : ((row.original as any)?.id ?? row.id)}
                    className={`text-sm ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
                    style={{ height: `${rowHeight}px` }}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell, i) => {
                      const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                      const align = meta?.align ?? 'center'
                      const alignCls = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                      const columnSize = (cell.column.columnDef as any).size
                      return (
                        <td
                          key={cell.id}
                          className={`py-3 pr-3 ${alignCls}`}
                          style={{
                            width: columnSize ? `${columnSize}px` : 'auto',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }} />}
            </>
          ) : (
            <>
              {table.getRowModel().rows.map((row, rIdx) => (
                <tr
                  key={rowKey ? rowKey(row.original, rIdx) : ((row.original as any)?.id ?? row.id)}
                  className={`text-sm ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, i) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                    const align = meta?.align ?? 'center'
                    const alignCls = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                    const columnSize = (cell.column.columnDef as any).size
                    return (
                      <td
                        key={cell.id}
                        className={`py-3 pr-3 ${alignCls}`}
                        style={{
                          width: columnSize ? `${columnSize}px` : 'auto',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {data.length === 0 && (
                <tr className="h-[300px]">
                  <td colSpan={999} className="p-0">
                    <EmptyList />
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
