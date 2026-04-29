import { ChainIds } from '@/types/enums.ts'
import {
  ARB_NATIVE_TOKENS,
  ETH_NATIVE_TOKENS,
  NATIVE_TOKEN_ADDRESS,
  SOL_NATIVE_TOKENS,
  BSC_NATIVE_TOKENS,
  NATIVE_TOKENS,
  TOKEN_BLACK_LIST,
} from '@/lib/constant.ts'

export const checkTokenIsOfficial = (value: string | null | undefined): boolean => {
  if (!value) return false

  try {
    const metaData = JSON.parse(value)
    return Boolean(metaData?.isOfficial)
  } catch (error) {
    console.error('Invalid JSON in checkTokenIsOfficial:', error)
    return false
  }
}

const getSolanaTokenName = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.sol.SOL.toLowerCase():
      return 'Solana'
    default:
      return undefined
  }
}

const getEthereumTokenName = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.eth.ETH.toLowerCase():
      return 'Ethereum'
    case NATIVE_TOKEN_ADDRESS.eth.WETH.toLowerCase():
      return 'Wrapped Ether'
    case NATIVE_TOKEN_ADDRESS.eth.USDC.toLowerCase():
      return 'USDC'
    default:
      return undefined
  }
}

const getArbitrumTokenName = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.arb.ETH.toLowerCase():
      return 'Arbitrum Ethereum'
    case NATIVE_TOKEN_ADDRESS.arb.USDC.toLowerCase():
      return 'Arbitrum USDC'
    case NATIVE_TOKEN_ADDRESS.arb.WETH.toLowerCase():
      return 'Arbitrum Wrapped Ether'
    default:
      return undefined
  }
}

export const getTokenName = (chainId: number, address: string, fallback: string = '') => {
  if (!chainId || !address) return fallback
  if (chainId === ChainIds.Solana) {
    return getSolanaTokenName(address) || fallback
  }
  if (chainId === ChainIds.Ethereum) {
    return getEthereumTokenName(address) || fallback
  }
  if (chainId === ChainIds.Arbitrum) {
    return getArbitrumTokenName(address) || fallback
  }
  return fallback
}

export const getSolanaTokenSymbol = (address: string, fallback?: string, wrappedAlias?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.sol.SOL.toLowerCase():
      return wrappedAlias ? 'WSOL' : 'SOL'
    case NATIVE_TOKENS.sol.USDT.address.toLowerCase():
      return 'USDT'
    case NATIVE_TOKENS.sol.USDC.address.toLowerCase():
      return 'USDC'
    case NATIVE_TOKENS.sol.USDS.address.toLowerCase():
      return 'USDS'
    default:
      return fallback || '--'
  }
}

export const getEthereumTokenSymbol = (address: string, fallback?: string, wrappedAlias?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.eth.ETH.toLowerCase():
      return 'ETH'
    case NATIVE_TOKEN_ADDRESS.eth.WETH.toLowerCase():
      return wrappedAlias ? 'WETH' : 'ETH' // Cover case for WETH as it is often used as a wrapped version of ETH
    case NATIVE_TOKEN_ADDRESS.eth.USDC.toLowerCase():
      return 'USDC'
    default:
      return fallback || '--'
  }
}

export const getArbitrumTokenSymbol = (address: string, fallback?: string, wrappedAlias?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.arb.ETH.toLowerCase():
      return 'ETH'
    case NATIVE_TOKEN_ADDRESS.arb.WETH.toLowerCase():
      return wrappedAlias ? 'WETH' : 'ETH'
    case NATIVE_TOKEN_ADDRESS.arb.USDC.toLowerCase():
      return 'USDC'
    default:
      return fallback || '--'
  }
}

export const getBscTokenSymbol = (address: string, fallback?: string, wrappedAlias?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.bsc.BNB.toLowerCase():
      return 'BNB'
    case NATIVE_TOKEN_ADDRESS.bsc.WBNB.toLowerCase():
      return wrappedAlias ? 'WBNB' : 'BNB'
    case NATIVE_TOKEN_ADDRESS.bsc.USD1.toLowerCase():
      return 'USD1'
    case NATIVE_TOKEN_ADDRESS.bsc.USDT.toLowerCase():
      return 'USDT'
    case NATIVE_TOKEN_ADDRESS.bsc.USDC.toLowerCase():
      return 'USDC'
    case NATIVE_TOKEN_ADDRESS.bsc.LISUSD.toLowerCase():
      return 'LisUSD'
    case NATIVE_TOKEN_ADDRESS.bsc.ASTER.toLowerCase():
      return 'ASTER'
    default:
      return fallback || '--'
  }
}

export const getMonTokenSymbol = (address: string, fallback?: string, wrappedAlias?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.mon.MON.toLowerCase():
      return 'MON'
    case NATIVE_TOKEN_ADDRESS.mon.WMON.toLowerCase():
      return wrappedAlias ? 'WMON' : 'MON'
    case NATIVE_TOKEN_ADDRESS.mon.USD1.toLowerCase():
      return 'USD1'
    case NATIVE_TOKEN_ADDRESS.mon.USDT.toLowerCase():
      return 'USDT'
    case NATIVE_TOKEN_ADDRESS.mon.USDC.toLowerCase():
      return 'USDC'
    case NATIVE_TOKEN_ADDRESS.mon.LISUSD.toLowerCase():
      return 'LisUSD'
    case NATIVE_TOKEN_ADDRESS.mon.ASTER.toLowerCase():
      return 'ASTER'
    default:
      return fallback || '--'
  }
}

export const getPolygonTokenSymbol = (address: string, fallback?: string, _?: boolean): string => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.polygon.USDC.toLowerCase():
      return 'USDC'
    default:
      return fallback || '--'
  }
}

export const getTokenSymbol = (
  chainId: number,
  address: string,
  fallback: string = '',
  wrappedAlias: boolean = false,
) => {
  if (!chainId || !address) return fallback
  if (chainId === ChainIds.Solana) {
    return getSolanaTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.Ethereum) {
    return getEthereumTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.Arbitrum) {
    return getArbitrumTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.HyperEVM) {
    return getArbitrumTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.Bsc) {
    return getBscTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.Mon) {
    return getMonTokenSymbol(address, fallback, wrappedAlias)
  }
  if (chainId === ChainIds.Polygon) {
    return getPolygonTokenSymbol(address, fallback, wrappedAlias)
  }
  return fallback
}

export const isNativeToken = (chainId: number, token: string): boolean => {
  // return nativeTokens.some((nativeToken) => nativeToken.toLowerCase() === token.toLowerCase())
  if (chainId === ChainIds.Solana) {
    return SOL_NATIVE_TOKENS.includes(token)
  }
  if (chainId === ChainIds.Arbitrum) {
    return ARB_NATIVE_TOKENS.includes(token.toLowerCase())
  }
  if (chainId === ChainIds.Ethereum) {
    return ETH_NATIVE_TOKENS.includes(token.toLowerCase())
  }
  if (chainId === ChainIds.Bsc) {
    return BSC_NATIVE_TOKENS.includes(token.toLowerCase())
  }
  return false
}

export const isBlackListTokenAddress = (address: string | undefined) => {
  if (!address) return false
  const normalizedBlackList = TOKEN_BLACK_LIST.map((token) => token.toLowerCase())
  return normalizedBlackList.includes(address.toLowerCase())
}
