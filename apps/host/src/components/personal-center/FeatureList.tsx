import {
  IconTradeReward,
  IconWalletMoney,
  NewArrowLeftIcon,
  PointsIcon,
  IconExportWallet,
  IconPreferences,
  FundingRateIcon,
  IconClockStroke,
  DocumentIcon,
  CommunityIcon,
  IconShareStroke,
  IconEditStroke,
  DisconnectIcon,
  IconWalletManagement,
  IconOrderConfirm,
} from '@/components/icon'
import { IconTwitter } from '@components/icon/brands/IconTwitter.tsx'
import { IconTelegram } from '@components/icon/brands/IconTelegram.tsx'
import { IconDiscord } from '@/components/icon/brands/IconDiscord'
import { IconEmail } from '@components/icon/brands/IconEmail.tsx'
import { LogoutDialog } from '@/components/settings/LogoutDialog'
import { toast } from 'sonner'
import { APP_PATH } from '@/lib/constant'
// import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SecurityCheckModal, { VefiryWalletResponse } from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import MnemonicBackupChecklistPage from '@components/auth/WalletBackup/MnemonicBackupChecklist.tsx'
import TradeSettingsBottomSheet from '@/components/common/TradeSettingsBottomSheet'
import { ShareXbitDrawer } from '@/components/settings/ShareXbitDrawer'
import { ContactEmailDrawer } from '@components/settings/ContactEmailDrawer.tsx'
import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
// import { TYPE_CHAIN } from '@/lib/blockchain'
// import { useActiveChain } from '@/hooks/useActiveChain'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { Switch } from '@components/ui/switch.tsx'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions,
} from '@/redux/modules/futuresTradePreferences.slice'

interface MenuItem {
  title: string
  icon: React.ReactNode
  onClick?: () => void
  badge?: React.ReactNode
  isInactive?: boolean
  isHidden?: boolean
  right?: React.ReactNode
}

