import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ColumnDefWithMeta } from '@/pages/meme/discover/desktop/components/DataTable'

const LoadingState = ({ columns }: { columns: ColumnDefWithMeta<any>[] }) => {
  return (
    <div className="w-full">
      <div className="hidden xl:block">
        <Table className="border-none">
          <TableHeader className="bg-transparent border-b border-white/10">
            <TableRow className="flex w-full border-b border-white/5 hover:bg-white/5">
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className="flex items-center font-normal text-[#FFFFFF80] text-[calc(14rem/16)]"
                  style={col.meta?.style}
                >
                  {typeof col.header === 'function'
                    ? col.header({ column: { getIsSorted: () => false } } as any)
                    : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow
                key={index}
                className="flex w-full box-border border-b border-white/5 hover:bg-white/5"
                style={{ height: 48 }}
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="flex items-center" style={col.meta?.style}>
                    <Skeleton className="h-[20px] w-[80%] rounded-[4px] bg-white/10" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4 xl:hidden px-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-4">
            <Skeleton className="h-12 w-12 rounded-sm bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded bg-white/10" />
              <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingState
