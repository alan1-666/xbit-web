import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { usePrices } from '@pages/assets'

export const useNativeTokenNameByChain = () => {
  const chainId = useActiveChainId()
  return useMemo(() => {
    switch (chainId) {
      case ChainIds.Bsc:
        return 'BNB'
      case ChainIds.Ethereum:
        return 'ETH'
      case ChainIds.Mon:
        return 'MON'
      default:
        return 'SOL'
    }
  }, [chainId])
}

export const useNativePriceByActiveChain = () => {
  const chainId = useActiveChainId()
  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()
  return useMemo(() => {
    switch (chainId) {
      case ChainIds.Bsc:
        return bnbPrice
      case ChainIds.Ethereum:
        return ethPrice
      case ChainIds.Mon:
        return monPrice
      default:
        return solPrice
    }
  }, [chainId, solPrice, ethPrice, bnbPrice])
}

export const useNativeTokenIcon = () => {
  const chainId = useActiveChainId()
  return useMemo(() => {
    switch (chainId) {
      case ChainIds.Bsc:
        return '/images/icons/chains/ic-bnb.svg'
      case ChainIds.Ethereum:
        return 'ic-ethereum.svg'
      case ChainIds.Mon:
        return '/images/icons/chains/ic-monad.svg'
      default:
        return '/images/cryptoDeposit/solana.svg'
    }
  }, [chainId])
}
