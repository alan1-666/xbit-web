import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTokenData } from '@/services/tokens.service'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { selectAllTokens, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { getBlockChainLogo } from '@/utils/helpers'

export function useTokenInfo(token: string, chainId: ChainIds) {
  const dispatch = useDispatch()
  const tokensState = useAppSelector(selectAllTokens)
  const [loading, setLoading] = useState(false)
  const pendingFetch = useRef<Record<string, boolean>>({})
  const activeWallet = useSelector(_activeWallet)

  const fetchTokenData = async (token: string) => {
    try {
      // Skip if chainId is not in [BNB, SOL, MONAD]
      if (![ChainIds.Bsc, ChainIds.Solana, ChainIds.Monad].includes(chainId)) {
        return null
      }

      setLoading(true)
      const response = await gqlClient.query({
        query: getTokenData,
        variables: { input: { address: token, chainId: activeWallet?.chainId } },
      })

      const tokenData = response?.data?.getTokenDetail

      const normalized = {
        address: tokenData?.address,
        chainId: tokenData?.chainId,
        name: tokenData?.name,
        symbol: tokenData?.symbol,
        logo: tokenData?.info?.avatarUrl ?? tokenData?.info?.logoUrl ?? null,
        isBlacklisted: tokenData?.isBlacklisted || false,
        totalSupply: tokenData?.totalSupply || '0',
      }

      dispatch(tokenActions.setTokenData(normalized))

      return normalized
    } catch (error) {
      // console.error('Error fetching token detail:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    if (tokensState[token]) return
    if (pendingFetch.current[token]) return

    pendingFetch.current[token] = true

    fetchTokenData(token).finally(() => {
      pendingFetch.current[token] = false
    })
  }, [token])

  const tokenInfo = token ? tokensState[token] : undefined

  return {
    logo: tokenInfo?.logo || getBlockChainLogo(chainId, token),
    name: tokenInfo?.name,
    symbol: tokenInfo?.symbol,
    loading,
    token: tokenInfo,
  }
}
