import { useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { NATIVE_TOKENS } from '@/lib/constant.ts'

export const useNativeTokenIcon = (options: { address: string; chainId: number; fallbackUrl: string }) => {
  const { address, chainId, fallbackUrl } = options
  return useMemo(() => {
    if (chainId === ChainIds.Ethereum) {
      if (address === NATIVE_TOKENS.eth.ETH.address) return '/images/icons/chains/ic-ethereum.svg'
    }
    if (chainId === ChainIds.Arbitrum) {
      if (address === NATIVE_TOKENS.arb.ETH.address) return '/images/icons/chains/ic-ethereum.svg'
    }
    if (chainId === ChainIds.Bsc) {
      if (address === NATIVE_TOKENS.arb.ETH.address) return '/images/bnb.svg'
    }
    return fallbackUrl
  }, [address, fallbackUrl, chainId])
}
