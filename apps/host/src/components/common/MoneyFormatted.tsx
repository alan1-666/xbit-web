import useTokenPrice, { useTokenPriceOneTime } from '@/hooks/useTokenPrice'
import { SOL_ADDRESS } from '@/lib/blockchain'
import { cn } from '@/lib/utils'
import { store, useAppSelector } from '@/redux/store'
import { formatTokenPrice, isNumber } from '@/utils/helpers'
import { f } from 'fintech-number'
import { isInteger } from 'lodash-es'
import React, { FC, JSX, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
/**
 * Props for the MoneyFormatted component
 * @interface MoneyFormattedProps
 * @extends {React.HTMLAttributes<HTMLSpanElement>}
 */
interface MoneyFormattedProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The value to be formatted */
  value?: number | string | null | undefined
  /** Currency unit or custom React node to display before the value */
  unit?: string | React.ReactNode
  /** Optional className for styling the unit element */
  unitClassName?: React.HTMLAttributes<HTMLSpanElement>['className']
  /** Whether to show the currency unit */
  showUnit?: boolean
  /** Round type */
  roundType?: 'round' | 'floor' | 'ceil'
  /** wallet address */
  wallet?: string
  /** unit is USD */
  isUSD?: boolean
  /** Callback function to handle value changes */
  callback?: (price: number, priceSol: number) => string
  callbackClassName?: (value: number) => string
  loading?: boolean
  isShort?: boolean
  defaultValue?: string
  isAbs?: boolean
  isAllowZero?: boolean
  decimal?: number
  isUnitSpace?: boolean
  noSpace?: boolean
}

const l3 = keyframes`
  20% { background-position: 0% 0%, 50% 50%, 100% 50%; }
  40% { background-position: 0% 100%, 50% 0%, 100% 50%; }
  60% { background-position: 0% 50%, 50% 100%, 100% 0%; }
  80% { background-position: 0% 50%, 50% 50%, 100% 100%; }
`

export const Loader = styled.div`
  width: 20px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #fff 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: ${l3} 1s infinite linear;
`

const LoadingMoneyFormatted: FC = () => {
  return <Loader />
}

const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']

/**
 * Formats and displays monetary values with proper formatting
 *
 * Features:
 * - Displays currency unit
 * - Formats numbers with thousands separators
 * - Handles decimal parts with special formatting for small numbers
 * - Shows placeholder when value is invalid
 *
 * @param {MoneyFormattedProps} props - Component props
 * @returns {JSX.Element} Formatted monetary value
 */
const MoneyFormatted: FC<MoneyFormattedProps> = ({
  value,
  unit = '$',
  unitClassName,
  showUnit = true,
  roundType = 'round',
  loading = false,
  isShort = false,
  defaultValue = '--',
  isAbs = false,
  isAllowZero = false,
  decimal = 2,
  isUnitSpace = true,
  noSpace,
  ...rest
}: MoneyFormattedProps): JSX.Element => {
  const isNegative = parseFloat(String(value) || '0') < 0
  const valueNumbered = Math.abs(Number(value)) // Convert value to a number and ensure it's positive
  // Return placeholder for invalid numbers
  if (!isNumber(valueNumbered) || value === null || value === undefined)
    return (
      <span {...rest} className={cn(isShort ? 'flex flex-nowrap' : '', rest.className)} {...rest}>
        {defaultValue}
      </span>
    )

  const moneyFormatted = formatTokenPrice(valueNumbered, {
    roundType,
  })

  return loading ? (
    <LoadingMoneyFormatted />
  ) : (
    <span {...rest} className={cn(isShort ? 'flex flex-nowrap overflow-hidden' : '', rest.className)}>
      {isNegative && !isAbs && <span>-</span>}
      {showUnit && unit === '$' && <span className={unitClassName}>{unit}</span>}
      {isShort ? (
        <span className="text-nowrap">
        {formatNumberShort(isAbs ? Math.abs(Number(value)) : value, {
          defaultValue,
          roundType,
          isAllowZero,
          decimal,
          isUnitSpace: true,
        })}
        </span>
      ) : (
        <span>
          {f(+moneyFormatted.integerPart)}
          {!!moneyFormatted.decimalPart && (
            <>
              .
              {moneyFormatted.zeroCount > 0 && (
                <span>
                  0<span className="inline-block text-[70%] translate-y-[15%]">{moneyFormatted.zeroCount}</span>
                </span>
              )}
              {moneyFormatted.decimalPart.replace(/0+$/, '')}
            </>
          )}
          {moneyFormatted.unit}
        </span>
      )}
      {/* Display the integer part with formatting */}
      {!noSpace && showUnit && unit !== '$' && (
        <span className={cn('text-nowrap', unitClassName)}>
          {isUnitSpace ? '\u00A0' : ' '}
          {unit}
        </span>
      )}
      {noSpace && showUnit && unit !== '$' && <span className={unitClassName}>{unit}</span>}
    </span>
  )
}

