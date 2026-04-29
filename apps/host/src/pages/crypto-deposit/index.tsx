import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useEffect } from 'react'
import SwapForm from '@/components/swap/SwapForm'

const Deposit = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLogin = useCheckLoginOnArb()

  const location = useLocation()
  const isFuturesPage = location.pathname.includes('futures') || location.search.includes('futures') || location.search.includes('overview') || location.search === ''

  useEffect(() => {
    if (!isLogin) {
      navigate('/futures/assets')
    }
  }, [isLogin])

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white">
      <HeaderWithBack title={t('assets.transfer')} className="justify-center bg-transparent" titleClassName="ml-0" />
      <div className="px-5">
        <SwapForm isFromMeme={!isFuturesPage} />
      </div>
    </div>
  )
}

export default Deposit
