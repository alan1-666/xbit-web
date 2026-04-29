import { useMemo } from 'react'
import { useAppSelector } from '@/redux/store'
import { useNativeTokenPrice } from '@hooks/useNativeTokenPrice.ts'
import { useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import FormatedValue from '@components/common/FormatedValue.tsx'
import { cn } from '@/lib/utils.ts'

type NetInFlowColumnProps = {
  value?: number
  className?: string
}

const NetInFlowColumn = ({ value, className }: NetInFlowColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenPrice = useNativeTokenPrice()
  const nativeTokenSymbol = useNativeTokenSymbol()

  const displayUnit = useMemo(() => {
    if (dataUnit === 'USD') return '$'
    return nativeTokenSymbol
  }, [dataUnit, nativeTokenSymbol])

  const handleTextColor = () => {
    if (value === undefined || Number(value) === 0) {
      return '!text-[#FFFFFFB2]'
    }
    if (value > 0) {
      return '!text-rise'
    }
    if (value < 0) {
      return '!text-fall'
    }
    return '!text-[#FFFFFFB2]'
  }

  return (
    <FormatedValue
      value={dataUnit === 'USD' ? Number(value) : Number(value) / nativeTokenPrice}
      unit={displayUnit}
      position={dataUnit === 'USD' ? 'front' : 'back'}
      maxMeaningfulDigits={2}
      roundType={'ceil'}
      className={cn(className, handleTextColor())}
      hasSpace
    />
  )
}

export default NetInFlowColumn
