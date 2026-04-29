import type { FundingRecord } from '@/components/assets/overview/TabFundingRecords'
import { clearTxDetail, selectTxDetail, setTxDetail } from '@/redux/modules/txDetail.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useCallback } from 'react'

export const useTxDetail = () => {
  const dispatch = useAppDispatch()
  const txDetail = useAppSelector(selectTxDetail)

  const openTxDetail = useCallback(
    (record: FundingRecord | null) => {
      dispatch(setTxDetail(record))
    },
    [dispatch],
  )

  const closeTxDetail = useCallback(() => {
    dispatch(clearTxDetail())
  }, [dispatch])

  return { txDetail, openTxDetail, closeTxDetail }
}
