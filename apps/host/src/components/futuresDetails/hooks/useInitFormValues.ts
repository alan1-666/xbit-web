import { useEffect, useRef } from 'react'
import { formatSize } from '@/components/futuresDetails/trade/tools'
import { MathFun } from '@/lib/utils'
import { xPositions } from '@/components/futuresDetails/trade/types.ts'

interface UseInitFormValuesParams {
  open: boolean
  info: xPositions
  currency: string
  szMap: Record<string, number>
  symbolPrice: number
  reset: (values: Record<string, any>) => void
  handleSliderChange: (v: number[]) => void
  maxValue: number
  fields?: {
    tpPrice?: boolean
    slPrice?: boolean
  }
}

export const useInitFormValues = ({
  open,
  info,
  currency,
  szMap,
  symbolPrice,
  reset,
  handleSliderChange,
  maxValue,
  fields = {},
}: UseInitFormValuesParams) => {
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (open && !hasInitializedRef.current) {
      const rawSize = Number(info.szi || 0)
      let defaultSize = rawSize

      if (currency === 'USDC') {
        defaultSize = MathFun.mul(rawSize, symbolPrice)
      }

      const formattedSize = formatSize(defaultSize, currency === 'USDC' ? 2 : szMap[info.coin])

      const initialValues: Record<string, any> = {
        size: formattedSize,
      }

      if (fields.tpPrice) {
        initialValues.tpPrice = info.tpPrice || ''
      }
      if (fields.slPrice) {
        initialValues.slPrice = info.slPrice || ''
      }

      reset(initialValues)

      const percent = maxValue === 0 ? 0 : Math.min((Number(formattedSize) / maxValue) * 100, 100)
      handleSliderChange([Math.floor(percent)])

      hasInitializedRef.current = true
    }

    if (!open) {
      hasInitializedRef.current = false
    }
  }, [open, info, currency, szMap, symbolPrice, reset, handleSliderChange, maxValue, fields])
}
