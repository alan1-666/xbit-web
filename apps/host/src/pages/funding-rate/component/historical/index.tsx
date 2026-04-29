import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { SearchSelect, SelectOption } from '../../../../components/common/select/SearchSelect'
import FundingRateChart from './HistoricalChart'
import { useResponsive } from '@/hooks/useResponsive'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import { ISymbolList, setData, SymbolListState } from '@/redux/modules/symbolList.slide'
import { useTranslation } from 'react-i18next'
import HistoricalDataTable from './HistoricalDataTable'
import { cn } from '@/lib/utils'
import { FundingRate } from '@/@generated/gql/graphql-dexHyperTrader'
import HistoricalDataTablePC from './HistoricalDataTablePC'
import { format, parseISO } from 'date-fns'
import { formatBalance } from '@/lib/format'
import { routerActions } from '@/redux/modules/router.slice'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { roundUp } from '@/lib/number'

const formatRoundedValue = (value: number) => {
  const rounded = roundUp(value)
  return rounded === '-0.000' ? '0.000' : rounded
}

export function HistoricalFundingRate({
  refreshTick,
  onRefetchDone,
}: {
  refreshTick: number
  onRefetchDone: () => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPair, setSelectedPair] = useState<string>(() => {
    return searchParams.get('symbol') || 'BTC'
  })
  const { isDesktop } = useResponsive()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    lists: { openInterest },
  } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)
  const { setIsLoadingSymbol, loadSymbolListFromCache, handleGetSymbolList } = useHandleGetData({
    condition: 'openInterest',
    skip: openInterest?.length !== 0,
  })

  useEffect(() => {
    const initializeSymbolList = async () => {
      if (openInterest.length !== 0) {
        setIsLoadingSymbol(false)
        return
      }
      const cacheLoaded = await loadSymbolListFromCache('openInterest')

      if (!cacheLoaded?.length) {
        await handleGetSymbolList()
      } else {
        dispatch(setData({ condition: 'openInterest', data: cacheLoaded as ISymbolList[] }))
        setIsLoadingSymbol(false)
      }
    }

    initializeSymbolList()
  }, [])

  const listPairs: SelectOption[] = openInterest?.map((item: ISymbolList) => {
    return { value: item.symbol, label: item.symbol + 'USDC' }
  })

  const COLUMNS: ColumnDef<FundingRate>[] = [
    {
      accessorKey: 'fundingTime',
      header: () => <div className="ml-2">{t('fundingRate.table.time')}</div>,
      enableSorting: false,
      size: 140,
      cell: ({ row, getValue }) => {
        return (
          <div className={cn('ml-2', !isDesktop && 'min-w-35')}>
            {format(parseISO(String(getValue())), 'yyyy-MM-dd HH:mm:ss')}
          </div>
        )
      },
    },
    {
      accessorKey: 'symbol',
      header: () => <div className={cn('', !isDesktop && 'ml-4')}>{t('fundingRate.table.contract')}</div>,
      enableSorting: false,
      size: 140,
      cell: ({ row, getValue }) => {
        return (
          <div
            className={cn('cursor-pointer', !isDesktop && 'min-w-26 ml-4')}
            onClick={() => handleRowClick(row.original)}
          >
            {String(getValue()) + 'USDC'}
          </div>
        )
      },
    },
    {
      accessorKey: 'interval',
      header: () => <div>{t('fundingRate.table.interval')}</div>,
      enableSorting: false,
      size: 120,
      meta: {
        align: 'left',
      },
      cell: ({ getValue }) => <div className={cn('', !isDesktop && 'min-w-20')}>{String(getValue())}</div>,
    },
    {
      accessorKey: 'fundingRate',
      header: () => <span>{t('fundingRate.table.interestRate')}</span>,
      enableSorting: false,
      size: 120,
      cell: ({ row, getValue }) => {
        const rate = Number(getValue()) * 100
        return <div className={cn('', !isDesktop && 'min-w-22')}>{formatRoundedValue(rate)}%</div>
      },
    },
    {
      accessorKey: 'markPrice',
      header: () => <span>{t('fundingRate.table.markPrice')}</span>,
      enableSorting: false,
      size: 120,
      cell: ({ row, getValue }) => {
        const markPrice = Number(getValue())
        return (
          <div className={cn('', !isDesktop && 'min-w-22')}>
            {formatBalance(markPrice, {
              roundMode: 'floor',
            })}
          </div>
        )
      },
    },
  ]

  const handleRowClick = (row: FundingRate) => {
    dispatch(routerActions.setHeaderTab('crypto'))
    navigate(`/futures/${row.symbol}`)
  }

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('symbol', pair)
    setSearchParams(newParams, { replace: true })
  }

  return (
    <div className="w-full">
      <SearchSelect
        options={listPairs}
        selectedValue={selectedPair}
        onValueChange={handlePairChange}
        containerClassName={`max-w-[180px] mt-8 mb-4 ${!isDesktop ? 'ml-4 mt-4' : ''}`}
        placeholder="Select a pair"
        searchPlaceholder={t('search.search')}
      />
      <FundingRateChart symbol={selectedPair} refreshTick={refreshTick} onRefetchDone={onRefetchDone} />
      {isDesktop ? (
        <HistoricalDataTablePC
          colums={COLUMNS}
          symbol={selectedPair}
          refreshTick={refreshTick}
          onRefetchDone={onRefetchDone}
        />
      ) : (
        <HistoricalDataTable colums={COLUMNS} symbol={selectedPair} />
      )}
    </div>
  )
}
