import { SetStateAction, useMemo, useState } from 'react'
import AppDrawer from '../common/AppDrawer'
import { TokenDetail } from '@/@generated/gql/graphql-core'
import { Token, ChainOption } from './TokenSelectionDrawer/types'
import SearchInput from './TokenSelectionDrawer/SearchInput'
import TrendingHeader from './TokenSelectionDrawer/TrendingHeader'
import ChainSelector from './TokenSelectionDrawer/ChainSelector'
import TokenList from './TokenSelectionDrawer/TokenList'
import { ChainIds } from '@/types/enums.ts'
import { useApolloClient } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { getTrendingTokens, searchTokens } from '@services/tokens.service.ts'
import { TokenTrending } from '@/types/token.ts'
import useDebounceValue from '@hooks/useDebounceValue.ts'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useNavigate } from 'react-router-dom'
import { getPath } from '@/lib/utils.ts'

interface TokenSelectionDrawerProps {
  open: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
  currentToken: TokenDetail
}

// Mock data for tokens
export const mockTokens: Token[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `token-${index}`,
  name: index === 0 ? 'Trump' : `Token ${index + 1}`,
  symbol: index === 0 ? 'TRUMP' : `TKN${index + 1}`,
  address: `94qJf...${index === 0 ? 'ump' : index.toString().padStart(3, '0')}`,
  logo: index === 0 ? '/images/tokenDetail/trump.webp' : `/images/tokenDetail/token${index + 1}.webp`,
  chainLogo: '/images/solana.webp',
  marketCap: '$532.7K',
  priceChange: index % 2 === 0 ? -6.78 : 6.78,
}))

// Mock data for chain options
export const chainOptions: ChainOption[] = [
  { id: 'solana', name: 'Solana', image: '/images/detailHeader/Solana.png', chainId: ChainIds.Solana, value: 'SOLANA' },
  { id: 'eth', name: 'ETH', image: '/images/detailHeader/ETH.png', chainId: ChainIds.Ethereum, value: 'EVM' },
]

const useSearchTokens = (keyword: string, chain?: string, skip?: boolean) => {
  const client = useApolloClient()
  const { data, ...rest } = useQuery({
    queryKey: ['searchTokens', chain, keyword],
    enabled: !!chain && !skip,
    queryFn: async () => {
      if (keyword) {
        const res = await client.query({
          query: searchTokens,
          variables: {
            input: keyword,
          },
        })
        return res.data.searchToken
      } else {
        const res = await client.query({
          query: getTrendingTokens,
          variables: {
            input: {
              page: 1,
              limit: 20,
              sortBy: '-volume24h',
              timeRange: 'h24',
              dex: 'All',
              direction: 'Popular',
              chain: chain,
            },
          },
        })
        return res.data.getTokenTrending.data
      }
    },
  })
  const tokens: Token[] = useMemo(() => {
    if (!data) return []
    return data.map((token: TokenTrending) => ({
      id: token.token,
      name: token.name,
      symbol: token.symbol,
      address: token.token,
      logo: token.image ?? getBlockChainLogo(token.chainId, token.token),
      chainLogo: getBlockchainLogo2(token.chainId),
      marketCap: token.marketcap,
      priceChange: token.price24hChange,
      launchpad: getLaunchpad(token.dexes),
      isFavorite: token.isFavorite,
    }))
  }, [data])
  return {
    tokens,
    ...rest,
  }
}

const TokenSelectionDrawer = ({ open, setOpen }: TokenSelectionDrawerProps) => {
  const [keyword, setKeyword] = useState('')
  const [chainId, setChainId] = useState(ChainIds.Solana)
  const navigate = useNavigate()

  const debouncedKeyword = useDebounceValue(keyword, 500)

  const chain = useMemo(() => {
    return chainOptions.find((option) => option.chainId === chainId)
  }, [chainId])

  const { tokens, isPending } = useSearchTokens(debouncedKeyword, chain?.value, !open)

  const handleTokenSelect = (token: Token) => {
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: token.address,
        chain: CHAIN_SYMBOLS[+chainId],
      }),
      { state: { symbol: token.symbol } }
    )
    setOpen(false)
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerContentClassName="overflow-y-clip"
      drawerClassName='bg-[url("/images/tokenDetail/bg_top_100.png")] bg-cover bg-center'
      drawerContent={
        <div className="h-[68vh] flex flex-col">
          <SearchInput value={keyword} onChange={setKeyword} />
          {!keyword && (
            <>
              <TrendingHeader />
              <ChainSelector options={chainOptions} selectedChainId={chainId} onSelect={setChainId} />
            </>
          )}
          <TokenList tokens={tokens} onSelect={handleTokenSelect} loading={isPending} />
        </div>
      }
    />
  )
}

export default TokenSelectionDrawer
