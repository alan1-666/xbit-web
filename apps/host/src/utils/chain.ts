import { ChainIds } from '@/types/enums'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'

//get name chain from chainId
export function getNameFromChainId(chainId: ChainIds): string {
  switch (Number(chainId)) {
    case ChainIds.Solana:
      return 'Solana'
    case ChainIds.Ethereum:
      return 'Ethereum'
    case ChainIds.Bsc:
      return 'BNB Chain'
    case ChainIds.Base:
      return 'Base'
    case ChainIds.TRX:
      return 'TRON'
    case ChainIds.Polygon:
      return 'Polygon'
    case ChainIds.Pulse:
      return 'PulseChain'
    case ChainIds.Bitrock:
      return 'Bitrock'
    case ChainIds.Shibarium:
      return 'Shibarium'
    case ChainIds.Cybria:
      return 'Cybria'
    case ChainIds.Avalanche:
      return 'Avalanche'
    case ChainIds.FantomOpera:
      return 'Fantom Opera'
    case ChainIds.Arbitrum:
      return 'Arbitrum'
    case ChainIds.HyperEVM:
    case ChainIds.Hyperliquid:
      return 'HyperLiquid'
    case ChainIds.Mon:
      return 'Monad'   
    default:
      return 'Unknown Chain'
  }
}

export const getChainIdFromName = (name: string): ChainIds => {
  switch (name) {
    case ChainType.Solana:
      return ChainIds.Solana
    case ChainType.Evm:
      return ChainIds.Ethereum
    case ChainType.Tron:
      return ChainIds.TRX
    case ChainType.Bsc:
      return ChainIds.Bsc
    case ChainType.Mon:
      return ChainIds.Mon
    default:
      return ChainIds.Solana
  }
}

export const activeChainToChainIds = (chain: string): ChainIds | undefined => {
  switch (chain) {
    case 'sol':
      return ChainIds.Solana
    case 'eth':
      return ChainIds.Ethereum
    case 'bsc':
      return ChainIds.Bsc
    case 'mon':
      return ChainIds.Mon    
    case 'arb':
      return ChainIds.Arbitrum
    default:
      return undefined
  }
}

export const convertToChainType = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return ChainType.Solana
    case TYPE_CHAIN.ETH:
      return ChainType.Evm
    case TYPE_CHAIN.ARB:
      return ChainType.Evm
    case TYPE_CHAIN.BSC:
      return ChainType.Bsc
    case TYPE_CHAIN.MON:
      return ChainType.Mon   
    default:
      return ChainType.Solana
  }
}

export const convertToChainTypeFromChainId = (chainId: number) => {
  switch (chainId) {
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Arbitrum:
      return ChainType.Arb
    case ChainIds.Ethereum:
      return ChainType.Eth
    case ChainIds.Mon:
      return ChainType.Mon   
    default:
      return ChainType.Solana
  }
}
