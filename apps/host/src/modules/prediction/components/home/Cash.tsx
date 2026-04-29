import { Loader } from '@components/common/MoneyFormatted.tsx'
import { formatAmount } from '@/lib/format.ts'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'

export const Cash = () => {
  const { data: usdcBalance, isPending } = useMyUSDCBalance()
  return (
    <div className="text-center">
      <div className="text-xs text-gray-400 md:text-sm">Cash</div>
      <div className="text-sm font-semibold text-white md:text-base">
        {isPending ? <Loader /> : formatAmount(usdcBalance, { showCurrency: true })}
      </div>
    </div>
  )
}
