import { memo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { setDataUnit } from '@/redux/modules/userSettings.slice.ts'
import { cn } from '@/lib/utils'
import { useNativeTokenIcon, useNativeTokenNameByChain } from '@hooks/useNativeTokenNameByChain.ts'
import { getDataUnitByChain } from '@/lib/currency'
import { useActiveChain } from '@/hooks/useActiveChain'

type CurrencyToggleProps = {
  isShowLogo?: boolean
  wrapClassName?: string
}

const CurrencyToggle = memo(({ isShowLogo , wrapClassName }: CurrencyToggleProps) => {
  const dispatch = useAppDispatch()
  const activeChain = useActiveChain()
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeToken = useNativeTokenNameByChain()
  const nativeTokenIcon = useNativeTokenIcon()

  const handleOnClickChangeCurrency = () => {
    if (dataUnit === 'USD') {
      dispatch(setDataUnit(getDataUnitByChain(activeChain)))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }

  return (
    <div
      className={cn("flex items-center gap-1 py-1 px-1.5 rounded-full bg-[#18171E] cursor-pointer select-none", wrapClassName)}
      onClick={handleOnClickChangeCurrency}
    >
      {isShowLogo && (
        <img
          alt="icon currency"
          className="w-4 h-4 border border-[#18171e] rounded-full"
          src={dataUnit === 'USD' ? '/images/icons/iconUsd.svg' : nativeTokenIcon}
        />
      )}
      <span className="app-font-regular text-[10px] leading-[1] w-[20px] text-white text-center">
        {dataUnit === 'USD' ? 'USD' : nativeToken}
      </span>
      <img className="w-4 h-4" src="/images/orderBook/icon-refund.svg" alt="change currency" />
    </div>
  )
})

CurrencyToggle.displayName = 'CurrencyToggle'

export const CurrencyToggleClient = (
  props: React.HTMLAttributes<HTMLButtonElement> & {
    initUnit: 'SOL' | 'USD'
    value?: 'SOL' | 'USD'
    toggleCurrency: (val: 'SOL' | 'USD') => void
  },
) => {
  const { initUnit, value, toggleCurrency, className, ...rest } = props
  const [uncontrolledUnit, setUncontrolledUnit] = useState<'SOL' | 'USD'>(initUnit)

  const currentUnit = value ?? uncontrolledUnit

  const handleOnClickChangeCurrency = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const nextUnit = currentUnit === 'SOL' ? 'USD' : 'SOL'
    if (value === undefined) {
      setUncontrolledUnit(nextUnit)
    }
    toggleCurrency(nextUnit)
  }

  return (
    <button
      type="button"
      className={cn('flex items-center ml-[1px]', className)}
      onClick={handleOnClickChangeCurrency}
      {...rest}
    >
      <span className="font-normal text-[12px] leading-[1] min-w-[20px] mx-[2px] text-[#FFFFFF80] text-center">
        {currentUnit}
      </span>
      <img className="w-4 h-4" src="/images/orderBook/icon-refund.svg" alt="change currency" />
    </button>
  )
}

export default CurrencyToggle
