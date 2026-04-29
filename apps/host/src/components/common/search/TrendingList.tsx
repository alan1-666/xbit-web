import { cn } from '@/lib/utils.ts'
import { SearchResultItem } from '@components/common/search/SearchResultItem.tsx'
import { useQuery } from '@apollo/client'
import { GetTokenTrendingResponse } from '@/types/responses.ts'
import { getTrending24hTokens } from '@services/tokens.service.ts'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchListSkeleton } from '@components/common/search/SearchListSkeleton.tsx'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'


const chains = [
  { name: 'Solana', value: 'SOLANA', icon: getBlockchainLogo2(ChainIds.Solana) },
  { name: 'ETH', value: 'EVM', icon: getBlockchainLogo2(ChainIds.Ethereum) },
]

export const TrendingList = () => {
  const { t } = useTranslation()
  const [chainIndex, setChainIndex] = useState(0)
  const { data, loading } = useQuery<GetTokenTrendingResponse>(getTrending24hTokens, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        timeRange: 'h24',
        dex: 'All',
        direction: 'Popular',
        chain: chains[chainIndex].value,
        sortBy: '-volume24h'
      },
    },
  })

  const tokens = useMemo(() => {
    return data?.getTokenTrending.data ?? []
  }, [data])

  const stickyRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sticky = stickyRef.current
    const list = listRef.current
    const container = document.querySelector('#search-container')

    if (!sticky || !list || !container) return

    const handleScroll = () => {
      const stickyBottom = sticky.getBoundingClientRect().bottom
      const listTop = list.getBoundingClientRect().top
      const delta = stickyBottom - listTop
      list.style.clipPath = `inset(${delta}px 0px 0px 0px)`
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [stickyRef.current, listRef.current])

  const handleChangeChain = (index: number) => {
    setChainIndex(index)
    // const container = document.querySelector('#search-container')
    // if (container) {
    //   container.scrollTo({ top: 0, behavior: 'smooth' })
    // }
  }

  return (
    <div>
      <div className="sticky top-0 z-10" ref={stickyRef}>
        <div className="text-title flex items-center align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
          {t('search.24hTrending')}
          <img src="/images/icons/icon-hot.svg" className="size-4 ml-0.5" alt="" />
        </div>

        <div className="flex items-center gap-2 py-2 pt-3">
          {chains.map((chain, index) => (
            <div
              key={chain.value}
              className={cn(
                'flex items-center gap-1 text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] cursor-pointer px-3.5 py-2 rounded-full transition-all duration-300',
                chainIndex === index ? 'border-gradient bg-[#FFFFFF14]' : 'border-1 border-transparent bg-[#FFFFFF14]',
              )}
              onClick={() => handleChangeChain(index)}
            >
              <img src={chain.icon} alt="" className="size-4.5 rounded-full" />
              {chain.name}
            </div>
          ))}
        </div>
      </div>

      <div ref={listRef}>
        {loading ? (
          <SearchListSkeleton />
        ) : (
          <>
            {tokens.map((token) => (
              <SearchResultItem key={token.token} token={token} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
