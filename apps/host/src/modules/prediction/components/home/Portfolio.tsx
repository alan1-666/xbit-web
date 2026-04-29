import { Loader } from '@components/common/MoneyFormatted.tsx'
import { formatAmount } from '@/lib/format.ts'
import { useMyBalance } from '@/modules/prediction/hooks/useMyBalance.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

const Value = (props: { amount: number; isLoading: boolean }) => {
  const { amount, isLoading } = props
  const proxyWallet = useProxyWallet()
  if (!proxyWallet) {
    return '$0.00'
  }
  return isLoading ? <Loader /> : formatAmount(amount, { showCurrency: true })
}

export const Portfolio = () => {
  const { totalBalance, usdcBalance, isPending, isBalancePending } = useMyBalance()
  return (
    <div className="grid grid-cols-2 gap-2 mb-3 md:gap-4 md:mb-2">
      <div className="text-center">
        <div className="text-xs text-gray-400 md:text-sm">Portfolio</div>
        <div className="text-sm font-semibold text-white md:text-base">
          <Value amount={totalBalance || 0} isLoading={isPending} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400 md:text-sm">Cash</div>
        <div className="text-sm font-semibold text-white md:text-base">
          <Value amount={usdcBalance || 0} isLoading={isBalancePending} />
        </div>
      </div>
    </div>
  )
}
