import { TokenTradeHistoryInput, TradeHistoryFilterInput, TradeHistoryResponse } from '@/types/tokenDetail.ts'
import { useQuery } from '@apollo/client'
import { getTradeHistory } from '@services/tokens.service.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { ChainType } from '@/@generated/gql/graphql-core.ts'

type getTradeHistoryOptions = {
  tokenAddress: string
  chain: ChainType
  limit?: number
  page?: number
  skipCondition?: boolean
  filter?: TradeHistoryFilterInput
}

export const LIMIT_GET_TRADE_HISTORY = 20
export const DEFAULT_PAGE = 1

export const useGetTradeHistory = ({
  skipCondition = false,
  limit = LIMIT_GET_TRADE_HISTORY,
  page = DEFAULT_PAGE,
  tokenAddress,
  chain,
  filter
}: getTradeHistoryOptions) => {
  const { data, loading, error } = useQuery<TradeHistoryResponse, {input: TokenTradeHistoryInput}>(getTradeHistory, {
    client: gqlClient,
    skip: skipCondition,
    variables: {
      input: {
        limit,
        page,
        tokenAddress,
        chain,
        filter
      }
    }
  })

  return { data: data?.getTradeHistory, loading, error }
}