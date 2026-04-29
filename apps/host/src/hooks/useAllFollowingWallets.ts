import { useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import { useMemo } from 'react'
import { RootState, useAppSelector } from '@/redux/store'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'

export const useAllFollowingWallets = () => {
  const { data } = useGetTotalFollowings()
  const allFollowingWallets = useMemo(() => data?.map((item) => item?.address), [data])
  const selectedItems = useAppSelector(
    (state: RootState) => (state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType).address,
  )
  const normalizedSelectedItems = useMemo(() => {
    if (!selectedItems || selectedItems?.length === 0) {
      return allFollowingWallets
    }
    const items = selectedItems.filter((item) => allFollowingWallets?.includes(item))
    if (items.length === 0) {
      return allFollowingWallets
    }
    return items
  }, [selectedItems, allFollowingWallets])

  return {
    normalizedSelectedItems,
    allFollowingWallets,
    data,
  }
}
