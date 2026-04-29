import { useEffect, useMemo, useState } from 'react'
import { useFundingFeeComparisonPaginationData } from '../../hook/useFundingRateData'
import { DataTableWithPagination, SortOrder } from '@/components/common/table/DataTableWithPagination'
import { ColumnDef } from '@tanstack/react-table'
import { FundingFeeComparison } from '@/@generated/gql/graphql-dexHyperTrader'
import ls from '@/lib/local-storage'

const FUNDING_RATE_TABLE_SETTINGS_KEY = 'fundingRateTableSettings'
const TABLE_KEY = 'comparison'

const ComparisonDataTablePC = ({
  colums,
  searchFilter,
  refreshTick,
  onRefetchDone,
}: {
  colums: ColumnDef<FundingFeeComparison>[]
  searchFilter: string
  refreshTick: number
  onRefetchDone: () => void
}) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    const settings = ls.get(FUNDING_RATE_TABLE_SETTINGS_KEY)
    return settings?.[TABLE_KEY] || 20
  })
  const { data, isLoading, refetch, fetchStatus } = useFundingFeeComparisonPaginationData({
    input: {},
  })

  const dataList = data?.data || []
  const totalCount = data?.pagination.total || 0

  useEffect(() => {
    if (refreshTick > 0) {
      refetch().finally(() => {
        onRefetchDone()
      })
    }
  }, [refreshTick])

  const filteredData = useMemo(() => {
    if (!searchFilter) return dataList

    const lowerSearch = searchFilter.toLowerCase()
    setPage(1)
    return dataList.filter((item) => {
      return item.symbol?.toLowerCase().includes(lowerSearch)
    })
  }, [dataList, searchFilter])

  const handleRowClick = (row: FundingFeeComparison) => {
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
      <DataTableWithPagination<FundingFeeComparison>
        data={filteredData}
        columns={colums}
        isManualPagination={false}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onItemsPerPageChange={handlePerPageChange}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pageSize={pageSize}
        currentPage={page}
        isLostNetwork={isNetworkPaused}
        defaultSorting={[{ id: 'openInterestValue', desc: true }]}
        enableSortingRemoval={false}
      />
    </div>
  )
}

export default ComparisonDataTablePC
