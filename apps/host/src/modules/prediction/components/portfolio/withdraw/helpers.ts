import { WithdrawChainModel } from '@/modules/prediction/models/WithdrawChainModel'
import { getBlockChainLogo } from '@/utils/helpers.ts'

export type TokenMapValue = {
  symbol: string
  name: string
  image: string
  chainList: {
    chainId: number
    chainName: string
    chainImage: string
    tokenId: string | undefined
    decimals: number
    vmType: string
    addressInChain: string
  }[]
}

export const buildTokenMapFromChains = (chains: WithdrawChainModel[]) => {
  const tokenMap = new Map<string, TokenMapValue>()

  chains.forEach((chain) => {
    chain.featuredTokens?.forEach((currency) => {
      if (!tokenMap.has(currency.symbol)) {
        tokenMap.set(currency.symbol, {
          symbol: currency.symbol,
          name: currency.name,
          image: currency.metadata?.logoURI || getBlockChainLogo(chain.id, currency.address),
          chainList: [],
        })
      }

      const token = tokenMap.get(currency.symbol)
      if (!token) return
      token.chainList.push({
        chainId: chain.id,
        chainName: chain.displayName,
        chainImage: chain.iconUrl,
        tokenId: currency.id,
        decimals: currency.decimals,
        vmType: chain.vmType,
        addressInChain: currency.address,
      })
    })
  })

  return tokenMap
}
