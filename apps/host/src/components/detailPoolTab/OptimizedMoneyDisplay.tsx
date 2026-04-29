import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatAmount } from '@/lib/format'
import { UserSettingsState } from '@/redux/modules/userSettings.slice'
import { useAppSelector } from '@/redux/store'
import { useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { memo } from 'react'

interface OptimizedMoneyDisplayProps {
  usdValue: number
  className?: string
}

const OptimizedMoneyDisplay = memo(({ usdValue, className = '' }: OptimizedMoneyDisplayProps) => {
  const { dataUnit } = useAppSelector((state) => state.userSettings as UserSettingsState)
  const nativeTokenPrice = useNativeTokenPrice()
  const nativeTokenSymbol = useNativeTokenSymbol()

  const getDisplayValue = () => {
    if (dataUnit === 'SOL') {
      const nativeValue = usdValue / nativeTokenPrice
      return formatAmount(nativeValue, { unit: nativeTokenSymbol })
    }
    return formatAmount(usdValue, { showCurrency: true })
  }

  return <span className={className}>{getDisplayValue()}</span>
})

OptimizedMoneyDisplay.displayName = 'OptimizedMoneyDisplay'

export default OptimizedMoneyDisplay
