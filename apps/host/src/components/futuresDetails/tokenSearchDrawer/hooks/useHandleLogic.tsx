import { SearchHistory } from '@/components/common/search/SearchHistory'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatPercentageChange } from '@/lib/format'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage'
import { formatAddressWallet } from '@/lib/string'
import { getPath } from '@/lib/utils'
import { GET_CATEGORY_LIST } from '@/services/symbol.dex.service'
import { TokenTrending } from '@/types/token'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chains } from '../MemeList'
import { ChainIds } from '@/types/enums'

export const useGetSetHistorySearch = () => {
  const memeChain = useMemo<keyof typeof chains>(() => {
    const raw = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
    return (raw as keyof typeof chains) ?? (TYPE_CHAIN.SOLANA as keyof typeof chains)
  }, [])
  // const selectedChain = useAppSelector((state) => state.newWallet.activeChain)

  const handleGetHistorySearch = () => {
    // Remove chained storage, now store everything in 1 key
    const searchHistoryDefault = JSON.parse(localStorage.getItem('searchHistoryv2') || '[]') as SearchHistory[]
    // const searchHistoryBSC = JSON.parse(localStorage.getItem('searchHistoryvBSC') || '[]') as SearchHistory[]
    const searchHistoryList = searchHistoryDefault

    return searchHistoryList
  }

  const handleSetHistorySearch = (data: SearchHistory[]) => {
    localStorage.setItem('searchHistoryv2', JSON.stringify(data))
  }

  return {
    memeChain,
    handleGetHistorySearch,
    handleSetHistorySearch,
  }
}

const useHandleLogic = () => {
  const { handleGetHistorySearch, handleSetHistorySearch } = useGetSetHistorySearch()

  const navigate = useNavigate()
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(
    handleGetHistorySearch() || ([] as SearchHistory[]),
  )

  const saveToHistory = (item: SearchHistory, type?: 'dex' | 'meme' | 'xstock' | 'address' | 'prediction') => {
    const searchHistoryList = handleGetHistorySearch()
    const newHistory = searchHistoryList.filter((history) => history.address !== item.address)
    newHistory.unshift({ ...item, type: type || item.type || 'dex' })
    if (newHistory.length >= 15) {
      newHistory.pop()
    }
    handleSetHistorySearch(newHistory)
    setSearchHistory(newHistory)
  }

  const handleClearHistory = () => {
    handleSetHistorySearch([])
    setSearchHistory([])
  }

  const handleRowAddressClick = ({ address, chainId = ChainIds.Solana }: { address: string; chainId: number }) => {
    const searchHistory = handleGetHistorySearch()
    const newHistory = searchHistory.filter((item) => item?.address !== address)
    newHistory.unshift({
      address,
      name: formatAddressWallet(address),
      chainId,
      type: 'address',
    })
    if (newHistory.length >= 15) {
      newHistory.pop()
    }

    handleSetHistorySearch(newHistory)
    navigate(`${APP_PATH.MEME_WALLET}/${address}?tab=Summary`, {
      state: { fromSearch: window.location.pathname + window.location.search },
      replace: true,
    })
  }

  const handleRowClick = (
    token: TokenTrending & {
      isXStock?: boolean
    },
    isfuturesSearch?: boolean,
  ) => {
    const searchHistoryList = handleGetHistorySearch()

    const newHistory = searchHistoryList.filter((item) => item?.address !== token.token)
    newHistory.unshift({
      address: token.token,
      name: token.symbol,
      logo: token.image,
      chainId: token.chainId,
      type: token?.isXStock ? 'xstock' : 'meme',
    })
    if (newHistory.length > 15) {
      newHistory.pop()
    }

    // save search history based on chain
    handleSetHistorySearch(newHistory)

    if (isfuturesSearch) {
      // create variable to check if need to block transfer back to chain arb on page DetailToken
      ls.set('disableSwitchChain', true)
      // dispatch(walletActions.setActiveChain(selectedChain))
      // dispatch(newWalletActions.setActiveChain(selectedChain))
    }

    if (token?.isXStock) {
      const path = getPath(APP_PATH.X_STOCK_DETAIL, { address: token.token ?? '', chain: CHAIN_SYMBOLS[token.chainId] })
      navigate(path, {
        state: {
          token,
          symbol: token.symbol,
          chain: CHAIN_SYMBOLS[token.chainId],
          tokenLogo: token.image,
          address: token.token,
          tokenName: token.name,
        },
      })
    } else {
      navigate(
        getPath(APP_PATH.MEME_TOKEN_DETAIL, {
          address: token.token,
          chain: CHAIN_SYMBOLS[+token.chainId],
        }),
        {
          state: {
            token,
            symbol: token.symbol,
            chain: CHAIN_SYMBOLS[token.chainId],
            tokenLogo: token.image,
            address: token.token,
            tokenName: token.name,
            // createdTime: Number(token.createdTime) * 1000,
          },
        },
      )
    }
  }

  useEffect(() => {
    return () => {
      ls.set('disableSwitchChain', false)
    }
  }, [])

  const formattedPrice = (value: number) => ({
    value: value !== undefined ? formatPercentageChange(value).label : '--',
    isPositive: value !== undefined && value > 0,
  })

  const useGetCategorys = () => {
    const { data, isFetching } = useReactQuery({
      queryKey: ['GET_CATEGORY_LIST'],
      queryFn: async () => {
        const res = await symbolDexClient.query({
          query: GET_CATEGORY_LIST,
        })
        return res?.data
      },
    })
    return {
      getTokenTrendingSearchBar: data?.getTokenTrendingSearchBar?.data || [],
      loading: !data && isFetching,
    }
  }

  return {
    searchHistory: searchHistory.filter((e) => e.address),
    setSearchHistory,
    saveToHistory,
    handleClearHistory,
    handleRowClick,
    formattedPrice,
    useGetCategorys,
    handleRowAddressClick,
  }
}

export default useHandleLogic
