import { useCallback } from 'react'
import { formatSize } from '@/components/futuresDetails/trade/tools'
import { MathFun } from '@/lib/utils'

interface Params {
  currency: string
  setCurrency: (val: string) => void
  szMap: Record<string, number>
  symbolPrice: number
  watch: (field: string) => any
  setValue: (field: string, value: any) => void
  coin: string
}

export const useCurrencySwitch = ({
  currency,
  setCurrency,
  szMap,
  symbolPrice,
  watch,
  setValue,
  coin,
}: Params) => {
  const handleCurrencyChange = useCallback(
    (val: string) => {
      const currentSize = Number(watch('size') || 0)
      if (!symbolPrice || currentSize <= 0 || !val || val === currency) {
        setCurrency(val)
        return
      }

      const oldCurrency = currency
      const newCurrency = val

      let newSize = currentSize

      if (oldCurrency !== 'USDC' && newCurrency === 'USDC') {
        newSize = currentSize * symbolPrice
      }

      if (oldCurrency === 'USDC' && newCurrency !== 'USDC') {
        newSize = currentSize / symbolPrice
      }

      const decimalPlaces = newCurrency === 'USDC' ? 2 : szMap[coin]
      newSize = Number(formatSize(newSize, decimalPlaces))

      setCurrency(newCurrency)
      console.log('newCurrency: ', {newCurrency, newSize})
      setValue('size', newSize.toString())
    },
    [currency, symbolPrice, watch, setValue, szMap, coin]
  )

  return { handleCurrencyChange }
}
