import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMetrics30d, fetchSmartMoneyLatest, fetchTopTrader, GetRecentActiveSmartMoney, getTopTraderResp, Metrics30d, TopTrader } from './Api/api';
import { mockFetchSmartMoney } from './mock';
import type {
  UseInfiniteQueryResult,
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import type { SmartMoneyResponse, Trader } from './types';

type MockResult = Pick<
  UseInfiniteQueryResult<SmartMoneyResponse, Error>,
  'data' | 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage' | 'status'
>;

export const useSmartMoneyInfinite = (opts: {
  address?: string;
  periodDays?: number;
  pageSize?: number | undefined;
}) => {
  const { address, periodDays, pageSize = 50 } = opts;

  const query = useInfiniteQuery({
    queryKey: ['smart-money-latest', periodDays ?? null, pageSize],
    queryFn: ({ pageParam }) =>
      fetchSmartMoneyLatest({
        period_days: periodDays,
        limit: pageSize,
        page: pageParam ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, total_pages } = last.pagination ?? { page: 1, total_pages: 1 };
      return page < total_pages ? page + 1 : undefined;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const flat = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.data),
    [query.data?.pages]
  );

  const filtered = useMemo(() => {
    if (!address) return flat;
    const key = address.toLowerCase();
    return flat.filter((t) => t.user_address.toLowerCase().includes(key));
  }, [flat, address]);

  return { ...query, list: filtered };
}

// Mock数据：返回与 react-query 无限加载相似的接口
export const useSmartMoneyMock = (address: string, pageSize = 50): MockResult => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState([{ ...mockFetchSmartMoney(1, pageSize, address) }]);
  const last = pages[pages.length - 1];

  useEffect(() => {
    setPage(1);
    setPages([{ ...mockFetchSmartMoney(1, pageSize, address) }]);
  }, [address, pageSize]);

  const hasNextPage = last.pagination.page < last.pagination.total_pages;

  const fetchNextPage = async (
    _opts?: FetchNextPageOptions
  ): Promise<InfiniteQueryObserverResult<SmartMoneyResponse, Error>> => {
    if (!hasNextPage) {
      // 返回一个最小可用的对象
      return {} as any;
    }
    const next = page + 1;
    const res = mockFetchSmartMoney(next, pageSize, address);
    setPages((p) => [...p, res]);
    setPage(next);
    return { data: res } as any;
  };

  const data = useMemo(() => ({ pages } as any), [pages]);

  return {
    data,
    hasNextPage,
    isFetchingNextPage: false,
    fetchNextPage,
    status: 'success' as MockResult['status'],
  };
}

export function flattenPages<T extends { data: Trader[] }>(pages?: T[]) {
  return pages?.flatMap((p) => p.data) ?? [];
}

export const useFetchTopTraders = () => {
  
  const [data, setData] = useState<TopTrader[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetchTopTrader()
        setData(res? res.data : null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export const useFetchMetrics30d = (address?: string) => {
  
  const [data, setData] = useState<Metrics30d | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return
      try {
        setLoading(true)
        const res = await fetchMetrics30d(address)
        console.log("fetchMetrics30d res: ", res)
        setData(res ? res.getSmartMoneyMetrics30d.data : null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [address])

  return { data, loading, error }
}