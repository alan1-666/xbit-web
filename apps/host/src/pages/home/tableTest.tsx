import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { Button } from '@/components/ui/button'
import { IconSortDown, IconSortUp } from '@/components/icon'

type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

const payments: Payment[] = Array(1000).fill({
    id: Math.random().toString(),
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
  })

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  { 
    accessorKey: 'email',
    header: ({ column }) => {
      const sorted = column.getIsSorted()
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          {/* <div>
            <IconSortUp currentColor={sorted === 'asc' ? '' : '#E2E8F0'} className="!w-2 !h-2" />
            <IconSortDown currentColor={sorted === 'desc' ? '' : '#E2E8F0'} className="!w-2 !h-2" />
          </div> */}
        </Button>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]

const TableTest = () => {
  return (
    <div>
      <DataTable columns={columns} data={payments} />
    </div>
  )
}

export default TableTest
