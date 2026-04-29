import HeaderWithBack from '@/components/header/HeaderWithBack'
import { NewArrowLeftIcon } from '@/components/icon'
import { IconSettings } from '@/components/icon/stroke/IconSettings'
import { APP_PATH } from '@/lib/constant'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import AccountInfo from './AccountInfo'
import FeatureList from './FeatureList'
import { useNavigateWithLocation } from '@/hooks/useNavigateWithLocation'
import { useLocation } from 'react-router-dom'

const PersonalCenterPage = () => {
  const navigate = useNavigateWithLocation()
  const location = useLocation()

  const navigateToSystemSettings = () => {
    navigate(APP_PATH.MEME_SETTINGS_SYSTEM_SETTINGS, {
      callbackState: { root: location.state.from },
    })
  }

  return (
    <div className="h-full">
      <HeaderWithBack
        title={''}
        customIconLeft={<NewArrowLeftIcon className="stroke-white" />}
        className={cn('justify-center bg-transparent top-0 left-0 right-0  mx-auto h-11 py-2.5')}
        titleClassName="ml-0"
        right={
          <div className="w-full flex justify-end">
            <IconSettings onClick={navigateToSystemSettings} className="size-6" />
          </div>
        }
        backHref={location?.state?.root}
      />
      <AccountInfo />
      <FeatureList />
    </div>
  )
}

export default PersonalCenterPage
