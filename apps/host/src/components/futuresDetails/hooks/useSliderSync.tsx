import { useEffect, useState, useMemo, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { MathFun, fixNumber } from '@/lib/utils'

interface UseSliderSyncProps {
  methods: UseFormReturn<any>
  fieldName: string
  szDecimals: number
  currency: string
  positionSize: number 
  price: number
}

export const useSliderSync = ({
  methods,
  fieldName,
  szDecimals,
  currency,
  positionSize,
  price,
}: UseSliderSyncProps) => {
  const { watch, setValue } = methods
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const lastSliderValue = useRef<number>(0)

  const maxValue = useMemo(() => {
    if (!positionSize || !price) return 0
    return currency === 'USDC'
      ? MathFun.mul(positionSize, price)
      : positionSize
  }, [currency, positionSize, price])

  useEffect(() => {
    const subscription = watch((values) => {
      const raw = parseFloat(values?.[fieldName] ?? '0')
      const clamped = Math.max(0, Math.min(raw, maxValue))
      const percentage = maxValue === 0 ? 0 : Math.round((clamped / maxValue) * 100)
      
      // setSliderValue([percentage])
    })
    return () => subscription.unsubscribe()
  }, [watch, fieldName, maxValue])

  useEffect(() => {
    const raw = parseFloat(watch(fieldName) ?? '0')
    const clamped = Math.max(0, Math.min(raw, maxValue))
    const percentage = maxValue === 0 ? 0 : Math.round((clamped / maxValue) * 100)
    // setSliderValue([percentage])
  }, [currency, positionSize, price, watch, fieldName, maxValue])

  const handleSliderChange = (val: number[]) => {
    setSliderValue(val)
    const calculated = MathFun.mul(MathFun.div(val[0], 100), maxValue)
    const size = szDecimals !== undefined ? fixNumber(calculated, szDecimals) : calculated
    setValue(fieldName, size.toString())

  }

  return {
    sliderValue,
    handleSliderChange,
    setSliderValue
  }
}
