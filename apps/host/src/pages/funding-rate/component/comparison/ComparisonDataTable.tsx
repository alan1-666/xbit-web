import { useEffect, useMemo, useRef } from 'react'
import { useFundingFeeComparisonInfiniteData } from '../../hook/useFundingRateData'
import { LoadingTable } from '@/components/common/LoadingTable'
import { DataTableInfiniteScroll } from '@/components/ui/XTableInfiniteScroll'
import { Loading } from '@/components/common/Loading'
import { ColumnDef } from '@tanstack/react-table'
import { FundingFeeComparison } from '@/@generated/gql/graphql-dexHyperTrader'

const ComparisonDataTable = ({
  colums,
  searchFilter,
}: {
  colums: ColumnDef<FundingFeeComparison>[]
  searchFilter: string
}) => {
  const { flattenedData, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, fetchStatus } =
    useFundingFeeComparisonInfiniteData({
      input: {},
      limit: 1000,
    })

  const loadMoreRef = useRef(null)

  const filteredData = useMemo(() => {
    if (!searchFilter) return flattenedData

    const lowerSearch = searchFilter.toLowerCase()
    return flattenedData.filter((item) => {
      return item.symbol?.toLowerCase().includes(lowerSearch)
    })
  }, [flattenedData, searchFilter])

  const loadMorePools = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }

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
        threshold: 1.0,
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

  const isNetworkPaused = fetchStatus === 'paused'

  return (
    <div className="relative pl-4 pt-4">
      {
        <>
          <DataTableInfiniteScroll
            columns={colums}
            data={filteredData}
            isLoading={isLoading}
            sortConfig={{ openInterestValue: 'desc' }}
            tableProps={{
              isStickyHeader: true,
              containerClassName: 'border-0 select-none pb-3',
              tableHeaderRowClassName: '!border-0 !bg-[#1f1e26] whitespace-nowrap',
              tableHeadClassName: '!text-[#6C6A74]',
              tableHeaderClassName: 'border-0 text-[#908e98] text-[11px] z-10 leading-3 font-[330]',
              tableBodyRowClassName: 'odd:bg-[#121214] bg-[#1f1e26] border-0 text-[12px] leading-none py-4',
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
              enableSortingRemoval: false,
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

export default ComparisonDataTable
