import { useEffect, useMemo, useState } from 'react'
import { useRealTimeFundingRatePaginationData } from '../../hook/useFundingRateData'
import { DataTableWithPagination, SortOrder } from '@/components/common/table/DataTableWithPagination'
import { ColumnDef } from '@tanstack/react-table'
import { FundingRate } from '@/@generated/gql/graphql-dexHyperTrader'
import { useSubscriptionDex } from '@/lib/mqtt-dex'
import ls from '@/lib/local-storage'

const FUNDING_RATE_TABLE_SETTINGS_KEY = 'fundingRateTableSettings'
const TABLE_KEY = 'realtime'

const RealtimeDataTablePC = ({
  colums,
  refreshSignal,
  setRefreshSignal,
  onRefetchDone,
}: {
  colums: ColumnDef<FundingRate>[]
  refreshSignal: number
  setRefreshSignal: React.Dispatch<React.SetStateAction<number>>
  onRefetchDone: () => void
}) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    const settings = ls.get(FUNDING_RATE_TABLE_SETTINGS_KEY)
    return settings?.[TABLE_KEY] || 20
  })
  const { data, isLoading, refetch, error, fetchStatus } = useRealTimeFundingRatePaginationData({
    input: {
      // pagination: {
      //   page: page,
      //   limit: pageSize,
      // },
    },
  })

  const { message } = useSubscriptionDex('public/dex/funding_rate')

  /* ------------------- Handle Realtime Data ------------------- */
  const [displayData, setDisplayData] = useState<FundingRate[]>([])

  useEffect(() => {
    if (data?.data) {
      setDisplayData(data.data)
    }
  }, [data])

  useEffect(() => {
    if (!message) return
    try {
      const messageMqtt = message?.message
      const mqttData = JSON.parse(messageMqtt?.toString() || '')

      if (mqttData && mqttData.c) {
        // mqttData format: { c: "SYMBOL", fr: "rate", mp: "price", t: timestamp }
        setDisplayData((prev) => {
          const index = prev.findIndex((item) => item.symbol === mqttData.c)
          if (index === -1) return prev

          const newData = [...prev]
          newData[index] = {
            ...newData[index],
            fundingRate: mqttData.fr,
            markPrice: mqttData.mp,
            // fundingTime: mqttData.t,
          }
          return newData
        })
      }
    } catch (error) {
      console.error('Error parsing messageFundingHistoriesUpdated:', error)
    } 
  }, [message])

  useEffect(() => {
    if (refreshSignal > 0) {
      refetch().finally(() => {
        onRefetchDone()
      })
    }
  }, [refreshSignal, refetch])

  useEffect(() => {
    setRefreshSignal(0)
  }, [page, pageSize])
  const totalCount = data?.pagination.total || 0

  const handleRowClick = (row: FundingRate) => { }

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
        data={displayData}
        columns={colums}
        totalCount={totalCount}
        isManualPagination={false}
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

export default RealtimeDataTablePC
