import { APP_PATH } from '@/lib/constant.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { getSmartMoneyInfo } from '@/services/copytrade.service'
import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { useQuery } from '@apollo/client'
import LogoXBit from '@components/header/LogoXBit.tsx'
import { IconSettings } from '@components/icon/stroke/IconSettings.tsx'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { CopyButton } from '../common/copy-button'
import Text from '../common/Text'
import AccountOverview from '../common/AccountOverview'

export const SettingsDrawerHeader = () => {
  const navigate = useNavigateWithLocation()
  const { t } = useTranslation()
  const navigateToSystemSettings = () => {
    navigate(APP_PATH.MEME_SETTINGS_SYSTEM_SETTINGS)
  }

  const activeWallet = useSelector(_activeWallet)
  const { email } = useAppSelector((state) => state.newWallet)

  const { data, refetch } = useQuery(getSmartMoneyInfo, {
    variables: { req: { address: activeWallet?.walletAddress, chain: 'SOLANA' } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      refetch()
    }
  }, [activeWallet?.walletAddress])

  return (
    <div className="flex justify-between">
      {!activeWallet.isConnected ? (
        <LogoXBit />
      ) : (
        <div className="flex gap-2.5">
          <AccountOverview />
        </div>
      )}

      <button className="text-white flex items-center gap-1.5" onClick={navigateToSystemSettings}>
        <IconSettings className="size-5.5" />
      </button>
    </div>
  )
}
