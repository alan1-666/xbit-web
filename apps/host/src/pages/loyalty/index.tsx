import { Language } from '@/@generated/gql/graphql-loyalty'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { LoyaltyProvider, useLoyalty } from '@/components/loyalty/context/LoyaltyContext'
import SkeletonLoyalty from '@/components/loyalty/SkeletonLoyalty'
import { useResponsive } from '@/hooks/useResponsive'
import { NotLoggedIn } from '@components/loyalty/NotLoggedIn.tsx'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { SeasonEnd } from '@components/loyalty/SeasonEnd.tsx'
import { SeasonInProgress } from '@components/loyalty/SeasonInProgress.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'

const LoyaltyPageContent = () => {
  const { seasonStatus, isLoading } = useLoyalty()

  if (isLoading) {
    return <SkeletonLoyalty />
  }

  if (seasonStatus.isEnded) {
    return <SeasonEnd />
  }

  return <SeasonInProgress />
}

export const LoyaltyPage = () => {
  const activeWallet = useActiveWallet()
  const { isDesktop } = useResponsive()
  const { i18n, t } = useTranslation()
  const enabled = useFeatureIsOn('show_loyalty')
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled) {
      isDesktop ? navigate(APP_PATH.FUTURES) : navigate(APP_PATH.FUTURES_DISCOVER)
    }
  }, [enabled, navigate])

  return (
    <LoyaltyProvider lang={i18n?.language as Language}>
      <>
        {!isDesktop && <HeaderWithBack title={t('header.points')} className="bg-[#0a0a0a] sticky top-0 z-50" />}
        {!activeWallet.isConnected ? <NotLoggedIn /> : <LoyaltyPageContent />}
      </>
    </LoyaltyProvider>
  )
}
