import { cn } from '@/lib/utils.ts'
import FormatedValue from '@components/common/FormatedValue.tsx'
import MoneyFormatted from '../common/MoneyFormatted'
import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
// removed unused helpers import

type TwoValueWithSubColumnProps = {
  upperValue?: number
  lowerValue?: number
  upperUnit?: string
  lowerUnit?: string
  upperUnitPosition?: 'front' | 'back'
  lowerUnitPosition?: 'front' | 'back'
  upperMaxDecimal?: number
  lowerMaxDecimal?: number
  upperValueClassName?: string
  lowerValueClassName?: string
  isPnL?: boolean
  roundType?: 'ceil' | 'floor'
  upperHasSpace?: boolean
  lowerHasSpace?: boolean
  moneyFormatted?: boolean
  txCount?: number,
  isVerySmallValue?: boolean
  customColorUpperValue?: string
}
const TwoValueWithSubColumn = ({
  upperValue,
  lowerValue,
  upperValueClassName,
  lowerValueClassName,
  upperMaxDecimal = 6,
  lowerMaxDecimal = 6,
  upperUnit,
  upperUnitPosition,
  lowerUnit,
  lowerUnitPosition,
  upperHasSpace = true,
  lowerHasSpace = true,
  isPnL = false,
  roundType,
  moneyFormatted = false,
  txCount = undefined,
  isVerySmallValue = false,
  customColorUpperValue,
}: TwoValueWithSubColumnProps) => {
  const {isDesktop} = useResponsive()
  const handleRenderColumn = () => {
    // if (!upperValue || !lowerValue || !isFinite(upperValue) || !isFinite(lowerValue)) {
    //   return <div className="text-[#FFFFFF] text-[13px] leading-[1]">--</div>
    // }

    const handleTextPnLColor = () => {
      if (isPnL && upperValue) {
        if (upperValue === 0 || !isFinite(upperValue)) return 'text-[#FFFFFFB2]'
        if (upperValue > 0) return 'text-rise'
        return 'text-fall'
      }
      return 'text-[#FFFFFFB2]'
    }
    // If both will render default in MoneyFormatted (isShort treats 0 as default), show only one default
    if (moneyFormatted) {
      const upperDefaults = upperValue === undefined || upperValue === null || !isFinite(Number(upperValue)) || Number(upperValue) === 0
      const lowerDefaults = lowerValue === undefined || lowerValue === null || !isFinite(Number(lowerValue)) || Number(lowerValue) === 0
      if (upperDefaults && lowerDefaults) {
        return (
          <div className="text-[#FFFFFFB2] text-[13px] leading-[1] w-full text-left">
            <MoneyFormatted isShort value={0} defaultValue='0' unit={upperUnit} className={cn(handleTextPnLColor(), upperValueClassName)} />
          </div>
        )
      }
    }

    if ((!upperValue && !lowerValue) || (!isFinite(upperValue || 0) && !isFinite(lowerValue || 0)) || (upperValue === 0 && lowerValue === 0) || isNaN(upperValue!) && isNaN(lowerValue!)) {
      return (
        <div className="text-[#FFFFFFB2] text-[13px] leading-[1] w-full text-left">
          {/* {upperUnitPosition === 'front' ? `${upperUnit}0` : `0${upperUnit}`} */}
          {
            moneyFormatted ? <MoneyFormatted isShort value={0} defaultValue='0' unit={upperUnit} className={cn(handleTextPnLColor(), upperValueClassName)} /> : upperUnitPosition === 'front' ? `${upperUnit}0` : `0${upperUnit}`
          }
        </div>
      )
    }

    return (
      <>
        <div className={cn("whitespace-nowrap", upperValueClassName)}>
          {
            moneyFormatted ? <MoneyFormatted isShort value={upperValue} unit={upperUnit} className={cn(upperValueClassName, handleTextPnLColor(), customColorUpperValue)} defaultValue='0' /> : <FormatedValue
              value={upperValue ?? 0}
              unit={upperUnit}
              position={upperUnitPosition}
              maxMeaningfulDigits={upperMaxDecimal}
              className={cn(handleTextPnLColor(), upperValueClassName)}
              roundType={roundType}
              hasSpace={upperHasSpace}
              isShowVerySmall={isVerySmallValue}
            />
          }

        </div>
        <div className={cn("whitespace-nowrap flex items-center", lowerValueClassName)}>
          {
            moneyFormatted ? <MoneyFormatted isShort value={lowerValue} unit={lowerUnit} className={cn(lowerValueClassName, handleTextPnLColor())} isUnitSpace={false} /> : <FormatedValue
              value={lowerValue ?? 0}
              unit={lowerUnit}
              position={lowerUnitPosition}
              maxMeaningfulDigits={lowerMaxDecimal}
              className={cn(handleTextPnLColor(), lowerValueClassName)}
              roundType={roundType}
              hasSpace={lowerHasSpace}
            />
          }
          {
            isDesktop && Number(txCount) >= 0 && (
              <div className={cn(handleTextPnLColor(), lowerValueClassName, 'ml-0.5')}>
                {`/ ${txCount} TXs`}
              </div>
            )
          }
        </div>
      </>
    )
  }

  return (
    <div className={cn("flex flex-col items-start justify-center", isDesktop ? 'gap-1.5' : 'gap-1')}>
      {handleRenderColumn()}
    </div>
  )
}

export default TwoValueWithSubColumn
