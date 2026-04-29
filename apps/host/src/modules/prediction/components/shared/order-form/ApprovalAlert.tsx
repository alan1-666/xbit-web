import { useUSDCAllowance } from '@/modules/prediction/hooks/useUSDCAllowance.ts'
import { useApproveUSDC } from '@/modules/prediction/hooks/useApproveUSDC.ts'
import { Button } from '@components/ui/button.tsx'

export const ApprovalAlert = () => {
  const { data: allowanceData } = useUSDCAllowance()
  const isApproved = !!allowanceData?.allowanceUSDC && allowanceData.allowanceUSDC > 0
  const proxyWallet = allowanceData?.proxyWallet
  const { mutate, isPending } = useApproveUSDC()
  const handleApprove = () => {
    mutate()
  }

  if (isApproved || !proxyWallet) return null
  return (
    <div className="w-full flex items-center justify-between gap-2 border border-[#79778C]/16 rounded-[8px] p-2">
      <div className="text-[#908E98] text-xs">Contract approvals are required to trade on this market.</div>
      <Button
        className="bg-[#2B2B33] text-white rounded-[6px] text-xs font-medium"
        disabled={isPending}
        onClick={handleApprove}
        isLoading={isPending}
        type="button"
      >
        Approve
      </Button>
    </div>
  )
}
