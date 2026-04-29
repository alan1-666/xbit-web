import React, { useMemo, useState } from 'react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { usePositionsStore, TabKey } from '../store/usePositionsStore'
import { formatCurrency } from '@/utils/address'
import { useHyperliquidActiveAssetCtx } from '@/hooks/useHyperliquidActiveAssetCtx'
import { IconEmpty } from '@components/icon'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import PositionCard from './mobile/PositionCard'

type Props = { address?: string }

export type TablesPayload = Record<TabKey, any[]>

export const PositionsTabs: React.FC<Props> = () => {
  const { isDesktop } = useResponsive()

  const [active, setActive] = useState<TabKey>('positions')
  const data = usePositionsStore((s) => s.data)
  const { t } = useTranslation()

  /* const TABS: { key: TabKey; label: string }[] = [
    { key: 'positions', label: t('smartMoney.addressDetail.openPositions') },
    { key: 'openOrders', label: t('smartMoney.addressDetail.openOrders') },
    { key: 'twap', label: 'TWAP' },
    { key: 'trades', label: t('smartMoney.addressDetail.tradeHistory') },
    // { key: "completedTrades", label: "Completed Trades" },
    { key: 'funding', label: t('smartMoney.addressDetail.fundingFeeHistory') },
    { key: 'orderHistory', label: t('smartMoney.addressDetail.orderHistory') },
    { key: 'account', label: t('smartMoney.addressDetail.accountHistory') },
  ] */

  const TABS: { key: TabKey | ('positions' | 'openOrders' | 'trades'); label: string }[] = isDesktop
    ? [
        { key: 'positions', label: t('smartMoney.addressDetail.openPositions') },
        { key: 'openOrders', label: t('smartMoney.addressDetail.openOrders') },
        { key: 'twap', label: 'TWAP' },
        { key: 'trades', label: t('smartMoney.addressDetail.tradeHistory') },
        // { key: "completedTrades", label: "Completed Trades" },
        { key: 'funding', label: t('smartMoney.addressDetail.fundingFeeHistory') },
        { key: 'orderHistory', label: t('smartMoney.addressDetail.orderHistory') },
        { key: 'account', label: t('smartMoney.addressDetail.accountHistory') },
      ]
    : [
        { key: 'positions', label: t('smartMoney.addressDetail.openPositions') },
        { key: 'openOrders', label: t('smartMoney.addressDetail.openOrders') },
        { key: 'trades', label: t('smartMoney.addressDetail.tradeHistory') },
      ]

  const coins = useMemo(() => {
    if (!('positions' in data)) return []
    const list = (data.positions ?? []).map((p: any) => String(p.symbol ?? '').toUpperCase())
    return Array.from(new Set(list)).filter(Boolean)
  }, [data])

  const assetCtxMap = useHyperliquidActiveAssetCtx({ coins, enabled: coins.length > 0 })

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    const map: Record<TabKey, ColumnDef<any, any>[]> = {
      positions: [
        {
          header: t('walletDetail.holdings.token'),
          accessorKey: 'symbol',
          meta: { sortable: true, align: 'left' },
          cell: ({ row }) => {
            const lev = row.original.leverage

            const sziText = row.original.size
              ? Number(row.original.size) < 0
                ? t('smartMoney.addressDetail.short')
                : t('smartMoney.addressDetail.long')
              : ''
            return (
              <div className="flex items-center gap-2">
                <span className="text-white/90">{row.original.symbol}</span>
                <>
                  <span className="px-2 h-6 rounded-md bg-white/5 text-white/60 text-xs grid place-items-center">
                    {lev ? lev + 'x' : ''}
                  </span>
                  <span style={{ color: Number(row.original.size || 0) < 0 ? '#E64C68' : '#12C48B' }}>{sziText}</span>
                </>
              </div>
            )
          },
        },
        {
          header: t('smartMoney.addressDetail.size'),
          accessorKey: 'size',
          cell: ({ getValue }) => Math.abs(Number(getValue() ?? 0)),
        },
        {
          header: t('smartMoney.addressDetail.positionValue'),
          accessorKey: 'valueUsd',
          cell: ({ getValue }) => formatCurrency(getValue()),
        },
        { header: t('smartMoney.addressDetail.entryPrice'), accessorKey: 'avgPrice' },

        {
          header: t('smartMoney.addressDetail.markPrice'),
          accessorKey: 'markPrice',
          cell: ({ getValue }) => {
            const v = getValue()
            if (!v || v === '-') return '-'
            const n = Number(v)
            if (!Number.isFinite(n)) return '-'
            return n >= 1 ? n.toFixed(2) : n.toFixed(6)
          },
        },

        {
          header: 'PnL',
          accessorKey: 'pnl',
          cell: ({ row }) => {
            const pnl = Number(row.original.pnl ?? 0)
            const pct = Number(row.original.pnlPct ?? 0)
            const color = pnl >= 0 ? '#12C48B' : '#E64C68'
            return (
              <div>
                <span style={{ color }}>{pnl.toFixed(2)}</span>
                <span className="text-xs" style={{ color }}>
                  {' '}
                  ({(pct * 100).toFixed(2)}%)
                </span>
              </div>
            )
          },
        },
        { header: t('position.liquidationPrice'), accessorKey: 'liqPrice' },
        {
          header: t('smartMoney.addressDetail.margin'),
          accessorKey: 'marginUsd',
          cell: ({ row }) =>
            `${formatCurrency(row.original.marginUsd)}（${
              row.original.marginMode === 'cross'
                ? t('smartMoney.addressDetail.cross')
                : t('smartMoney.addressDetail.isolated')
            }）`,
        },
        {
          header: t('smartMoney.addressDetail.fundingFee'),
          accessorKey: 'fundingUsd',
          cell: ({ getValue }) => {
            const color = getValue() >= 0 ? '#12C48B' : '#E64C68'
            return <span style={{ color }}>{formatCurrency(getValue())}</span>
          },
        },
        {
          header: 'TP/SL',
          accessorKey: 'tp',
          meta: { sortable: true, align: 'right' },
          cell: ({ row }) => (
            <div>
              <span className="text-[#12C48B]">{row.original.tp}</span>
              <span className="text-white/40"> / </span>
              <span className="text-[#E64C68]">{row.original.sl}</span>
            </div>
          ),
        },
      ],

      openOrders: [
        {
          header: 'Time',
          accessorKey: 'ts',
          meta: { sortable: true, align: 'left' },
          cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        { header: 'Asset', accessorKey: 'symbol' },
        { header: 'Side', accessorKey: 'side' },
        { header: 'Type', accessorKey: 'type' },
        { header: 'Size', accessorKey: 'size' },
        {
          header: 'Price',
          accessorKey: 'price',
          cell: ({ getValue, row }) => {
            const price = getValue()
            const orderType = row.original.type || ''
            const isLimit = orderType.toLowerCase().includes('limit')

            return isLimit ? '$' + price.toFixed(2) : 'Market'
          },
        },
        { header: 'Trigger Condition', accessorKey: 'triggerCondition' },
        { header: 'Status', accessorKey: 'status' },
        { header: 'Order ID', accessorKey: 'oid', meta: { sortable: false, align: 'right' } },
      ],

      twap: [
        {
          header: 'Time',
          accessorKey: 'time',
          meta: { sortable: true, align: 'left' },
          cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        { header: 'Asset', accessorKey: 'coin' },
        { header: 'Direction', accessorKey: 'dir' },
        { header: 'Size', accessorKey: 'sz' },
        { header: 'Price', accessorKey: 'px' },
        { header: 'Start Position', accessorKey: 'startPosition' },
        { header: 'Fee', accessorKey: 'fee' },
        { header: 'TWAP ID', accessorKey: 'twapId', meta: { sortable: true, align: 'right' } },
      ],

      trades: [
        {
          header: 'Time',
          accessorKey: 'time',
          meta: { sortable: true, align: 'left' },
          cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        { header: 'Asset', accessorKey: 'coin' },
        { header: 'Direction', accessorKey: 'dir' },
        { header: 'Size', accessorKey: 'sz' },
        { header: 'Price', accessorKey: 'px' },
        { header: 'Side', accessorKey: 'side' },
        { header: 'Start Position', accessorKey: 'startPosition' },
        { header: 'Closed PnL', accessorKey: 'closedPnl' },
        { header: 'Fee', accessorKey: 'fee' },
        { header: 'Transaction', accessorKey: 'hash', meta: { sortable: true, align: 'right' } },
      ],

      completedTrades: [
        {
          header: 'Time',
          accessorKey: 'time',
          cell: ({ getValue }) => dayjs(getValue()).format('YYYY-MM-DD HH:mm:ss'),
        },
        { header: 'Asset', accessorKey: 'coin' },
        { header: 'Direction', accessorKey: 'dir' },
        { header: 'Size', accessorKey: 'sz' },
        { header: 'Price', accessorKey: 'px' },
        { header: 'Side', accessorKey: 'side' },
        { header: 'Start Position', accessorKey: 'startPosition' },
        { header: 'Closed PnL', accessorKey: 'closedPnl' },
        { header: 'Fee', accessorKey: 'fee' },
        { header: 'Transaction', accessorKey: 'hash' },
      ],

      funding: [
        {
          header: 'Time',
          accessorKey: 'time',
          meta: {
            sortable: true,
            defaultSort: 'desc',
            sortBy: 'time',
            align: 'left',
            compare: (a, b) => Number(a) - Number(b),
          },
          cell: ({ getValue }) => {
            const v = getValue()
            if (!v || v === '-') return '-'
            return dayjs(Number(v)).format('YYYY-MM-DD HH:mm:ss')
          },
        },
        { header: 'Asset', accessorKey: 'coin' },
        { header: 'Size', accessorKey: 'size', cell: ({ getValue }) => getValue().toFixed(4) },
        { header: 'Type', accessorKey: 'type' },
        { header: 'Funding Rate', accessorKey: 'fundingRate', cell: ({ getValue }) => getValue().toFixed(10) },
        { header: 'Funding USDC', accessorKey: 'fundingUSDC' },
        { header: 'Transaction', accessorKey: 'hash', meta: { sortable: true, align: 'right' } },
      ],

      orderHistory: [
        {
          header: 'Time',
          accessorKey: 'timestamp',
          meta: { sortable: true, align: 'left' },
          cell: ({ getValue }) => dayjs(getValue()).format('YYYY-MM-DD HH:mm:ss'),
        },
        { header: 'Asset', accessorKey: 'coin' },
        { header: 'Side', accessorKey: 'side' },
        { header: 'Limit Px', accessorKey: 'limitPx' },
        { header: 'Size', accessorKey: 'sz' },
        { header: 'Trigger Condition', accessorKey: 'triggerCondition' },
        { header: 'Order Type', accessorKey: 'orderType' },
        { header: 'Status', accessorKey: 'status' },
        { header: 'Is Position Tpsl', accessorKey: 'isPositionTpsl' },
        { header: 'Tif', accessorKey: 'tif' },
        { header: 'Order ID', accessorKey: 'oid', meta: { sortable: true, align: 'right' } },
      ],

      account: [
        {
          header: 'Time',
          accessorKey: 'time',
          meta: {
            sortable: true,
            defaultSort: 'desc',
            sortBy: 'time',
            align: 'left',
            compare: (a, b) => Number(a) - Number(b),
          },
          cell: ({ getValue }) => {
            const v = getValue()
            if (!v || v === '-') return '-'
            return dayjs(Number(v)).format('YYYY-MM-DD HH:mm:ss')
          },
        },
        {
          header: 'Type',
          accessorKey: 'type',
        },
        {
          header: 'Asset',
          accessorKey: 'token',
        },
        {
          header: 'Amount',
          accessorKey: 'usdc',
          cell: ({ getValue }) => formatCurrency(getValue()),
        },
        { header: 'Fee', accessorKey: 'fee' },
        { header: 'Transaction', accessorKey: 'hash', meta: { sortable: true, align: 'right' } },
      ],
    }

    return map[active] ?? []
  }, [active])

  // 当前 Tab 的数据
  const rows = useMemo<any[]>(() => {
    const base = (data[active] as any[]) ?? []
    if (active !== 'positions') return base

    return base.map((r) => {
      const coin = String(r.symbol ?? '').toUpperCase()
      const markPx = assetCtxMap?.[coin]?.markPx
      return {
        ...r,
        markPrice: markPx ?? '-',
      }
    })
  }, [data, active, assetCtxMap])

  return (
    <div className={cn(isDesktop ? 'mt-4' : '', 'rounded-xl bg-[#121319]')}>
      {/* Tabs */}
      <div
        className={cn(
          isDesktop ? '' : 'flex-nowrap overflow-x-auto overflow-y-hidden touch-pan-x',
          'relative px-5 h-12 border-b border-white/10 flex items-end gap-8',
        )}
      >
        {TABS.map((t) => {
          const isActive = active === t.key

          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={clsx(
                'relative pb-3 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-white/50 hover:text-white',
                !isDesktop ? 'whitespace-nowrap' : '',
              )}
            >
              {t.label}

              {/* 底部横线 */}
              {isActive && (
                <span
                  className="
                    absolute left-[20%] right-0 w-[60%] -bottom-[1px]
                    h-[2px] bg-white rounded-full
                  "
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 表格 */}
      <div className="px-5 overflow-x-auto">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center leading-22 text-white/60 text-center">
            <IconEmpty />
            {t('smartMoney.addressDetail.nodata')}
          </div>
        ) : (
          <div className="w-full overflow-auto pt-4">
            {isDesktop ? (
              <DataTable columns={columns} data={rows} rowKey={(_, i) => i} />
            ) : (
              rows.map((item, index) => {
                return (
                  <div className="pb-3">
                    <PositionCard type={active} data={item} />
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
