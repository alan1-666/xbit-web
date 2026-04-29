import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import {
  IconChevronRight,
  IconClockStroke,
  IconEditStroke,
  IconExportWallet,
  IconShareStroke,
  IconXbitLogo,
  IconOrderConfirm
} from '@components/icon'
import { useTranslation } from 'react-i18next'
import { APP_PATH } from '@/lib/constant.ts'
import { cn } from '@/lib/utils.ts'
import { useNotificationsEnabled } from '@hooks/useNotificationsEnabled.ts'
import { getAppVersion } from '@/utils/helpers.ts'
import { ShareXbitDrawer } from '@components/settings/ShareXbitDrawer.tsx'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { useActiveAccount } from '@hooks/useActiveAccount.ts'
import { IconLink } from '@components/icon/stroke/IconLink.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { LogoutDialog } from '@components/settings/LogoutDialog.tsx'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import { toast } from 'sonner'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import SecurityCheckModal, { VefiryWalletResponse } from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import MnemonicBackupChecklistPage from '@components/auth/WalletBackup/MnemonicBackupChecklist.tsx'
import { IconPreferences, IconWalletMoney, IconTradeReward } from '@components/icon'
import { IconWallets } from '@components/icon/stroke/IconWallets.tsx'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import NewSwitchWalletBottomSheet from '@components/auth/ManagementWallets/NewSwitchWalletBottomSheet.tsx'
import { AppSettingsPortal } from './AppSettingsPortal'
import NodeAgent from '@/pages/node-agent'
import { useNavigate } from 'react-router-dom'
import { RankingIcon } from '../icon/gradient/IconCoins'
import { Switch } from '@components/ui/switch.tsx'
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions,
} from '@/redux/modules/futuresTradePreferences.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'



type MenuItem = {
  icon: ReactNode
  title: string | ReactNode
  subtitle?: string
  right?: string | ReactNode
  onClick?: () => void
  disabled?: boolean
  requiresLogin?: boolean
  isSmall?: boolean
}

type MenuGroup = {
  items: MenuItem[]
}

const GroupItems = (props: { items: MenuItem[] }) => {
  const { items } = props
  const activeWallet = useActiveWallet()
  const { t } = useTranslation()
  
  const handleOnItemClick = (item: MenuItem) => {
    if (item.requiresLogin && !activeWallet.isConnected) {
      toast.warning(t('appSettings.loginRequired'))
      return
    }
    if (item.disabled) return
    item.onClick?.()
  }
  return (
    <div className="px-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3  py-3 cursor-pointer',
            item.disabled ? 'cursor-not-allowed opacity-50' : 'transition-colors',
          )}
          onClick={() => handleOnItemClick(item)}
        >
          <div className={cn('mr-2', item.isSmall && 'mr-3')}>{item.icon}</div>
          <div className={cn('text-[calc(18rem/16)] font-[380]', item.isSmall && 'text-[calc(14rem/16)] leading-none')}>
            {item.title}
          </div>
          {/* {item.subtitle && <div className="text-[calc(13rem/16)] text-[#FFFFFF80]">{item.subtitle}</div>} */}
          <div className="flex items-center gap-1">
            {item.right && <div className="text-[calc(14rem/16)] text-[#FFFFFFB2]">{item.right}</div>}
            {/* <IconChevronRight className="text-[#B9B9B9]" /> */}
          </div>
        </div>
      ))}
    </div>
  )
}

const useConnectOrDisconnect = () => {
  const activeWallet = useActiveWallet()
  const navigate = useNavigate()
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const handleConnect = () => {
    setShowLoginDrawer(true)
  }

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true)
  }

  const handleClick = () => {
    if (!activeWallet.isConnected) {
      // handleConnect()
      navigate(APP_PATH.LOGIN)
    } else {
      handleDisconnect()
    }
  }

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setShowLoginDrawer(false)
    }
  }, [activeWallet])

  return {
    handleClick,
    isConnected: activeWallet.isConnected,
    showDisconnectConfirm,
    setShowDisconnectConfirm,
    showLoginDrawer,
    setShowLoginDrawer,
  }
}

