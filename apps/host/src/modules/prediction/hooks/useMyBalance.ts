import { useMyPositionTotalValue } from '@/modules/prediction/hooks/useMyPositionTotalValue.ts'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance.ts'
import { selectActivePendingClaims } from '@/redux/modules/predictionClaimedBalance.slice'
import { useAppSelector } from '@/redux/store'
import { useEffect, useMemo } from 'react'
import { useProxyWallet } from './useProxyWallet'

export const useMyBalance = (skip = false) => {
  const proxyWallet = useProxyWallet()
  const pendingClaimsAll = useAppSelector((state) => selectActivePendingClaims(state, proxyWallet))
  const confirmedClaims = useMemo(() => pendingClaimsAll.filter((c) => c.isConfirmed), [pendingClaimsAll])

  const {
    data: totalPositionValue,
    isPending: isTotalValuePending,
    isLoading: isTotalValueLoading,
  } = useMyPositionTotalValue(skip)

  const { data: usdcBalance, isPending: isBalancePending, isLoading: isBalanceLoading } = useMyUSDCBalance()

  // Amount to adjust (only confirmed claims)
  const confirmedAmountTotal = useMemo(() => {
    return confirmedClaims.reduce((acc, curr) => acc + curr.amount, 0)
  }, [confirmedClaims])

  const adjustedPositionValue = useMemo(() => {
    if (confirmedClaims.length > 0) {
      // Confirmed: apply adjustment (position decreases by claimed amount)
      return Math.max(0, confirmedClaims[0].oldTotalPositionValue - confirmedAmountTotal)
    }
    if (pendingClaimsAll.length > 0) {
      // Waiting for confirm: freeze at old snapshot (no change yet)
      return pendingClaimsAll[0].oldTotalPositionValue
    }
    return totalPositionValue
  }, [totalPositionValue, confirmedClaims, pendingClaimsAll, confirmedAmountTotal])

  const adjustedUsdcBalance = useMemo(() => {
    if (confirmedClaims.length > 0) {
      // Confirmed: apply adjustment (usdc increases by claimed amount)
      return confirmedClaims[0].oldUsdcBalance + confirmedAmountTotal
    }
    if (pendingClaimsAll.length > 0) {
      // Waiting for confirm: freeze at old snapshot (no change yet)
      return pendingClaimsAll[0].oldUsdcBalance
    }
    return usdcBalance
  }, [usdcBalance, confirmedClaims, pendingClaimsAll, confirmedAmountTotal])

  const totalBalance = useMemo(() => {
    if (adjustedPositionValue === undefined || adjustedUsdcBalance === undefined) return undefined
    return +adjustedPositionValue + adjustedUsdcBalance
  }, [adjustedPositionValue, adjustedUsdcBalance])

  const isPending = isTotalValuePending || isBalancePending
  const isLoading = isTotalValueLoading || isBalanceLoading

  // useEffect(() => {
  //   console.table({
  //     adjustedPositionValue,
  //     adjustedUsdcBalance,
  //     totalBalance,
  //     usdcBalance,
  //     totalPositionValue,
  //     pendingClaimsAll,
  //     confirmedClaims,
  //   })
  // }, [adjustedPositionValue, adjustedUsdcBalance, totalBalance, pendingClaimsAll, confirmedClaims])

  return {
    totalBalance,
    totalPositionValue: adjustedPositionValue,
    usdcBalance: adjustedUsdcBalance,
    isPending,
    isLoading,
    isBalancePending,
  }
}
