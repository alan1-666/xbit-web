import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { NATIVE_TOKEN_ADDRESS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'

export interface NativeTokenNameProps {
  chainId: number
  address: string
  fallbackName?: string
}

const getSolanaTokenNameKey = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.sol.SOL.toLowerCase():
      return 'nativeToken.sol.sol'
    default:
      return undefined
  }
}

const getEthereumTokenNameKey = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.eth.ETH.toLowerCase():
      return 'nativeToken.eth.eth'
    case NATIVE_TOKEN_ADDRESS.eth.WETH.toLowerCase():
      return 'nativeToken.eth.weth'
    case NATIVE_TOKEN_ADDRESS.eth.USDC.toLowerCase():
      return 'nativeToken.eth.usdc'
    default:
      return undefined
  }
}

const getArbitrumTokenNameKey = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.arb.ETH.toLowerCase():
      return 'nativeToken.arb.eth'
    case NATIVE_TOKEN_ADDRESS.arb.USDC.toLowerCase():
      return 'nativeToken.arb.usdc'
    case NATIVE_TOKEN_ADDRESS.arb.WETH.toLowerCase():
      return 'nativeToken.arb.weth'
    default:
      return undefined
  }
}

const getBscTokenNameKey = (address: string): string | undefined => {
  switch (address.toLowerCase()) {
    case NATIVE_TOKEN_ADDRESS.bsc.BNB.toLowerCase():
    case NATIVE_TOKEN_ADDRESS.bsc.WBNB.toLowerCase():
      return 'Binance Coin'
    default:
      return undefined
  }
}

export const NativeTokenName = (props: NativeTokenNameProps) => {
  const { chainId, address, fallbackName = '' } = props
  const { t } = useTranslation()
  const tKey = useMemo(() => {
    if (chainId === ChainIds.Ethereum) return getEthereumTokenNameKey(address)
    if (chainId === ChainIds.Solana) return getSolanaTokenNameKey(address)
    if (chainId === ChainIds.Arbitrum) return getArbitrumTokenNameKey(address)
    if (chainId === ChainIds.Bsc) return getBscTokenNameKey(address)
  }, [chainId, address])
  return <span>{tKey ? t(tKey) : fallbackName}</span>
}
