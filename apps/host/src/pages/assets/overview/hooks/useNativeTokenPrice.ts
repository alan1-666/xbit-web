import { usePrices } from '@pages/assets'
import { useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { SOL_ADDRESS } from '@/lib/blockchain.ts'
import { NATIVE_TOKENS } from '@/lib/constant.ts'

export const getNativeTokenPrice = (options: {
  address: string
  chainId: number
  solPrice: number
  ethPrice: number
  bnbPrice: number
  initialPrice: number
}) => {
  const { address, chainId, solPrice, ethPrice, bnbPrice, initialPrice } = options
  if (chainId === ChainIds.Solana) {
    if (address === SOL_ADDRESS) return solPrice
    if (
      address === NATIVE_TOKENS.sol.USDC.address ||
      address === NATIVE_TOKENS.sol.USDT.address ||
      address === NATIVE_TOKENS.sol.USDS.address
    )
      return 1
  }
  if (chainId === ChainIds.Ethereum) {
    if (address === NATIVE_TOKENS.eth.ETH.address || address === NATIVE_TOKENS.eth.WETH.address) return ethPrice
    if (address === NATIVE_TOKENS.eth.USDC.address) return 1
  }
  if (chainId === ChainIds.Arbitrum) {
    if (address === NATIVE_TOKENS.arb.ETH.address || address === NATIVE_TOKENS.arb.WETH.address) return ethPrice
    if (address === NATIVE_TOKENS.arb.USDC.address) return 1
  }
  if (chainId === ChainIds.Bsc) {
    if (address.toLowerCase() === NATIVE_TOKENS.bsc.BNB.address.toLowerCase() || address.toLowerCase() === NATIVE_TOKENS.bsc.WBNB.address.toLowerCase()) return bnbPrice
    return 1
  }
  return initialPrice
}

export const useNativeTokenPrice = (address: string, chainId: number, initialPrice: number) => {
  const { solPrice, ethPrice, bnbPrice } = usePrices()

  return useMemo(() => {
    return getNativeTokenPrice({
      address,
      chainId,
      solPrice,
      ethPrice,
      bnbPrice,
      initialPrice,
    })
  }, [initialPrice, address, chainId, ethPrice, solPrice])
}
