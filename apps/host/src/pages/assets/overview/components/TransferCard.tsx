import SwapForm from '@/components/swap/SwapForm'
import { useLocation } from 'react-router-dom'

export const TransferCard = () => {
  const location = useLocation()
  const isFuturesPage = location.pathname.includes('futures') || location.search.includes('page=futures') || location.search.includes('page=overview') || location.search === ''
  return (
    <div className="z-[5] relative">
      <SwapForm isFromMeme={!isFuturesPage}/>
    </div>
  )
}
