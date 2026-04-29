import { TimeframeAndQuickBuy } from '@components/discover/TimeframeAndQuickBuy.tsx'
import { useContext, useEffect, useMemo, useRef } from 'react'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import {
  TokenStatisticDto,
} from '@/@generated/gql/graphql-core.ts'
import { WatchlistTokens } from '@components/discover/WatchlistTokens.tsx'
import { DiscoverPageContext } from '@components/discover/DiscoverPageContext.tsx'
import { TAB_WATCHLIST } from '@components/discover/DiscoverTabs.tsx'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { Loading } from '@components/common/Loading.tsx'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_FAVORITE } from '@components/detailListIcon'
import { useWatchlistTokens } from '@pages/meme/discover/desktop/hooks/useWatchlistTokens.ts'

export const TabWatchlist = () => {
  const { filters, onFiltersChanged } = useContext(DiscoverPageContext)
  const aiRef = useRef<AIAnalysisDrawerHandle>(null)

  const { currentTimeframe, setCurrentTimeframe } = useMemo(() => {
    const filter = filters[TAB_WATCHLIST]
    const currentTimeframe = filter.timeframe as TimeframeOption
    const setCurrentTimeframe = (timeframe: TimeframeOption) => {
      onFiltersChanged(TAB_WATCHLIST, {
        ...filter,
        timeframe,
      })
    }
    return {
      currentTimeframe,
      setCurrentTimeframe,
    }
  }, [filters])

  const parentRef = useRef<HTMLDivElement>(null)

  const { data, refetch, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, removeToken } = useWatchlistTokens({
    excludeBlacklisted: false
  })

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_FAVORITE, () => {
      setTimeout(() => {
        refetch().then()
      }, 200)
    })
  }, [refetch])

  const tokens = useMemo(() => {
    return data ?? []
  }, [data])

  const loadMoreRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage()
      }
    })
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      // scrollElement.removeEventListener('scroll', throttledScrollHandler)
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasNextPage, isFetchingNextPage, loadMoreRef.current])

  const handleOnItemRemoved = (token: TokenStatisticDto) => {
    removeToken(token.token)
  }

  const handleOnAiClick = (token: TokenStatisticDto) => {
    if (aiRef.current) {
      aiRef.current.open(token.token)
    }
  }

  return (
    <div className=" bg-[#0A0A0A] flex flex-col z-0 flex-1">
      <div className="py-3 sticky top-[35px] z-[1] bg-[#0A0A0A] px-2.5">
        <TimeframeAndQuickBuy currentTimeframe={currentTimeframe} onTimeframeChange={setCurrentTimeframe} />
      </div>
      <div className="hidden">
        <AIAnalysisDrawer ref={aiRef} />
      </div>
      <div ref={parentRef} className="flex flex-1 flex-col overflow-y-auto no-scrollbar pb-[95px]">
        <WatchlistTokens
          tokens={tokens as unknown as TokenStatisticDto[]}
          isLoading={isLoading}
          timeframe={currentTimeframe}
          onItemRemoved={handleOnItemRemoved}
          onAiClick={handleOnAiClick}
        />
        <div className="h-[1px] w-full" ref={loadMoreRef} />
        {hasNextPage && (
          <div className="h-[84px] w-full flex justify-center items-center">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}
