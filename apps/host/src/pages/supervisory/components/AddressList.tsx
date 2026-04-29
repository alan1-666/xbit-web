import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { ReactComponent as AddressIcon } from '@/components/icon/smart-money/head.svg'
import { shortAddr } from '@/utils/address'
import { fmt } from '@/utils/numbers'
import { WalletAvatar } from '@/components/assets/funding/WalletAvatar'

const redText = 'text-[#FF1B49]'
const greenText = 'text-[#00E497]'
const centerHeader = 'text-[#6C6A76] text-center w-full'
const centerCell = 'w-full flex justify-center items-center text-center text-[13px] text-[#FBFBFB] font-light'

type Row = {
  address: string
  positionType: string
  leverageType?: string | null
  leverageValue?: number | null
  entryPx?: string | number | null
  liquidationPx?: string | number | null
  marginUsed?: string | number | null
  positionValue?: string | number | null
  unrealizedPnl?: string | number | null
  returnOnEquity?: string | number | null
  crossMarginRatio?: string | number | null
  szi?: number | string | undefined
  coin?: string | null  
}

function toNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const getColumns = (t): ColumnDef<Row>[] => [
  {
    accessorKey: 'address',
    header: () => <span className={centerHeader}>{t('smartMoney.supervisory.address')}</span>,
    cell: ({ row }) => (
      <div className="w-full flex">
        <div className="flex items-center gap-2 min-w-0">
          <WalletAvatar
            data-avatar-type="wallet"
            address={row.original.address}
            className="w-7 h-7 shrink-0"
          />
          <span
            className="
              truncate
              text-[#FBFBFB]
            "
            title={row.original.address}
          >
            {shortAddr(row.original.address)}
          </span>
        </div>
      </div>
    ),
    meta: { sortable: false, align: 'left' }
  },

  {
    accessorKey: 'position',
    header: () => <span className={centerHeader}>{t('smartMoney.supervisory.position')}</span>,
    meta: { sortable: false, align: 'center' },
    cell: ({ row }) => {
      const coin = (row.original.coin || '').toUpperCase()
      const size = toNum(row.original.szi)
      const side = size < 0 ? 'short' : 'long'
      const isShort = side === 'short'
      const pv = toNum(row.original.positionValue)

      return (
        <div className={centerCell}>
          <div>
            <p className={`text-[13px] font-semibold ${isShort ? redText : greenText}`}>
              ${fmt.money(pv, false)}{' '}
              <span className={`px-1 rounded ${isShort ? 'bg-[rgba(255,27,73,0.10)]' : 'bg-[rgba(0,228,151,0.10)]'}`}>
                {isShort ? t('smartMoney.supervisory.shortLim') : t('smartMoney.supervisory.longLim')}
              </span>
            </p>
            <p className='text-left'>
              <span className="text-xs text-[#908E9A]">
                {fmt.money(Math.abs(size), false)} {coin}
              </span>
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'lever',
    header: () => <span className={centerHeader}>{t('smartMoney.supervisory.leverage')}</span>,
    meta: { sortable: false, align: 'center' },
    cell: ({ row }) => {
      const lev = toNum(row.original.leverageValue)
      const type = row.original.leverageType === 'cross' ? t('smartMoney.addressDetail.cross') : t('smartMoney.addressDetail.isolated')

      return (
        <div className={centerCell}>
          <span>
            {lev ? `${lev}X` : '--'}{' '}
            <span className="px-1 rounded bg-[rgba(143,53,243,0.10)] text-[#9B2CFC]">{type}</span>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'entryPrice',
    header: () => <span className={centerHeader}>{t('smartMoney.supervisory.averagePositionPrice')}</span>,
    meta: { sortable: false, align: 'center' },
    cell: ({ row }) => (
      <div className={centerCell}>
        <span>${fmt.money(toNum(row.original.entryPx), false)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'liqPrice',
    header: () => <span className={centerHeader}>{t('smartMoney.supervisory.closeOutPrice')}</span>,
    meta: { sortable: false, align: 'center' },
    cell: ({ row }) => (
      <div className={centerCell}>
        <span>${fmt.money(toNum(row.original.liquidationPx), false)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'crossMarginRatio',
    header: () => <span className={centerHeader}>{t('smartMoney.addressDetail.marginUsageRatio')}</span>,
    meta: { sortable: false, align: 'center' },
    cell: ({ row }) => {
      const ratioRaw = Number(row.original.crossMarginRatio || 0)
      const ratio = Number.isFinite(ratioRaw) ? Math.max(0, Math.min(1, ratioRaw)) : 0
      const pct = Number((ratio * 100).toFixed(2))

      return (
        <div className={centerCell}>
          <div className="flex items-center gap-3">
            <div className="h-[6px] w-25 mr-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#A9A9B5]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums text-center">{pct}%</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'pnl',
    header: () => <span className={centerHeader}>{t('smartMoney.addressDetail.unrealizedPnl')}</span>,
    meta: { sortable: false, align: 'right' },
    cell: ({ row }) => {
      const v = toNum(row.original.unrealizedPnl)
      const roe = toNum(row.original.returnOnEquity)
      const isProfit = v >= 0

      return (
        <div className='w-full flex items-center justify-end text-right'>
          <span
            className={`px-2 py-1 rounded ${
              isProfit ? 'text-[#00E497] bg-[rgba(121,119,144,0.16)]' : 'text-[#FF1B49] bg-[rgba(121,119,144,0.16)]'
            }`}
          >
            {v > 0 ? '+' : ''}
            {fmt.money(v, false, 3)}
            {/* {Number.isFinite(roe) && ` (${roe > 0 ? '+' : ''}${(roe * 100).toFixed(2)}%)`} */}
            {Number.isFinite(roe) && ` (${fmt.money(roe * 100)}%)`}
          </span>
        </div>
      )
    },
  },
]

export const AddressList: React.FC<{ data: Row[]; onRowClick?: (row: Row) => void }> = ({ data, onRowClick }) => {
  const { t } = useTranslation()
  const columns = useMemo(() => getColumns(t), [t])

  return (
    <div className="rounded-lg border border-[rgba(121, 119, 144, 0.16)] bg-[#121214] p-3 overflow-hidden text-[13px] font-light">
      <DataTable columns={columns} data={data} maxHeight={600} rowHeight={50} onRowClick={onRowClick} />
    </div>
  )
}
