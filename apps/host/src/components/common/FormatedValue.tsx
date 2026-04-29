import { formatDecimalNumber } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import React from 'react'
import {Loader} from "@components/common/MoneyFormatted.tsx";

type FormatedValueProps = {
  value: number
  unit?: string | React.ReactNode
  position?: 'front' | 'back'
  className?: string
  trailingClassName?: string
  maxMeaningfulDigits?: number
  limitTrailingZeros?: number
  roundType?: 'ceil' | 'floor'
  hasSpace?: boolean
  isShowVerySmall?: boolean
  isMocked?: boolean
  isLoading?: boolean
}

const FormatedValue = ({
  value,
  unit,
  position = 'back',
  className,
  trailingClassName,
  maxMeaningfulDigits = 4,
  limitTrailingZeros = 4,
  roundType = 'floor',
  hasSpace = false,
  isShowVerySmall = false,
  isMocked = false,
  isLoading = false,
}: FormatedValueProps) => {
  const {
    integer,
    trailingZeros,
    decimal,
    suffix,
    isNegative
  } = formatDecimalNumber(value, maxMeaningfulDigits, limitTrailingZeros, roundType)

  const trailingZerosNode =
    trailingZeros && Number(trailingZeros) > 0 ? (
      <span className={cn(className)}>
        0
        <span className={cn('relative top-[3px] text-[9px]', trailingClassName)}>
          {trailingZeros}
        </span>
      </span>
    ) : null

  function trimTrailingZeros(str: string): string {
    const trimmed = str.replace(/0+$/, '')
    return trimmed === '' ? '0' : trimmed
  }

  if (isLoading) {
    return <Loader />
  }

  if (isMocked) {
    return (
      <span className={cn('relative flex items-center app-font-medium text-[11px] leading-[1]', className)}>--</span>
    )
  }

  if (isShowVerySmall && value < 0.01 && value > 0) {
    return (
      <span className={cn('relative flex items-center app-font-medium text-[11px] leading-[1]', className)}>
        {"<"}
        {position === 'front' && unit && <span>{unit}</span>}
        {"0.01"}
        {suffix && <span>{` ${suffix}${hasSpace ? ' ' : ''}`}</span>}
        {position === 'back' && unit && <span>{`${unit}`}</span>}
      </span>
    )
  }

  return (
    <span className={cn('relative flex items-center app-font-medium text-[11px] leading-[1]', className)}>
      {isNegative && '-'}
      {position === 'front' && unit && <span>{unit}</span>}
      {Math.abs(integer)}
      {(decimal || trailingZerosNode) && '.'}
      {trailingZerosNode}
      {decimal && <span>{trimTrailingZeros(decimal?.toString())}</span>}
      {suffix && <span>{` ${suffix}${hasSpace ? ' ' : ''}`}</span>}
      {position === 'back' && unit && <span>{`${unit}`}</span>}
    </span>
  )
}

export default FormatedValue
