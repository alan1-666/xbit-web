export interface GetExchangeMetaV2 {
  chains: Chain[]
}

export interface Chain {
  chainId: string
  chainImage: string
  chainName: string
  tokens: Token[]
}

export interface Token {
  address: string
  symbol: string
  name: string
  image: string
  decimals: number
  relayExtra: Extra
  rangoExtra: Extra
  usdPrice: number
  chainId?: string
  chainName?: string
  balance?: number
  szDecimals?: number
  usdValue?: number
  chainImage?: string
}

export interface Extra {
  id: string
}
