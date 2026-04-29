import { ColumnDef } from '@tanstack/react-table'
import { useResponsive } from '@/hooks/useResponsive'
import RealtimeDataTablePC from './RealtimeDataTablePC'
import RealtimeDataTable from './RealtimeDataTable'
import { FundingRate } from '@/@generated/gql/graphql-dexHyperTrader'
import { cn } from '@/lib/utils'
import { useFundingCountdown } from '../../hook/useFundingCountdown'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash-es'
import { routerActions } from '@/redux/modules/router.slice'
import { useAppDispatch } from '@/redux/store'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { roundUp } from '@/lib/number'

const formatRoundedValue = (value: number) => {
  const rounded = roundUp(value)
  return rounded === '-0.000' ? '0.000' : rounded
}

export interface FundingRateData {
  time: string
  contract: string
  interval: string
  fundingRate: string
  markPrice: string
}

const CountdownCell = ({
  fundingTime,
  interval,
  onEnd,
}: {
  fundingTime: string
  interval: string
  onEnd: () => void
}) => {
  const timeLeft = useFundingCountdown(fundingTime, interval, onEnd)
  return <span>{timeLeft}</span>
}

const RealTimeFundingRate = ({ refreshTick, onRefetchDone }: { refreshTick: number; onRefetchDone: () => void }) => {
  const { isDesktop } = useResponsive()
  const [refreshSignal, setRefreshSignal] = useState(0)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const MAX_RETRIES = 3

  const COLUMNS: ColumnDef<FundingRate>[] = [
    {
      accessorKey: 'symbol',
      header: () => <div className={cn('ml-2')}>{t('fundingRate.table.contract')}</div>,
      enableSorting: true,
      size: 140,
      cell: ({ row, getValue }) => {
        return (
          <div
            className={cn('text-[#CACACA] cursor-pointer ml-2', !isDesktop && 'min-w-30')}
            onClick={() => handleRowClick(row.original)}
          >
            {/* {String(getValue())} */}
            {String(getValue()) + 'USDC'}
          </div>
        )
      },
    },
    {
      accessorKey: 'interval',
      header: () => <div className={cn('', !isDesktop && 'text-center')}>{t('fundingRate.table.interval')}</div>,
      enableSorting: true,
      size: 140,
      meta: {
        align: !isDesktop ? 'center' : 'left',
      },
      cell: ({ getValue }) => <div className={cn('', !isDesktop && 'text-center')}>{String(getValue())}</div>,
    },
    {
      accessorKey: 'fundingTime',
      header: () => <div>{t('fundingRate.table.nextTime')}</div>,
      enableSorting: false,
      size: 140,
      cell: ({ row }) => {
        return (
          <CountdownCell
            fundingTime={row.original.fundingTime}
            interval={row.original.interval}
            onEnd={debouncedTrigger}
          />
        )
      },
    },
    {
      accessorKey: 'fundingRate',
      header: () => <div>{t('fundingRate.table.interestRate')}</div>,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 140,
      cell: ({ row, getValue }) => {
        const rate = Number(getValue()) * 100
        return <div className={cn('', !isDesktop && 'min-w-22')}>{formatRoundedValue(rate)}%</div>
      },
    },
  ]
  const debouncedTrigger = useMemo(
    () =>
      debounce(() => {
        setRefreshSignal((prev) => {
          if (prev >= MAX_RETRIES) {
            return prev
          }
          setRefreshSignal((s) => s + 1)
          return prev + 1
        })
      }, 1000),
    [],
  )

  useEffect(() => {
    if (refreshTick > 0) {
      setRefreshSignal((prev) => {
        return prev + 1
      })
    }
  }, [refreshTick])

  const handleRowClick = (row: FundingRate) => {
    // console.log('[v0] Row clicked:', row)
    dispatch(routerActions.setHeaderTab('crypto'))
    navigate(`/futures/${row.symbol}`)
  }

  return (
    <>
      {isDesktop ? (
        <RealtimeDataTablePC
          colums={COLUMNS}
          refreshSignal={refreshSignal}
          setRefreshSignal={setRefreshSignal}
          onRefetchDone={onRefetchDone}
        />
      ) : (
        <RealtimeDataTable colums={COLUMNS} refreshSignal={refreshSignal} />
      )}
    </>
  )
}
export default RealTimeFundingRate
