import { useAppSelector } from '@/redux/store'
import { useMemo } from 'react'
import { getNativeTokenByActiveChain, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { ChainIds } from '@/types/enums.ts'
import { ChainType } from '@/@generated/gql/graphql-future.ts'

export const useActiveChain = () => {
  return useAppSelector((state) => state.newWallet.activeChain as TYPE_CHAIN)
}

export const useActiveChainId = (): ChainIds | undefined => {
  const activeChain = useActiveChain()
  return useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return ChainIds.Solana
    if (activeChain === TYPE_CHAIN.ETH) return ChainIds.Ethereum
    if (activeChain === TYPE_CHAIN.ARB) return ChainIds.Arbitrum
    if (activeChain === TYPE_CHAIN.BSC) return ChainIds.Bsc
    if (activeChain === TYPE_CHAIN.MON) return ChainIds.Mon
    return undefined
  }, [activeChain])
}

export const useActiveChainType = (): ChainType => {
  const activeChainId = useActiveChainId()
  return useMemo(() => {
    switch (activeChainId) {
      case ChainIds.Bsc:
        return ChainType.Bsc
      case ChainIds.Ethereum:
        return ChainType.Evm
     case ChainIds.Mon:
        return ChainType.Mon
      default:
        return ChainType.Solana
    }
  }, [activeChainId])
}

export const useNativeTokenSymbol = (): string => {
  const activeChain = useActiveChain()
  return useMemo(() => {
    return getNativeTokenByActiveChain(activeChain)
  }, [activeChain])
}

export const useDisplayUnit = () => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenSymbol = useNativeTokenSymbol()
  return useMemo(() => {
    if (dataUnit === 'USD') {
      return '$'
    }
    return nativeTokenSymbol
  }, [dataUnit, nativeTokenSymbol])
}
