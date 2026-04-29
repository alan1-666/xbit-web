import { futureClient, gqlClient } from '@/lib/gql/apollo-client.ts'
import { getTokenData, getTokenPriceOHLC } from '@services/tokens.service.ts'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { selectTokenByAddress, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getChainId } from '@/lib/blockchain'
import { ChainIds } from '@/types/enums'

const fetchTokenPriceOHLC = async (tokenAddress: string, chainId: ChainIds) => {
  try {
    if (!tokenAddress) return

    const response = await futureClient.query({
      query: getTokenPriceOHLC,
      variables: {
        input: {
          limit: 5,
          token: tokenAddress,
          timeframe: 's1',
          chainId: chainId.toString(),
        },
      },
    })

    return response?.data?.getOHLC?.[0]?.close ?? 0
  } catch (err) {
    console.error(err)
  }
}

const useTokenPriceAndMC = (tokenAddress: string) => {
  const [tokenPrice, setTokenPrice] = useState<number>(0)
  const [marketCap, setMarketCap] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const tokenDataInStore = useAppSelector(selectTokenByAddress(tokenAddress))
  const totalSupply = tokenDataInStore?.totalSupply ? +tokenDataInStore?.totalSupply : 0
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const chainId = getChainId(activeChain)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!tokenDataInStore) {
      gqlClient
        .query({
          query: getTokenData,
          variables: {
            input: {
              address: tokenAddress,
              chainId: activeWallet?.chainId,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          const tokenData = response?.data?.getTokenDetail

          dispatch(
            tokenActions.setTokenData({
              address: tokenData?.address,
              chainId: tokenData?.chainId,
              name: tokenData?.name,
              symbol: tokenData?.symbol,
              logo: tokenData?.info?.logoUrl,
              isBlacklisted: tokenData?.isBlacklisted,
              totalSupply: tokenData?.totalSupply ?? '0',
            }),
          )
        })
    }
  }, [tokenDataInStore, tokenAddress])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchTokenPriceOHLC(tokenAddress, chainId)
      .then((price) => {
        const calculatedMC = price * +totalSupply
        if (isMounted) {
          setTokenPrice(price)
          setMarketCap(calculatedMC)
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [tokenAddress, tokenDataInStore])

  return {
    tokenPrice,
    marketCap,
    totalSupply,
    loading,
  }
}

export default useTokenPriceAndMC