const FeatureList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])
  const [openDrawerBackup, setOpenDrawerBackup] = useState(false)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [openWalletManagement, setOpenWalletManagement] = useState(false)
  const [openEmailDrawer, setOpenEmailDrawer] = useState(false)
  // const activeChain = useActiveChain()
  const enabled = useFeatureIsOn('show_loyalty')
  const { isShowOrderConfirm } = useAppSelector(selectFuturesTradePreferences)
  const dispatch = useAppDispatch()

  const handleIsLoggined = () => {
    if (!activeWallet.isConnected) {
      toast.info(t('appSettings.loginRequired'))
      return false
    }
    return true
  }

  const menuItems: MenuItem[] = [
    {
      title: t('red.packet.lantern.festival.entry'),
      icon: <img className="w-5 h-5" src="/images/icons/h5-navbar-redpacket-icon.png" alt="h5-navbar-redpacket-icon" />,
      onClick: () => {
        navigate(APP_PATH.REDPACKET)
      },
    },
    {
      title: t('personalCenter.featureList.points'),
      icon: <PointsIcon />,
      badge: (
        <div className="h-4 px-1.5 flex items-center justify-center bg-[#3E2761] rounded-[4px] text-[#C8A7FD] text-[11px] font-light leading-2.75 ">
          {t('personalCenter.featureList.airdrop')}
        </div>
      ),
      onClick: () => {
        if (enabled) {
          toast.info(t('personalCenter.featureList.comingSoon'))
        } else {
          navigate(APP_PATH.LOYALTY)
        }
      },
      isInactive: !enabled,
    },
    {
      title: t('personalCenter.featureList.referrals'),
      icon: <IconTradeReward />,
      onClick: () => {
        if (!handleIsLoggined()) return
        navigate(APP_PATH.NODE_AGENT)
      },
    },
    {
      title: t('personalCenter.featureList.rewards'),
      icon: <IconWalletMoney />,
      onClick: () => {
        if (!handleIsLoggined()) return
        navigate(APP_PATH.TRADE_REWARDS)
      },
    },
    {
      title: t('personalCenter.featureList.mnemonicPhrase'),
      icon: <IconExportWallet />,
      onClick: () => {
        if (!handleIsLoggined()) return
        setShowSecurityModal(true)
      },
    },
    {
      title: t('personalCenter.featureList.walletManagement'),
      icon: <IconWalletManagement />,
      onClick: () => {
        if (!handleIsLoggined()) return
        setOpenWalletManagement(true)
      },
      isHidden: true,
    },
    {
      title: t('personalCenter.featureList.tradeSettings'),
      icon: <IconPreferences />,
      onClick: () => {
        if (!handleIsLoggined()) return
        setOpenTradeSettings(true)
      },
      isHidden: true, //activeChain === TYPE_CHAIN.ARB,
    },
    {
      title: t('futuresDetails.common.orderComfirmTitle'),
      icon: <IconOrderConfirm className="text-white" />,
      right: (
        <Switch
          checked={isShowOrderConfirm}
          className="data-[state=checked]:bg-[#6A2AE0]"
          disabled={false}
          onCheckedChange={(val: boolean) => {
            dispatch(
              futuresTradePreferencesActions.updateTradePreferences({
                isShowOrderConfirm: val,
              }),
            )
          }}
        />
      ),
      isHidden: true,
    },
    {
      title: t('fundingRate.title.header'),
      icon: <FundingRateIcon />,
      onClick: () => {
        // toast.info(t('personalCenter.featureList.comingSoon'))
        navigate(APP_PATH.FUNDING_RATE)
      },
      // isInactive: true,
    },
    {
      title: t('personalCenter.featureList.browsingHistory'),
      icon: <IconClockStroke />,
      onClick: () => {
        navigate(APP_PATH.MEME_SETTINGS_BROWSING_HISTORY)
      },
    },
  ]

  const secondSectionMenuItems: MenuItem[] = [
    {
      title: t('personalCenter.featureList.documents'),
      icon: <DocumentIcon className="size-4" />,
      onClick: () => {
        window.open('https://docs.xbit.com', '_blank', 'noopener noreferrer')
      },
    },
    {
      title: t('personalCenter.featureList.community'),
      icon: <CommunityIcon className="size-4" />,
      onClick: () => {
        navigate(APP_PATH.MEME_SETTINGS_ABOUT_US)
      },
      isHidden: true,
    },
    {
      title: t('personalCenter.featureList.shareXbit'),
      icon: <IconShareStroke className="size-4 text-white" />,
      onClick: () => {
        setShowShare(true)
      },
    },
    {
      title: t('personalCenter.featureList.userFeedback'),
      icon: <IconEditStroke className="size-4 text-white" />,
      onClick: () => {
        window.open('https://t.me/xbit_dex', '_blank', 'noopener noreferrer')
      },
    },
  ]
  const socialLinks = [
    {
      icon: <IconTwitter className="text-white size-5" />,
      label: 'Twitter（X）',
      href: 'https://x.com/XBITDEX',
    },
    {
      icon: <IconTelegram className="text-white size-5" />,
      label: 'Telegram',
      href: 'https://t.me/xbit_dex',
    },
    {
      icon: <IconDiscord className="text-white size-5" />,
      label: 'Discord',
      href: 'https://discord.com/invite/xbit',
    },
    {
      icon: <IconEmail className="text-white size-5" />,
      label: 'Email',
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        setOpenEmailDrawer(true)
      },
    },
  ]
  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    setMemonic(response?.memonic!.split(' '))
    setShowSecurityModal(false)
    setOpenDrawerBackup(true)
  }
  return (
    <>
      <div className="flex flex-col px-5 flex-1 max-h-[calc(100vh-110px)] overflow-y-auto bg-[#0A0A0A]">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={cn('flex items-center justify-between h-12 cursor-pointer', {
              hidden: item?.isHidden,
              'opacity-50': item?.isInactive,
            })}
            onClick={() => {
              if (item.isInactive) {
                toast.info(t('personalCenter.featureList.comingSoon'))
                return
              }
              item.onClick?.()
            }}
          >
            <div className="flex items-center gap-4.5">
              {item.icon}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn('text-white text-[16px] font-medium leading-4', { 'text-[#908E98]': item.isInactive })}
                >
                  {item.title}
                </span>
                {item.badge}
              </div>
            </div>
            {item?.right ? item?.right : <NewArrowLeftIcon className="size-6.5 stroke-[#908E98] rotate-180" />}
          </div>
        ))}
        <div className="h-0.5 bg-[#25242B]" />
        {secondSectionMenuItems.map((item, index) => (
          <div
            key={index}
            className={cn('flex items-center justify-between h-12 cursor-pointer', {
              hidden: item?.isHidden,
            })}
            onClick={item.onClick}
          >
            <div className="flex items-center gap-5.5">
              {item.icon}
              <div className="flex items-center gap-1.5">
                <span className="text-white text-[14px] font-medium leading-4">{item.title}</span>
              </div>
            </div>
            <NewArrowLeftIcon className="size-6.5 stroke-[#908E98] rotate-180" />
          </div>
        ))}
        <div className="pt-6 flex items-center gap-3 mb-18">
          {socialLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex h-11 min-w-18 flex-1 items-center justify-center rounded-full border border-[#25242B] bg-[#050505]"
              onClick={(event) => {
                if (item.onClick) {
                  item.onClick(event)
                } else if (item.href) {
                  window.open(item.href, '_blank', 'noopener noreferrer')
                }
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>
        {activeWallet.isConnected && (
          <div className="fixed bottom-0 left-0 z-10 w-full px-5 bg-[#0A0A0A]">
            <div className="h-0.5 bg-[#25242B]" />
            <div
              className="flex items-center justify-between h-15 w-full cursor-pointer"
              onClick={() => setShowDisconnectConfirm(true)}
            >
              <div className="flex items-center gap-5.5">
                <DisconnectIcon />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF1568] text-[14px] font-medium leading-4">
                    {t('personalCenter.featureList.disconnect')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
      {openTradeSettings && <TradeSettingsBottomSheet open={openTradeSettings} setOpen={setOpenTradeSettings} />}
      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        onVerifyWallet={handleVerifiedWallet}
        type="mnemonic"
      />
      <MnemonicBackupChecklistPage
        memonic={memonic}
        openDrawer={openDrawerBackup}
        setOpenDrawer={setOpenDrawerBackup}
      />
      <NewSwitchWalletBottomSheet open={openWalletManagement} setOpen={setOpenWalletManagement} />
      <LogoutDialog open={showDisconnectConfirm} setOpen={setShowDisconnectConfirm} />
      <ContactEmailDrawer open={openEmailDrawer} setOpen={setOpenEmailDrawer} />
    </>
  )
}

export default FeatureList