/**
 * Format number short
 * @param value : number | string
 * x <= 0.00001 (with at least 4 zeros after the decimal point): 0.0(6)3999, take up to 4 digits after the last 0
 * 1 > x > 0.00001: Take up to 4 digits after the last 0 (for example 0.0001914793842 then take 0.0001914)
 * 10k > x >= 1: display all, with a comma separating the thousands, with 2 digits after the decimal point (eg 9,306.65)
 * >= 10k: Use the characters K, M,... with 2 digits after the decimal point (eg `200.91K`, `2.09M`)
 */
type TConfigFormatNumberShort = {
  defaultValue?: string
  roundType?: 'round' | 'floor' | 'ceil'
  isShowUnit?: boolean
  unit?: string
  isUnitSpace?: boolean
  decimal?: number
  isAllowZero?: boolean
}

export function formatNumberShort(
  value: number | string | undefined,
  config: TConfigFormatNumberShort = {
    defaultValue: '--',
    roundType: 'round',
    isShowUnit: true,
    unit: '',
    isUnitSpace: true,
    decimal: 2,
    isAllowZero: false,
  },
): React.ReactNode {
  const { defaultValue, roundType, isShowUnit, unit, decimal, isAllowZero, isUnitSpace } = config
  const _str = `${defaultValue}${isShowUnit ? `${isUnitSpace ? '\u00A0' : ''}${unit}` : ''}`
  if (value === undefined) return _str
  const num = Math.abs(typeof value === 'string' ? parseFloat(value) : value)
  if (isNaN(num)) return _str
  if (isAllowZero && num === 0) return '0'
  const absNum = Math.abs(num)
  // Case 1: x <= 0.00001
  if (absNum > 0 && absNum <= 0.0001) {
    const moneyFormatted = formatTokenPrice(num, {
      roundType,
    })

    return (
      <span className="flex whitespace-nowrap">
        {moneyFormatted.integerPart}
        {!!moneyFormatted.decimalPart && (
          <>
            .
            {moneyFormatted.zeroCount > 0 && (
              <span>
                0<span className="inline-block text-[70%] translate-y-[15%] px-[1px]">{moneyFormatted.zeroCount}</span>
              </span>
            )}
            {moneyFormatted.decimalPart.replace(/0+$/, '')}
          </>
        )}
      </span>
    )
  }

  // Case 2: 1 > x > 0.0001: Take up to 4 digits after the last 0 (rounded)
  else if (absNum < 1 && absNum > 0.0001) {
    const str = num.toString()
    const decimals = str.split('.')[1] || ''
    let lastZeroIdx = -1
    for (let i = 0; i < decimals.length; i++) {
      if (decimals[i] === '0') lastZeroIdx = i
      else break
    }
    const cutoff = lastZeroIdx >= 0 ? lastZeroIdx + 5 : 6
    return '0.' + decimals.slice(0, cutoff).replace(/0+$/, '') || '0'
  }

  // Case 3: 10k > x >= 1: comma and 2 decimals
  else if (absNum >= 1 && absNum < 10000) {
    return isInteger(Number(num.toFixed(decimal)))
      ? num.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: decimal,
        })
  } else if (absNum >= 10000) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']
    let tier = Math.floor(Math.log10(absNum) / 3)
    tier = Math.min(tier, suffixes.length - 1)

    const scale = Math.pow(10, tier * 3)
    const scaled = absNum / scale
    const formatted = scaled.toLocaleString('en-US', {
      maximumFractionDigits: decimal,
    })

    return `${formatted}${suffixes[tier]}`
  }

  // Case 4: >= 10k: K/M/B/T/Q notation
  // const units = [
  //   { value: 1e18, symbol: 'Q' },
  //   { value: 1e15, symbol: 'T' },
  //   { value: 1e9, symbol: 'B' },
  //   { value: 1e6, symbol: 'M' },
  //   { value: 1e3, symbol: 'K' },
  // ];
  // for (const { value, symbol } of units) {
  //   if (absNum >= value * 10) {
  //     return (num / value).toFixed(2) + symbol;
  //   }
  // }

  return parseFloat(`${num}`) == 0 ? _str : `${num} ${isShowUnit ? `${isUnitSpace ? '\u00A0' : ''}${unit}` : ''}`
}
/**
 * Real-time money formatting component
 * default will use SOL_ADDRESS to fetch the price and return the formatted value price * value input
 * @returns Formatted monetary value
 */
