import { useMemo } from 'react'
import {
  GetFundingFeeComparisonInput,
  GetFundingRateHistoryInput,
  GetListFundingRateInput,
  Query,
} from '@/@generated/gql/graphql-dexHyperTrader'
import { dexHyperTraderClient } from '@/lib/gql/apollo-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { gql } from '@apollo/client'

const GET_FUNDING_RATE_DATA = gql`
  query getListFundingRate($input: GetListFundingRateInput!) {
    getListFundingRate(input: $input) {
      data {
        symbol
        interval
        fundingRate
        interestRate
        fundingTime
        markPrice
        fundingCap
        fundingFloor
      }
      pagination {
        page
        limit
        total
      }
    }
  }
`

export type FundingRateOptions = {
  input?: GetListFundingRateInput | GetFundingRateHistoryInput | GetFundingFeeComparisonInput
  limit?: number
}

export const useRealTimeFundingRateInfiniteData = ({ input, limit = 10 }: FundingRateOptions) => {
  const query = useInfiniteQuery({
    queryKey: ['getListFundingRate', input, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getListFundingRate'>,
        { input: GetListFundingRateInput }
      >({
        query: GET_FUNDING_RATE_DATA,
        variables: {
          input: {
            // pagination: {
            //   page: pageParam,
            //   limit: limit,
            // },
          },
        },
      })
      return res.data.getListFundingRate
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage?.pagination
      if (total && page * limit >= total) return undefined

      if (!lastPage.data || lastPage.data.length < limit) return undefined

      return page + 1
    },
    staleTime: 5 * 60 * 1000,
  })

  const flattenedData = useMemo(() => query.data?.pages.flatMap((page) => page.data) || [], [query.data])

  const getPageData = (pageIndex: number) => {
    return query.data?.pages[pageIndex]?.data || []
  }

  const totalCount = (query.data?.pages[0]?.pagination as any)?.total || 0

  return {
    ...query,
    flattenedData,
    getPageData,
    totalCount,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}

export const useRealTimeFundingRatePaginationData = ({ input }: FundingRateOptions) => {
  return useQuery({
    queryKey: ['getListFundingRatePagination', input],
    queryFn: async () => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getListFundingRate'>,
        { input: GetListFundingRateInput }
      >({
        query: GET_FUNDING_RATE_DATA,
        variables: {
          input: {
            ...input,
          },
        },
      })

      return res.data.getListFundingRate
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}

const GET_HISTORIAL_FUNDING_RATE_DATA = gql`
  query getFundingRateHistory($input: GetFundingRateHistoryInput!) {
    getFundingRateHistory(input: $input) {
      data {
        symbol
        interval
        fundingRate
        interestRate
        fundingTime
        markPrice
        fundingCap
        fundingFloor
      }
      pagination {
        page
        limit
        total
      }
    }
  }
`

export const useHistoricalFundingRatePaginationData = ({ input }: FundingRateOptions) => {
  return useQuery({
    queryKey: ['getFundingRateHistoryPagination', input],
    queryFn: async () => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getFundingRateHistory'>,
        { input: GetFundingRateHistoryInput }
      >({
        query: GET_HISTORIAL_FUNDING_RATE_DATA,
        variables: {
          input: {
            ...input,
          } as GetFundingRateHistoryInput,
        },
      })

      return res.data.getFundingRateHistory
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}


export const useHistoricalFundingRateInfiniteData = ({ input, limit = 10 }: FundingRateOptions) => {
  const query = useInfiniteQuery({
    queryKey: ['getFundingRateHistory', input, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getFundingRateHistory'>,
        { input: GetFundingRateHistoryInput }
      >({
        query: GET_HISTORIAL_FUNDING_RATE_DATA,
        variables: {
          input: {
            ...input,
            pagination: {
              page: pageParam,
              limit: limit,
            },
          } as GetFundingRateHistoryInput,
        },
      })
      return res.data.getFundingRateHistory
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage?.pagination
      if (total && page * limit >= total) return undefined

      if (!lastPage.data || lastPage.data.length < limit) return undefined

      return page + 1
    },
    staleTime: 5 * 60 * 1000,
  })

  const flattenedData = query.data?.pages.flatMap((page) => page.data) || []

  const getPageData = (pageIndex: number) => {
    return query.data?.pages[pageIndex]?.data || []
  }

  const totalCount = (query.data?.pages[0]?.pagination as any)?.total || 0

  return {
    ...query,
    flattenedData,
    getPageData,
    totalCount,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}


const GET_FUNDING_FEE_COMPARISON_DATA = gql`
  query getFundingFeeComparison($input: GetFundingFeeComparisonInput!) {
    getFundingFeeComparison(input: $input) {
      data {
        symbol
        interval
        fundingRate
        interestRate
        fundingTime
        markPrice
        fundingCap
        fundingFloor
        openInterest
        openInterestValue
        fundingRate1h
        fundingRate4h
        fundingRate7d
        fundingRate8h
        fundingRate1d
        fundingRate1m
        fundingRate1y
        binanceFundingRate1h
        binanceFundingRate4h
        binanceFundingRate8h
        binanceFundingRate1d
        binanceFundingRate7d
        binanceFundingRate1m
        binanceFundingRate1y
        bybitFundingRate1h
        bybitFundingRate4h
        bybitFundingRate8h
        bybitFundingRate1d
        bybitFundingRate7d
        bybitFundingRate1m
        bybitFundingRate1y
      }
      pagination {
        page
        limit
        total
      }
    }
  }
`
export const useFundingFeeComparisonPaginationData = ({ input }: FundingRateOptions) => {
  return useQuery({
    queryKey: ['getFundingFeeComparisonPagination', input],
    queryFn: async () => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getFundingFeeComparison'>,
        { input: GetFundingFeeComparisonInput }
      >({
        query: GET_FUNDING_FEE_COMPARISON_DATA,
        variables: {
          input: {
            ...input,
          } as GetFundingFeeComparisonInput,
        },
      })

      return res.data.getFundingFeeComparison
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}

export const useFundingFeeComparisonInfiniteData = ({ input, limit = 10 }: FundingRateOptions) => {
  const query = useInfiniteQuery({
    queryKey: ['getFundingFeeComparison', input, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await dexHyperTraderClient.query<
        Pick<Query, 'getFundingFeeComparison'>,
        { input: GetFundingFeeComparisonInput }
      >({
        query: GET_FUNDING_FEE_COMPARISON_DATA,
        variables: {
          input: {
            // ...input,
            // pagination: {
            //   page: pageParam,
            //   limit: limit,
            // },
          } as GetFundingRateHistoryInput,
        },
      })
      return res.data.getFundingFeeComparison
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage?.pagination
      if (total && page * limit >= total) return undefined

      if (!lastPage.data || lastPage.data.length < limit) return undefined

      return page + 1
    },
    staleTime: 5 * 60 * 1000,
  })

  const flattenedData = query.data?.pages.flatMap((page) => page.data) || []

  const getPageData = (pageIndex: number) => {
    return query.data?.pages[pageIndex]?.data || []
  }

  const totalCount = (query.data?.pages[0]?.pagination as any)?.total || 0

  return {
    ...query,
    flattenedData,
    getPageData,
    totalCount,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
