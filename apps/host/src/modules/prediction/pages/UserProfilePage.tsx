import { TooltipProvider } from '@/components/ui/tooltip'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { useParams, useSearchParams } from 'react-router-dom'
import { UserProfileContent } from '../components/profile/UserProfileContent'
import { UserProfileOverview } from '../components/profile/UserProfileOverview'
import { UserProfileProvider } from '../context/UserProfileContext'

import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const UserProfilePage = () => {
  const { t } = useTranslation()
  const { userId } = useParams()
  const { isDesktop } = useResponsive()
  const [searchParams] = useSearchParams()
  const isActivityTab = searchParams.get('tab') === 'activity'
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <UserProfileProvider userId={userId}>
      <TooltipProvider>
        <div className="flex w-full flex-col items-center">
          {!isDesktop && (
            <div className="sticky top-0 z-30 bg-[#0a0a0a] w-full px-4">
              <HeaderWithBack
                title={t('prediction.profile.holderDetail')}
                className="bg-[#0a0a0a] px-0 pt-3 pb-3"
                titleClassName="truncate text-center text-base font-light"
                onBack={handleBack}
              />
            </div>
          )}
          <div className={cn('mb-2 flex w-full flex-col gap-4 px-4', isActivityTab && 'pb-0', isDesktop && 'pt-4')}>
            <UserProfileOverview userId={userId} />
            <UserProfileContent />
          </div>
        </div>
      </TooltipProvider>
    </UserProfileProvider>
  )
}
