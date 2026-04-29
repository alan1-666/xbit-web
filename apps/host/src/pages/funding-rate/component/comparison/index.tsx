import { ColumnDef } from '@tanstack/react-table'
import { useResponsive } from '@/hooks/useResponsive'
import ComparisonDataTablePC from './ComparisonDataTablePC'
import { useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ComparisonTooltip from './ComparisonTooltip'
import { FundingFeeComparison } from '@/@generated/gql/graphql-dexHyperTrader'
import { useTranslation } from 'react-i18next'
import ComparisonDataTable from './ComparisonDataTable'
import { formatAmount } from '@/lib/format'
import { routerActions } from '@/redux/modules/router.slice'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/store'
import { roundUp } from '@/lib/number'

const ComparisonFundingRate = ({ refreshTick, onRefetchDone }: { refreshTick: number; onRefetchDone: () => void }) => {
  const { isDesktop } = useResponsive()
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('1h')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const getColor = (value: number) => {
    if (value < 0) return '#EA3B4F'
    if (value >= 0 && value <= 0.01) return '#9AA3A4'
    if (value > 0.01) return '#00CE89'
    return '#9AA3A4'
  }

  const formatRoundedValue = (value: number) => {
    const rounded = roundUp(value)
    return rounded === '-0.000' ? '0.000' : rounded
  }

  useDebounce(
    () => {
      setDebouncedSearch(search)
    },
    500,
    [search],
  )

  const TIME_OPTIONS = [
    { label: ((lang === 'zh' || lang === 'hk') ? '每' : '1') + t('const.time.hourShort'), value: '1h' },
    { label: '4' + t('const.time.hourShort'), value: '4h' },
    { label: '8' + t('const.time.hourShort'), value: '8h' },
    { label: '1' + t('const.time.dayShort'), value: '1d' },
    { label: '1' + t('const.time.weekShort'), value: '7d' },
    { label: '1' + t('const.time.monthsShort'), value: '1m' },
    { label: '1' + t('const.time.yearsShort'), value: '1y' },
  ]

  const COLUMNS: ColumnDef<FundingFeeComparison>[] = useMemo(() => [
    {
      accessorKey: 'symbol',
      header: () => <div className="ml-2">{t('xstocks.columns.token')}</div>,
      enableSorting: true,
      size: 120,
      cell: ({ row, getValue }) => {
        return (
          <div
            className={cn('ml-2 cursor-pointer font-medium', !isDesktop && '!min-w-15')}
            onClick={() => handleRowClick(row.original)}
          >
            {String(getValue())}
          </div>
        )
      },
    },
    {
      accessorKey: 'openInterestValue',
      id: 'openInterestValue',
      header: () => <div className={cn('font-medium', !isDesktop && 'ml-7')}>{t('fundingRate.table.contractOpenInterest')}</div>,
      enableSorting: true,
      size: 150,
      meta: {
        // align: !isDesktop ? 'center' : 'left',
      },
      cell: ({ getValue }) => {
        const openInterestValue = String(getValue())
        return (
          <div className={cn('', !isDesktop && 'ml-7 min-w-18')}>
            ${formatAmount(openInterestValue, {
              roundMode: 'round',
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'fundingRate' + selectedTime,
      header: () => <div className="text-center">KairoX</div>,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 150,
      meta: {
        // align: 'center',
      },
      cell: ({ getValue }) => {
        const fundingRate = Number(getValue()) * 100
        return <div style={{ color: getColor(+roundUp(fundingRate)) }} className={cn('', !isDesktop && 'min-w-17')}>{formatRoundedValue(fundingRate)}%</div>
      },
    },
    {
      accessorKey: 'binanceFundingRate' + selectedTime,
      header: () => <div className="text-center">Binance</div>,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 150,
      meta: {
        // align: 'center',
      },
      cell: ({ getValue }) => {
        const binanceFundingRate = Number(getValue()) * 100
        return <div style={{ color: getColor(+roundUp(binanceFundingRate)) }} className={cn('', !isDesktop && 'min-w-17')}>{formatRoundedValue(binanceFundingRate)}%</div>
      },
    },
    {
      id: 'binanceXbitFundingRate' + selectedTime,
      header: () => <div className="text-center">Binance-KairoX</div>,
      enableSorting: true,
      sortDescFirst: false,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 150,
      meta: {
        // align: 'center',
      },
      accessorFn: (row) => {
        const binanceKey = `binanceFundingRate${selectedTime}` as keyof FundingFeeComparison
        const xbitKey = `fundingRate${selectedTime}` as keyof FundingFeeComparison

        const binanceVal = parseFloat(row[binanceKey]) || 0
        const xbitVal = parseFloat(row[xbitKey]) || 0

        return +binanceVal - +xbitVal
      },
      cell: ({ getValue }) => {
        const value = Number(getValue()) * 100
        return <div style={{ color: getColor(+roundUp(value)) }} className={cn('', !isDesktop && 'min-w-17')}>{formatRoundedValue(Math.abs(value))}%</div>
      },
    },
    {
      accessorKey: 'bybitFundingRate' + selectedTime,
      header: () => <div>Bybit</div>,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 150,
      meta: {
        // align: 'center',
      },
      cell: ({ getValue }) => {
        const bybitFundingRate = Number(getValue()) * 100
        return <div style={{ color: getColor(+roundUp(bybitFundingRate)) }} className={cn('', !isDesktop && 'min-w-17')}>{formatRoundedValue(bybitFundingRate)}%</div>
      },
    },
    {
      id: 'bybitXbitFundingRate' + selectedTime,
      header: () => <div className="text-center">Bybit-KairoX</div>,
      enableSorting: true,
      sortDescFirst: false,
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) || '0')
        const b = parseFloat(rowB.getValue(columnId) || '0')
        return a - b
      },
      size: 150,
      meta: {
        // align: 'center',
      },
      accessorFn: (row) => {
        // console.log("selectedTime", selectedTime)
        const bybitKey = `bybitFundingRate${selectedTime}` as keyof FundingFeeComparison
        const xbitKey = `fundingRate${selectedTime}` as keyof FundingFeeComparison

        const bybitVal = parseFloat(row[bybitKey]) || 0
        const xbitVal = parseFloat(row[xbitKey]) || 0

        return +bybitVal - +xbitVal
      },
      cell: ({ getValue }) => {
        const value = Number(getValue()) * 100
        return <div style={{ color: getColor(+roundUp(value)) }} className={cn('', !isDesktop && 'min-w-17')}>{formatRoundedValue(Math.abs(value))}%</div>
      },
    },
  ], [selectedTime, isDesktop, t])

  const handleRowClick = (row: FundingFeeComparison) => {
    dispatch(routerActions.setHeaderTab('crypto'))
    navigate(`/futures/${row.symbol}`)
  }

  return (
    <div>
      <div className={cn('gap-4', isDesktop ? 'mt-8 flex items-center' : 'flex flex-col px-4 mt-4')}>
        <div className={cn('relative group', isDesktop ? 'w-64' : 'w-full')}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500 transition-colors" />
          </div>
          <input
            type="text"
            className={cn(
              'w-full bg-[#1F1E25] rounded-md py-2 pr-3 pl-9 text-sm text-gray-200',
              'placeholder:text-[#6C6A74] outline-none transition-all',
              'hover:border-zinc-600',
            )}
            placeholder={t('fundingRate.search.placehoder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={cn('flex items-center gap-4 w-full', !isDesktop && 'justify-between')}>
          <Select value={selectedTime} onValueChange={setSelectedTime} onOpenChange={setIsOpen}>
            <SelectTrigger
              aria-expanded={isOpen}
              className={cn('bg-[#1F1E25] text-[#908E98] outline-none capitalize w-28')}
            >
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>

            <SelectContent className="bg-[#1F1E25] border-zinc-700 text-[#908E98]">
              {TIME_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-purple-600 focus:text-white cursor-pointer capitalize"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className={cn(isDesktop && 'ml-auto')}>
            <ComparisonTooltip />
          </div>
        </div>
      </div>
      {isDesktop ? (
        <ComparisonDataTablePC
          searchFilter={debouncedSearch}
          colums={COLUMNS}
          refreshTick={refreshTick}
          onRefetchDone={onRefetchDone}
        />
      ) : (
        <ComparisonDataTable colums={COLUMNS} searchFilter={debouncedSearch} />
      )}
    </div>
  )
}
export default ComparisonFundingRate