export const MoneyFormattedRealtime: FC<MoneyFormattedProps> = ({
  value = 1,
  wallet = SOL_ADDRESS,
  callback,
  ...rest
}): JSX.Element => {
  const price = useTokenPrice(wallet)
  // const priceSOL = useTokenPrice(SOL_ADDRESS);
  const priceSOL = useAppSelector((state) => state?.price?.list['SOL'] || 0)
  return <MoneyFormatted value={callback ? callback(price, priceSOL) : Number(value) * price} {...rest} />
}

/**
 * MoneyFormatOneTime is a component that formats a single monetary value
 */
export const MoneyFormattedOneTime: FC<MoneyFormattedProps> = ({
  value = 1,
  wallet = SOL_ADDRESS,
  isUSD = true,
  callback,
  ...rest
}) => {
  const isFirstRender = useRef(true)
  const [price, setPrice] = useState<number>(0)
  // const [priceSOL, setPriceSOL] = useState<number>(0);
  const priceSOL = store.getState()?.price?.list['SOL'] || 0

  const priceToken = wallet === SOL_ADDRESS ? priceSOL : useTokenPriceOneTime(wallet)
  // const priceTokenSOL = useTokenPriceOneTime(SOL_ADDRESS);
  useEffect(() => {
    if (isFirstRender.current && priceToken) {
      isFirstRender.current = false
      // Set the price only on the first render
      setPrice(priceToken)
      // setPriceSOL(priceTokenSOL);
    }
    //if isFirstRender is false, it means the price has been set already is unsubscribed
  }, [priceToken])
  // get price one time
  return <MoneyFormatted value={callback ? callback(price, priceSOL) : Number(value) * price} {...rest} />
}

/**
 * MoneyRealtimeProfit return boolean value of the price of the token
 * @param param0
 * @returns
 */

export const MoneyRealtimeProfit: FC<{
  className?: string
  wallet?: string
  isUSD?: boolean
  callback: (value: number, valueSOL: number) => string
}> = ({ className = '', wallet = SOL_ADDRESS, callback }) => {
  const price = useTokenPrice(wallet)
  const priceSOL = useAppSelector((state) => state?.price?.list['SOL'] || 0)
  return <span className={cn('', className)}>{callback(price, priceSOL)}</span>
}

export const MoneyRealtimeWrapper: FC<{
  className?: string
  wallet?: string
  callbackClassName: (value: number, valueSOL: number) => string
  children?: React.ReactNode
}> = ({ className = '', wallet = SOL_ADDRESS, callbackClassName, children }) => {
  const price = useTokenPrice(wallet)
  const priceSOL = useAppSelector((state) => state?.price?.list['SOL'] || 0)

  return <span className={cn(className, callbackClassName ? callbackClassName(price, priceSOL) : '')}>{children}</span>
}

export default MoneyFormatted
