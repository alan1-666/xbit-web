import { useQuery } from '@apollo/client'
import { GetPopularTokenResponse } from '@/types/responses.ts'
import { getPopularTokens } from '@services/tokens.service.ts'
import { useMemo } from 'react'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { PopularToken } from '@/types/popularToken.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { SearchHistory } from '@components/common/search/SearchHistory.tsx'
import { getPath } from '@/lib/utils.ts'

interface PopularSearchesProps {
  saveToHistory: (item: SearchHistory) => void
}

const SkeletonList = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="w-14 h-[26px]" />
      ))}
    </>
  )
}

export const PopularSearches = (props: PopularSearchesProps) => {
  const { saveToHistory } = props
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, loading } = useQuery<GetPopularTokenResponse>(getPopularTokens)

  const popularSearches = useMemo(() => {
    return data?.getPopularTokens.slice(0, 8) ?? []
  }, [data])

  const handlePopularSearchClick = (item: PopularToken) => {
    saveToHistory({ address: item.token, name: item.symbol, chainId: item.chainId, logo: item.logoUrl })
    navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: item.token, chain: CHAIN_SYMBOLS[item.chainId] }), { state: { symbol: item.symbol } })
  }

  return (
    <div>
      <div className="text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mb-3">
        {t('search.popularSearch')}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {loading ? (
          <SkeletonList />
        ) : (
          <>
            {popularSearches.map((item) => (
              <div key={item.token} className="rounded">
                <div
                  className="relative bg-[#232329] border-[#FFFFFF14] border rounded-full cursor-pointer hover:bg-[#FFFFFF30] transition text-[#FFFFFF] pl-1 pr-2.5 py-1 text-[calc(1rem*(12/16))] flex items-center"
                  onClick={() => handlePopularSearchClick(item)}
                >
                  {item.hot && (
                    <img src="/images/icons/icon-hot.svg" className="size-4 mr-1 absolute -top-1.5 -right-2" alt="" />
                  )}
                  <Avatar className="size-5 bg-[#111111] mr-1">
                    <AvatarFallback className="capitalize text-[calc(9rem/16)] bg-[#111111]">
                      {item.symbol.slice(0, 2).toLowerCase()}
                    </AvatarFallback>
                    <AvatarImage src={item.logoUrl} />
                  </Avatar>
                  {item.symbol}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
