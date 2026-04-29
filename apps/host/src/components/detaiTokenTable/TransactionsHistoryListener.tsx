import { useRealtimeTransactionsListener } from '@hooks/useRealtimeTransactions.tsx'
import { useParams } from 'react-router-dom'
import { useMemo } from 'react'

export const TransactionsHistoryListener = () => {
  const params = useParams()
  const tokenAddress = useMemo(() => params.address ?? '', [params.address])
  useRealtimeTransactionsListener(tokenAddress)
  return null
}
