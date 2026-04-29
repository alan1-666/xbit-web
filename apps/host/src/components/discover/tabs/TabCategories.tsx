import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { getCategories } from '@services/tokens.service.ts'
import { useMemo, useRef } from 'react'
import CategoryCard from '@components/listCoin/card/CategoryCard.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver.ts'

export const TabCategories = () => {
  const selectedChain = useActiveChain()
  const chainId = selectedChain === TYPE_CHAIN.SOLANA ? 501424 : 1
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['getCategories', chainId],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await futureClient.query({
        query: getCategories,
        variables: {
          input: {
            chainId,
            page: pageParam,
            limit: 20,
          },
        },
      })
      return res.data.getAllCategories.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length + 1
    },
    select: (data) => data.pages.flat(),
  })

  const categories = useMemo(() => {
    return data ?? []
  }, [data])

  useIntersectionObserver({
    ref: loadMoreRef,
    threshold: 0.1,
    rootMargin: '0px',
    callback: () => {
      if (!isLoading && !isFetchingNextPage && hasNextPage) {
        fetchNextPage().then()
      }
    },
  })

  if (isLoading)
    return (
      <div className="p-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton className="w-full h-[74px] mb-2" key={index} />
        ))}
      </div>
    )

  if (!categories || categories.length === 0) return <EmptyList />

  return (
    <div className="px-2.5 pt-3 bg-[#0A0A0A]">
      <div className="flex flex-col gap-2 pb-[95px]">
        {categories.map((item, index) => (
          <CategoryCard key={item.name} category={item} hot={index < 3} chainId={chainId} />
        ))}
        <div ref={loadMoreRef} className="h-1" />
      </div>
    </div>
  )
}
