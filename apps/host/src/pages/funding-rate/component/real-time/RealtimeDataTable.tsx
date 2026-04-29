import { useEffect, useRef, useState } from 'react'
import { useRealTimeFundingRateInfiniteData } from '../../hook/useFundingRateData'
import { LoadingTable } from '@/components/common/LoadingTable'
import { DataTableInfiniteScroll } from '@/components/ui/XTableInfiniteScroll'
import { ColumnDef } from '@tanstack/react-table'
import { FundingRate } from '@/@generated/gql/graphql-dexHyperTrader'
import { useSubscriptionDex } from '@/lib/mqtt-dex'

const RealtimeDataTable = ({ colums, refreshSignal }: { colums: ColumnDef<FundingRate>[]; refreshSignal: number }) => {
  const { flattenedData, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, refetch, error, fetchStatus } =
    useRealTimeFundingRateInfiniteData({
      input: {},
      limit: 1000,
    })

  const loadMoreRef = useRef(null)

  const loadMorePools = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

  const { message } = useSubscriptionDex('public/dex/funding_rate')

  /* ------------------- Handle Realtime Data ------------------- */
  const [displayData, setDisplayData] = useState<FundingRate[]>([])

  useEffect(() => {
    if (flattenedData) {
      setDisplayData(flattenedData)
    }
  }, [flattenedData])

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
  /* ------------------------------------------------------------- */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePools()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [loadMoreRef.current])

  useEffect(() => {
    if (refreshSignal > 0 && !isLoading && !isFetchingNextPage) {
      refetch()
    }
  }, [refreshSignal])

  const isNetworkPaused = fetchStatus === 'paused'

  return (
    <div className="relative pl-4 pt-5">
      {
        <>
          <DataTableInfiniteScroll
            columns={colums}
            data={displayData}
            isLoading={isLoading}
            tableProps={{
              isStickyHeader: true,
              containerClassName: 'border-0 select-none pb-3',
              tableHeadClassName: '!text-[#6C6A74]',
              tableHeaderRowClassName: '!border-0 !bg-[#1f1e26] whitespace-nowrap',
              tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
              tableBodyRowClassName: 'odd:bg-[#121214] bg-[#1f1e26] border-0 text-[12px] leading-none',
              tableCellClassName: 'group-hover:!bg-[#27272a] cursor-pointer py-4 text-[#CACACA]',
              shadowFirstColumn:
                'after:content-[""] after:absolute after:top-0 after:right-[-60px] after:bottom-0 after:w-[60px] after:pointer-events-none after:bg-[linear-gradient(270deg,rgba(18,18,20,0)_0%,#121214_100%)]',
              noDataText: 'nodata',
              onRowClick: (data) => { },
              skeletonComponent: (
                <div className="h-[calc(100vh-300px)] flex items-center justify-center">
                  <LoadingTable />
                </div>
              ),
              isStickyFirstColumn: true,
              isSortFE: true,
              loadMoreRef: loadMoreRef,
              isShowLoadMore: hasNextPage && !isFetchingNextPage,
              isLostNetwork: isNetworkPaused
            }}
          />
          <div ref={loadMoreRef} className="h-px" />
          {/* {isFetchingNextPage && (
            <div className="flex items-center justify-center h-10">
              <Loading />
            </div>
          )} */}
        </>
      }
    </div>
  )
}

export default RealtimeDataTable
