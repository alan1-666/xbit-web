import { QuoteRelayRequest } from '@/@generated/gql/graphql-symbolDex'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getQuote } from '@/services/swap.service'
import { ChainIds } from '@/types/enums'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ServiceConfig } from '@/lib/gql/service-config'


const PrefetchPerpsDepositAddress = () => {
  const dispatch = useAppDispatch()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const tokensChains = useAppSelector((state) => state.tokensChains)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const accessToken = ServiceConfig.token || ''
  
  const SOLAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Solana)?.walletAddress || ''
  const BTCAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Btc)?.walletAddress || ''
  const TRONAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Tron)?.walletAddress || ''

  const supportedTokens = useMemo(() => {
    if (tokensChains?.tokens && tokensChains.tokens.length > 0) {
      return tokensChains.tokens
    }
    return []
  }, [tokensChains?.tokens])

  const originId = useMemo(() => {
    // USDC on Arbitrum
    return supportedTokens
      .find((token: any) => token.symbol === 'USDC')
      ?.chainList?.find((network: any) => network.chainId == ChainIds.Arbitrum)?.tokenId
  }, [supportedTokens])

  const destinationId = useMemo(() => {
    // USDC on Hyperliquid
    return supportedTokens
      .find((token: any) => token.symbol === 'USDC')
      ?.chainList?.find((network: any) => network.chainId == ChainIds.Hyperliquid)?.tokenId
  }, [supportedTokens])

  useEffect(() => {
    const fetchQuoteRelay = async () => {
      try {
        if (!originId || !accessToken) {
          return
        }
        dispatch(exchangeActions.setPerpsDepositLoading(true))

        const { data } = await symbolDexClient.query({
          query: getQuote,
          variables: {
            input: {
              originId: originId,
              destinationId: destinationId,
              recipient: EVMAddress,
              amount: '3000000',
              needDepositAddress: true,
              userAddr: EVMAddress,
              userSolAddr: SOLAddress,
              userBtcAddr: BTCAddress,
              userTronAddr: TRONAddress,
            } as QuoteRelayRequest,
          },
          fetchPolicy: 'network-only',
        })
        if (data?.quoteRelay) {
          dispatch(
            exchangeActions.setPerpsDepositAddresses({
              depositAddress: data.quoteRelay.depositAddress,
              depositSolAddress: data.quoteRelay.depositSolAddress,
              depositBtcAddress: data.quoteRelay.depositBtcAddress,
              depositTvmAddress: data.quoteRelay.depositTvmAddress,
            }),
          )
        }
        dispatch(exchangeActions.setPerpsDepositLoading(false))
      } catch (error) {
        console.error('Error fetching deposit address:', error)
        dispatch(exchangeActions.setPerpsDepositLoading(false))
      }
    }
    fetchQuoteRelay()
  }, [accessToken, originId, destinationId, EVMAddress, SOLAddress, BTCAddress, TRONAddress])

  return null
}

export default PrefetchPerpsDepositAddress
