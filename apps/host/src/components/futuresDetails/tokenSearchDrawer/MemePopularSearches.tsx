import { TOKEN_TRENDING_SEARCH_BAR_MS } from '@/components/futuresDiscover/futuresSearch'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import ls from '@/lib/local-storage'
import { getPath } from '@/lib/utils'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useAppDispatch } from '@/redux/store'
import { PopularToken } from '@/types/popularToken.ts'
import { GetPopularTokenResponse } from '@/types/responses.ts'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage'
import { useQuery } from '@apollo/client'
import { getPopularTokens } from '@services/tokens.service.ts'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TokenSearchDrawerType } from '.'
import useHandleLogic from './hooks/useHandleLogic'
import SkeletonList from './SkeletonList'

const POPULAR_SEARCHES_KEY = 'POPULAR_SEARCHES_KEY'

const MemePopularSearches = ({ type }: { type?: TokenSearchDrawerType }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { saveToHistory } = useHandleLogic()
  const [popularSearches, setPopularSearches] = useState<PopularToken[]>(
    getFromLocalStorageWithTTL<PopularToken[]>(POPULAR_SEARCHES_KEY) ?? [],
  )

  const { data, loading } = useQuery<GetPopularTokenResponse>(getPopularTokens)

  useEffect(() => {
    setPopularSearches(data?.getPopularTokens.slice(0, 8) ?? [])
    return () => {
      if (data) {
        saveToLocalStorageWithTTL<PopularToken[]>(
          POPULAR_SEARCHES_KEY,
          data?.getPopularTokens.slice(0, 8),
          TOKEN_TRENDING_SEARCH_BAR_MS,
        )
      }
    }
  }, [data])

  const handlePopularSearchClick = (item: PopularToken) => {
    saveToHistory({ address: item.token, name: item.symbol, chainId: item.chainId, logo: item.logoUrl }, 'meme')
    if (type === TokenSearchDrawerType.CRYPTO) {
      // default switch to chain Sol when click from memeSearch
      const memeChain = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
      // ls.set('selected_chain', memeChain)
      // create variable to check if need to block transfer back to chain arb on page DetailToken
      ls.set('disableSwitchChain', true)
      dispatch(walletActions.setActiveChain(memeChain))
      dispatch(newWalletActions.setActiveChain(memeChain))
    }

    navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: item.token, chain: CHAIN_SYMBOLS[item.chainId] }), {
      state: { symbol: item.symbol }
    })
  }

  const isLoading = loading && !popularSearches.length

  // useEffect(() => {
  //   if (!ServiceConfig.token) {
  //     setPopularSearches((prev) => [{}])
  //   }
  // }, [ServiceConfig.token])

  return (
    <div className="flex items-start space-x-1.5 no-scrollbar mt-[6px] flex-wrap">
      {isLoading ? (
        <SkeletonList className="h-[34px]" />
      ) : (
        popularSearches.map((item) => (
          <div
            key={item.token}
            className="relative p-[4px] h-[24px] bg-[#18181D] hover:bg-[#FFFFFF30] rounded-[4px] cursor-pointer mt-[10px] "
            onClick={() => handlePopularSearchClick(item)}
          >
              <div className="text-[calc(13rem/16)] leading-[calc(15rem/16)] app-font-regular text-[#FFFFFF]">{item.symbol}</div>
          </div>
        ))
      )}
    </div>
  )
}

export default MemePopularSearches
