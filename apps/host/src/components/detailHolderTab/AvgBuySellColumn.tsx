import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { formatDecimalLongValue, handleStringValue } from '@/utils/helpers.ts'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'

type AvgBuySellColumnProps = {
  avgBuyPrice: number
  avgSellPrice: number
}

const AvgBuySellColumn = ({ avgBuyPrice, avgSellPrice }: AvgBuySellColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenPrice = useNativeTokenPrice()

  const { isDesktop } = useResponsive()

  const upperValueString = handleStringValue(
    formatDecimalLongValue(dataUnit !== 'USD' ? avgBuyPrice / nativeTokenPrice : avgBuyPrice),
    avgBuyPrice < 0,
    dataUnit,
  )
  const lowerValueString = handleStringValue(
    formatDecimalLongValue(dataUnit !== 'USD' ? avgSellPrice / nativeTokenPrice : avgSellPrice),
    avgSellPrice < 0,
    dataUnit,
  )

  if (upperValueString === '0' && lowerValueString === '0') {
    return <div className="text-white text-[13px] leading-none w-full text-left">0</div>
  }

  return (
    <>
      <div
        className={cn(
          'whitespace-nowrap',
          'app-font-medium text-[13px] leading-none text-[#CACACA]',
          isDesktop ? 'text-[14px]!' : '',
        )}
      >
        {upperValueString}
      </div>
      <div
        className={cn(
          'whitespace-nowrap',
          'app-font-regular text-[11px] leading-none text-[#605e68]',
          isDesktop ? 'text-[13px]! mt-1.5' : '',
        )}
      >
        {lowerValueString}
      </div>
    </>
  )
}

export default AvgBuySellColumn
