import { useAppSelector } from '@/redux/store'
import { ChainType, UserEmbeddedWallet } from '@/@generated/gql/graphql-user.ts'
import { useMemo } from 'react'

const getChainTypeFromChainId = (chainId: string): ChainType | null => {
  if (chainId === 'solana') return ChainType.Solana
  return ChainType.Evm
}

export const useWalletByChainId = (chainId: string) => {
  const allWallets = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWallet[])
  return useMemo(() => {
    return allWallets.filter((wallet) => wallet.chain === getChainTypeFromChainId(chainId))
  }, [allWallets, chainId])
}
