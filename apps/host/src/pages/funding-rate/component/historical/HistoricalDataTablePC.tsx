import { useEffect, useState } from 'react'
import { useHistoricalFundingRatePaginationData } from '../../hook/useFundingRateData'
import { DataTableWithPagination, SortOrder } from '@/components/common/table/DataTableWithPagination'
import { ColumnDef } from '@tanstack/react-table'
import { FundingRate } from '@/@generated/gql/graphql-dexHyperTrader'
import ls from '@/lib/local-storage'

const FUNDING_RATE_TABLE_SETTINGS_KEY = 'fundingRateTableSettings'
const TABLE_KEY = 'historical'

const HistoricalDataTablePC = ({
  colums,
  symbol,
  refreshTick,
  onRefetchDone,
}: {
  colums: ColumnDef<FundingRate>[]
  symbol: string
  refreshTick: number
  onRefetchDone: () => void
}) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    const settings = ls.get(FUNDING_RATE_TABLE_SETTINGS_KEY)
    return settings?.[TABLE_KEY] || 20
  })
  const { data, isLoading, refetch, error, fetchStatus, status } = useHistoricalFundingRatePaginationData({
    input: {
      pagination: {
        page: page,
        limit: pageSize,
      },
      symbol: symbol,
    },
  })
  const dataList = data?.data || []
  const totalCount = data?.pagination.total || 0

  useEffect(() => {
    if (refreshTick > 0) {
      refetch().finally(() => onRefetchDone())
    }
  }, [refreshTick])

  useEffect(() => {
    if (symbol) {
      setPage(1)
    }
  }, [symbol])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      if (minutes === 0) {
        if ([1, 21, 41].includes(seconds)) {
          refetch()
        }
      } else if (minutes === 1) {
        if (seconds === 1) {
          refetch()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [refetch])

  const handleRowClick = (row: FundingRate) => {
    // console.log('[v0] Row clicked:', row)
  }

  const handlePageChange = (page: number) => {
    // console.log('[v0] Page changed to:', page)
    setPage(page)
  }

  const handlePerPageChange = (newPageSize: number) => {
    // console.log('[v0] Per Page changed to:', newPageSize)
    setPageSize(newPageSize)
    setPage(1)
    // Persist to localStorage
    const settings = ls.get(FUNDING_RATE_TABLE_SETTINGS_KEY) || {}
    ls.set(FUNDING_RATE_TABLE_SETTINGS_KEY, { ...settings, [TABLE_KEY]: newPageSize })
  }

  const handleSortChange = (sortKey: string | null, sortOrder: SortOrder) => {
    // console.log('[v0] Sort changed:', { sortKey, sortOrder })
  }
  const isNetworkPaused = fetchStatus === 'paused'
  return (
    <div className="w-full mt-8">
      <DataTableWithPagination<FundingRate>
        data={dataList}
        columns={colums}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onItemsPerPageChange={handlePerPageChange}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pageSize={pageSize}
        currentPage={page}
        isLostNetwork={isNetworkPaused}
      />
    </div>
  )
}

export default HistoricalDataTablePC
