import { useAppSelector } from '@/redux/store'
import { useMemo } from 'react'

export const useNativeTokenPrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}
