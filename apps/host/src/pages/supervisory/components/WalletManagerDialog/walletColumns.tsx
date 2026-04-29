import { ColumnDef } from '@tanstack/react-table'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactComponent as HeadIcon } from '@/components/icon/smart-money/head.svg'
import { AddressResponse } from '../../types'
import { EditableAddressLabel } from '@/components/EditableAddressLabel'
import type { TFunction } from 'i18next'
import { memo } from 'react'
import { WalletAvatar } from '@/components/assets/funding/WalletAvatar'

const formatProfit = (v: number) => {
  if (v === 0) return '0'
  const val = Math.abs(v).toLocaleString()
  return v >= 0 ? `+${val}` : `-${val}`
}

const MemoizedEditableAddressLabel = memo(EditableAddressLabel)

export const walletColumnsFactory = (args: {
  t: TFunction
  onDelete: (id: string) => Promise<void>
  onCopy: (id: string) => Promise<void>
  onSaveRemark: (id: string, nextText: string, address: string) => Promise<void>
}): ColumnDef<AddressResponse>[] => [
  {
    accessorKey: 'address',
    header: args.t('smartMoney.supervisory.address'),
    meta: { sortable: false },
    cell: ({ row }) => {
      const { id, address, remarkName } = row.original

      return (
        <div className="flex items-center gap-2">
          <Star
            size={18}
            className="text-[#9B2CFC] hover:text-yellow-400 cursor-pointer"
            fill="#9B2CFC"
            onClick={() => args.onDelete(id)}
          />
          <WalletAvatar
            data-avatar-type="wallet"
            address={address}
            className="w-7 h-7 shrink-0"
          />
          <MemoizedEditableAddressLabel
            address={address}
            remarkName={remarkName}
            onCopy={() => args.onCopy(id)}
            onSave={(nextText) => args.onSaveRemark(id, nextText, address)}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'profit1d',
    header: args.t('smartMoney.supervisory.profit1d'),
    meta: { sortable: true, sortBy: 'profit1d', defaultSort: 'desc' },
    cell: ({ row }) => (
      <span
        className={cn(
          'text-right',
          !row.original.profit1d || row.original.profit1d < 0 ? 'text-red-400' : 'text-green-400',
        )}
      >
        {formatProfit(row.original.profit1d || 0)}
      </span>
    ),
  },
  {
    accessorKey: 'profit7d',
    header: args.t('smartMoney.supervisory.profit7d'),
    meta: { sortable: true, sortBy: 'profit7d' },
    cell: ({ row }) => (
      <span
        className={cn(
          'text-right',
          !row.original.profit7d || row.original.profit7d < 0 ? 'text-red-400' : 'text-green-400',
        )}
      >
        {formatProfit(row.original.profit7d || 0)}
      </span>
    ),
  },
  {
    accessorKey: 'profit30d',
    header: args.t('smartMoney.supervisory.profit30d'),
    meta: { sortable: true, sortBy: 'profit30d' },
    cell: ({ row }) => (
      <span
        className={cn(
          'text-right',
          !row.original.profit30d || row.original.profit30d < 0 ? 'text-red-400' : 'text-green-400',
        )}
      >
        {formatProfit(row.original.profit30d || 0)}
      </span>
    ),
  },
]