export const SettingsVerticalMenu = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const enabled = useFeatureIsOn('show_loyalty')
  const navigate = useNavigateWithLocation()
  const { notificationsEnabled } = useNotificationsEnabled()
  const [showShare, setShowShare] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])
  const [openDrawerBackup, setOpenDrawerBackup] = useState(false)
  const activeWallet = useActiveWallet()
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const [openWalletManagement, setOpenWalletManagement] = useState(false)
  const { isShowOrderConfirm } = useAppSelector(selectFuturesTradePreferences)
  const dispatch = useAppDispatch()

  const {
    handleClick: handleLoginClick,
    isConnected,
    showDisconnectConfirm,
    setShowDisconnectConfirm,
    showLoginDrawer,
    setShowLoginDrawer,
  } = useConnectOrDisconnect()

  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    setMemonic(response?.memonic!.split(' '))
    setShowSecurityModal(false)
    setOpenDrawerBackup(true)
  }

  const activeAccount = useActiveAccount()
  const isLoggedIn = !!ServiceConfig.token && activeWallet?.isConnected
  const showLoginRequiredToast = () => {
    toast.warning(t('appSettings.loginRequired'))
  }
  const groups = useMemo(() => {
    return [
      {
        items: [
          {
            title: t('appSettings.spotSettings'),
            icon: <IconPreferences className="text-white" />,
            onClick: () => {
              if (!isLoggedIn) return showLoginRequiredToast()
              setOpenTradeSettings(true)
            },
          },
          {
            title: t('appSettings.manageWallets'),
            icon: <IconWallets className="text-white" />,
            onClick: () => {
              if (!isLoggedIn) return showLoginRequiredToast()
              setOpenWalletManagement(true)
            },
          },
          {
            title: t('nodeAgent.referralCommission'),
            icon: <IconWalletMoney className="text-white" />,
            onClick: () => {
              if (!isLoggedIn) return showLoginRequiredToast()
              navigate(APP_PATH.NODE_AGENT)
            },
          },
          {
            title: t('Activityrewards.title'),
            icon: <IconTradeReward className="text-white" />,
            onClick: () => {
              if (!isLoggedIn) return showLoginRequiredToast()
              navigate(APP_PATH.TRADE_REWARDS)
            },
          },
          {
            title: t('futuresDetails.common.orderComfirmTitle'),
            icon: <IconOrderConfirm className="text-white" />,
            right: <div className="absolute right-0 mt-[-7px]">
              <Switch
                checked={isShowOrderConfirm}
                className="data-[state=checked]:bg-[#6A2AE0]"
                disabled={false}
                onCheckedChange={(val: boolean) => {
                  dispatch(
                  futuresTradePreferencesActions.updateTradePreferences({
                    isShowOrderConfirm: val
                  }))
                  
                }}
                
              />
            </div>,
          },
          {
            title: t('walletBackup.mnemonicChecklist.backupTitle'),
            icon: <IconExportWallet />,
            requiresLogin: true,
            onClick: () => {
              setShowSecurityModal(true)
            },
          },
          {
            title: t('appSettings.browsingHistory'),
            subtitle: t('appSettings.browsingHistorySubtitle'),
            icon: <IconClockStroke className="text-white" />,
            onClick: () => {
              navigate(APP_PATH.MEME_SETTINGS_BROWSING_HISTORY)
            },
          },
          ...(enabled
            ? [
                {
                  title: t('menu.options.airdropPoints'),

                  icon: <RankingIcon className="text-white ml-1" />,
                  onClick: () => {
                    navigate(APP_PATH.LOYALTY)
                  },
                },
              ]
            : []),
        ],
      },
      // {
      //   items: [
      //     {
      //       title: t('appSettings.browsingHistory'),
      //       subtitle: t('appSettings.browsingHistorySubtitle'),
      //       icon: <IconClockStroke className="text-white" />,
      //       onClick: () => {
      //         navigate(APP_PATH.MEME_SETTINGS_BROWSING_HISTORY)
      //       },
      //     },
      //   ],
      // },
      // {
      //   items: [
      //     {
      //       title: t('appSettings.messageNotifications'),
      //       icon: <IconMessageNotificationStroke className="text-white" />,
      //       right: notificationsEnabled ? t('appSettings.enabled') : t('appSettings.disabled'),
      //       onClick: () => {
      //         navigate(APP_PATH.MEME_NOTIFICATION_SETTINGS)
      //       },
      //     },
      //     {
      //       title: t('appSettings.colorPreference'),
      //       icon: <IconColorPaletteStroke className="text-white" />,
      //       right: <IconPriceChange />,
      //       onClick: () => {
      //         navigate(APP_PATH.MEME_COLORS_SETTINGS)
      //       },
      //     },
      //     {
      //       title: t('appSettings.language'),
      //       icon: <IconGlobalStroke className="text-white" />,
      //       right: languages[currentLang],
      //       onClick: () => {
      //         navigate(APP_PATH.MEME_SETTINGS_LANGUAGE)
      //       },
      //     },
      //   ],
      // },
      {
        items: [
          {
            title: t('appSettings.aboutUs.title'),
            subtitle: t('appSettings.contactUsSubtitle'),
            icon: <IconXbitLogo />,
            // right: getAppVersion(),
            isSmall: true,
            onClick: () => {
              navigate(APP_PATH.MEME_SETTINGS_ABOUT_US)
            },
          },
          {
            title: t('appSettings.shareXBIT'),
            subtitle: t('appSettings.shareXBITSubtitle'),
            icon: <IconShareStroke className="text-white" />,
            isSmall: true,
            onClick: () => {
              const isLoggedIn = !!activeAccount && !!ServiceConfig.token
              if (!isLoggedIn) {
                toast.warning(t('appSettings.loginRequired'))
                return
              }
              setShowShare(true)
            },
          },
          {
            title: t('appSettings.userFeedback'),
            subtitle: t('appSettings.userFeedbackSubtitle'),
            icon: <IconEditStroke className="text-white" />,
            disabled: true,
            isSmall: true,
            onClick: () => {
              navigate(APP_PATH.MEME_SETTINGS_USER_FEEDBACK)
            },
          },
          {
            title: !isConnected ? t('appSettings.connectWallet') : t('appSettings.disconnectWallet'),
            icon: <IconLink className="text-white" />,
            onClick: handleLoginClick,
            isSmall: true,
          },
        ],
      },
    ] as MenuGroup[]
  }, [notificationsEnabled, currentLang, activeAccount, isConnected, isShowOrderConfirm])
  return (
    <div className="space-y-2.5">
      {groups.map((group, index) => (
        <div
          key={index}
          className={cn('border-b border-[#ECECED0A] pb-[14px]', index === groups.length - 1 && 'border-b-0')}
        >
          <GroupItems items={group.items} />
        </div>
      ))}
      <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
      <LogoutDialog open={showDisconnectConfirm} setOpen={setShowDisconnectConfirm} />
      {!isConnected && <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />}
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
      <div className="hidden">
        <TradeSettingsBottomSheet open={openTradeSettings} setOpen={setOpenTradeSettings} />
      </div>
      <NewSwitchWalletBottomSheet open={openWalletManagement} setOpen={setOpenWalletManagement} />
    </div>
  )
}
