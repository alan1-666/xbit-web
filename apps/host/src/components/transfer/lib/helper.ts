import { Address, formatEther, isAddress } from 'viem'
import { getPublicClient } from './clients'
import { TRANSFER_CONFIG } from '../constants'

export const checkArbEth = async (address: Address) => {
  if (isAddress(address)) {
    try {
      const ethBalance = await getPublicClient('arbitrum').getBalance({ address })
      const formattedETHBalance = formatEther(ethBalance)
      const hasArbEth = Number(formattedETHBalance) > TRANSFER_CONFIG.MIN_ARB_ETH

      return hasArbEth
    } catch (error) {
      console.error('Error checking Arbitrum ETH balance:', error)
      return false
    }
  } else {
    return false
  }
}

export const limitDecimalNumber = (value: string, decimals: number) => {
  if(`${value}`.includes('.')) {
    const [integerPart, decimalPart] = `${value}`.split('.')
    if(decimalPart.length > decimals) {
      return integerPart + '.' + decimalPart.slice(0, decimals)
    }
  }
  return value
}