import { ChainIds, FundingType } from '@/types/enums.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { getTokenSymbol } from '@/utils/token.ts'

export const depositTypes: FundingType[] = [
  FundingType.Deposit,
  FundingType.DepositPredictExternal,
  FundingType.DepositFutureExternal,
]

export const withdrawTypes: FundingType[] = [
  FundingType.Withdraw,
  FundingType.WithdrawPredictExternal,
  FundingType.WithdrawFutureExternal,
]

export const transferTypes: FundingType[] = [FundingType.Swap, FundingType.DepositFuture, FundingType.WithdrawFuture]

export const isDepositRecord = (type: FundingType) => {
  return depositTypes.includes(type)
}

export const isWithdrawRecord = (type: FundingType) => {
  return withdrawTypes.includes(type)
}

export const isTransferRecord = (type: FundingType) => {
  return transferTypes.includes(type)
}

const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const ARB_ETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
export const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_HYPERLIQUID_ADDRESS = '0x00000000000000000000000000000000'
const POLYGON_USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

export const getTokenLogoByAddress = (chainId: string | number, token?: string) => {
  if (!token) {
    if (+chainId === ChainIds.HyperEVM || +chainId === ChainIds.Hyperliquid) {
      return '/images/icons/chains/ic-usdc.svg'
    }

    if ([ChainIds.Ethereum, ChainIds.Arbitrum, ChainIds.Base].includes(+chainId)) {
      return '/images/icons/chains/ic-ethereum.svg'
    }

    if (+chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }

    if (+chainId === ChainIds.Monad) {
      return '/images/icons/chains/ic-monad.svg'
    }

    return getBlockChainLogo(+chainId, SOL_ADDRESS)
  }

  if (token === SOL_ADDRESS) return '/images/icons/chains/ic-solana2.png'
  if (token === NATIVE_ETH_ADDRESS) {
    if (+chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }
    if (+chainId === ChainIds.Monad) {
      return '/images/icons/chains/ic-monad.svg'
    }
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ETH_ADDRESS && +chainId === ChainIds.Ethereum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ARB_ETH_ADDRESS && +chainId === ChainIds.Arbitrum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }

  if (
    token.toLowerCase() === USDC_ADDRESS_ARBITRUM &&
    (+chainId === ChainIds.Arbitrum || +chainId === ChainIds.HyperEVM)
  ) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (token.toLowerCase() === BNB_ADDRESS.toLowerCase() && +chainId === ChainIds.Bsc) {
    return '/images/bnb.svg'
  }
  if (token.toLowerCase() === USDC_HYPERLIQUID_ADDRESS || +chainId === ChainIds.Hyperliquid) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (+chainId === ChainIds.Polygon && token?.toLowerCase() === POLYGON_USDC_ADDRESS.toLowerCase()) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  return getBlockChainLogo(+chainId, token)
}

export const getUnit = (tokenAddress: string, chainId?: string | number, fallback?: string) => {
  if (!tokenAddress && !chainId) return 'USDC'

  if (!tokenAddress && chainId) {
    switch (+chainId) {
      case ChainIds.Ethereum:
      case ChainIds.Arbitrum:
      case ChainIds.Base:
        return 'ETH'
      case ChainIds.Solana:
        return 'SOL'
      case ChainIds.Bsc:
        return 'BNB'
      case ChainIds.Monad:
        return 'MON'
      default:
        return 'USDC'
    }
  }

  if (!tokenAddress) return 'USDC'
  switch (tokenAddress.toLowerCase()) {
    case SOL_ADDRESS.toLowerCase():
      return 'SOL'
    case ETH_ADDRESS.toLowerCase():
      return 'ETH'
    case ARB_ETH_ADDRESS.toLowerCase():
      return 'ETH'
    case NATIVE_ETH_ADDRESS.toLowerCase():
      if (chainId && +chainId === ChainIds.Bsc) {
        return 'BNB'
      }
      if (chainId && +chainId === ChainIds.Monad) {
        return 'MON'
      }
      return 'ETH'
    case USDC_ADDRESS_ARBITRUM.toLowerCase():
      return 'USDC'
    case '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase():
      return 'USDC' // Fallback for USDC.e
    case BNB_ADDRESS.toLowerCase():
      return 'BNB'
    case USDC_HYPERLIQUID_ADDRESS.toLowerCase():
      return 'USDC'
    case POLYGON_USDC_ADDRESS.toLowerCase():
      return 'USDC'
    default:
      return fallback ?? '--'
  }
}

export const getTokenLogo = (chainId: string | number, token: string, logoUrl: string) => {
  if (token === SOL_ADDRESS) return '/images/icons/chains/ic-solana2.png'
  if (token === NATIVE_ETH_ADDRESS) {
    if (+chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }
    if (+chainId === ChainIds.Monad) {
      return '/images/icons/chains/ic-monad.svg'
    }
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ETH_ADDRESS && +chainId === ChainIds.Ethereum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ARB_ETH_ADDRESS && +chainId === ChainIds.Arbitrum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }

  if (
    token.toLowerCase() === USDC_ADDRESS_ARBITRUM &&
    (+chainId === ChainIds.Arbitrum || +chainId === ChainIds.HyperEVM)
  ) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (token.toLowerCase() === BNB_ADDRESS.toLowerCase() && +chainId === ChainIds.Bsc) {
    return '/images/bnb.svg'
  }
  if (token.toLowerCase() === USDC_HYPERLIQUID_ADDRESS || +chainId === ChainIds.Hyperliquid) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (+chainId === ChainIds.Polygon && token?.toLowerCase() === POLYGON_USDC_ADDRESS.toLowerCase()) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (logoUrl) return logoUrl
  return getBlockChainLogo(+chainId, token)
}

export const getDepositChainLogo = (record: FundingRecord) => {
  if (record.type === FundingType.DepositFutureExternal) {
    return getBlockchainLogo2(ChainIds.Hyperliquid)
  }
  if (record?.chainId === ChainIds.HyperEVM) {
    return getBlockchainLogo2(ChainIds.Hyperliquid)
  }
  if (record.type === FundingType.DepositPredictExternal) {
    return getBlockchainLogo2(+record.toChainId)
  }
  return getBlockchainLogo2(+record.chainId)
}

export const getDepositTokenLogo = (record: FundingRecord, fallback: string = '') => {
  if (record.type === FundingType.DepositFutureExternal) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (record.type === FundingType.DepositPredictExternal) {
    return getTokenLogo(+record.toChainId || record.chainId, record.toToken || record.token, fallback)
  }
  return getTokenLogo(+record.chainId, record.token, fallback)
}

export const getDepositTokenName = (record: FundingRecord, tokenSymbol: string = '') => {
  if (record.type === FundingType.DepositFutureExternal) {
    return 'USDC'
  }
  if (record.type === FundingType.DepositPredictExternal) {
    return getTokenSymbol(
      record.toChainId ? record.toChainId : +record.chainId,
      record.toToken || record.token,
      tokenSymbol,
    )
  }
  return getTokenSymbol(+record.chainId, record.token, tokenSymbol)
}
