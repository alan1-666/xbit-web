import { useMemo } from "react";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { TransactionClassification } from "@/@generated/gql/graphql-meme2";
import { GetPoolTransactionsResponse } from "@/types/responses";
import { futureClient } from "@/lib/gql/apollo-client";
import { getPoolTransactions } from "@services/tokens.service";
import { TransactionDto } from "@/@generated/gql/graphql-meme2.ts";
import { FilterState } from "@components/detailPoolTab";

const PAGE_SIZE = 20;

export function usePoolTransactions(params: {
  token?: string | null;
  chainId?: number | null;
  filters?: FilterState;
  refetchMs?: number;
  customKey?: string;
}) {
  const { token, chainId, filters, refetchMs = 5000, customKey = '' } = params;
  const enabled = !!token;

  // Build a stable, complete key over all filter fields that affect results.
  const queryKey = useMemo(
    () => [
      "poolTransactions",
      token ?? "",
      chainId ?? 0,
      filters?.transactionType ?? undefined,
      filters?.classification ?? undefined,
      filters?.timestampFrom ?? undefined,
      filters?.timestampTo ?? undefined,
      filters?.sortBy ?? undefined,
      (filters?.holder ?? "") || undefined,
      filters?.minQuantity ?? undefined,
      filters?.maxQuantity ?? undefined,
      filters?.minTotalValue ?? undefined,
      filters?.maxTotalValue ?? undefined,
      filters?.dex ?? undefined,
      customKey
    ],
    [token, chainId, filters]
  );

  const query = useInfiniteQuery<
    GetPoolTransactionsResponse,
    Error,
    InfiniteData<GetPoolTransactionsResponse, string>,
    typeof queryKey,
    string | undefined
  >({
    enabled,
    queryKey,
    initialPageParam: undefined,
    // Tie interval to 'enabled' to ensure old observers don't keep polling.
    refetchInterval: () => (enabled ? refetchMs : false),
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 1,
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getPoolTransactions,
        variables: {
          input: {
            token: token ?? "",
            chainId: chainId ?? 0,
            type: filters?.transactionType ?? undefined,
            classification: filters?.classification ?? TransactionClassification.All,
            lastTimestamp: pageParam ?? undefined,
            timestampFrom: filters?.timestampFrom ?? undefined,
            timestampTo: filters?.timestampTo ?? undefined,
            sortBy: filters?.sortBy ?? undefined,
            address: filters?.holder || undefined,
            transactionVolumeFrom: filters?.minQuantity ?? undefined,
            transactionVolumeTo: filters?.maxQuantity ?? undefined,
            transactionUsdAmountFrom: filters?.minTotalValue ?? undefined,
            transactionUsdAmountTo: filters?.maxTotalValue ?? undefined,
            dex: filters?.dex ?? undefined,
          },
        },
        fetchPolicy: "no-cache",
      });

      return (res?.data ?? {data: []}) as unknown as GetPoolTransactionsResponse;
    },
    getNextPageParam: (lastPage) => {
      const list = lastPage?.getPoolTransactions?.data;
      const len = list?.length ?? 0;
      if (!len || len < PAGE_SIZE || !list) return undefined;
      return (list?.[len - 1]?.timestamp as string | undefined) ?? undefined;
    },
  });

  const items: TransactionDto[] =
    (query.data?.pages ?? []).flatMap(
      (p) => p?.getPoolTransactions?.data ?? []
    );

  const total: number | undefined = query.data?.pages?.[0]?.getPoolTransactions?.data?.length;
  const liquidity: number | undefined = query.data?.pages?.[0]?.getPoolTransactions?.liquidity;
  const numberOfPools = query.data?.pages?.[0]?.getPoolTransactions?.numberOfPools;

  return {
    items,
    total,
    liquidity,
    numberOfPools,
    pages: query.data?.pages ?? [],
    pageParams: query.data?.pageParams ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isPending || query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    enabled,
  };
}
