import { ReactNode, useMemo, useRef, useState } from 'react'
import { IconPreferences, IconWalletMoney } from '@components/icon'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { BaseBottomDrawerHandle } from '@components/settings/BaseBottomDrawer.tsx'
import { SetWithdrawalWhitelistWarning } from '@components/settings/SetWithdrawalWhitelistWarning.tsx'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import { useActiveAccount } from '@hooks/useActiveAccount.ts'
import { toast } from 'sonner'
import SecurityCheckModal, { VefiryWalletResponse } from '../auth/WalletBackup/SecurityCheckModal'
import MnemonicBackupChecklistPage from '../auth/WalletBackup/MnemonicBackupChecklist'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { AppSettingsPortal } from './AppSettingsPortal'
// import InviteFriends from '@/pages/invite-friends'
import NodeAgent from '@/pages/node-agent'
import NewSwitchWalletBottomSheet from '@components/auth/ManagementWallets/NewSwitchWalletBottomSheet.tsx'
import { IconWallets } from '@components/icon/stroke/IconWallets.tsx'

const Item = (props: { icon: ReactNode; title: string; onClick?: () => void; badge?: string; disabled?: boolean }) => {
  const { icon, title, onClick, badge, disabled = false } = props
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 relative overflow-visible group',
        !disabled ? 'cursor-pointer' : 'cursor-not-allowed grayscale-100',
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="rounded-full border border-[#ECECED1F] size-10 text-[#00FFB4] flex justify-center items-center relative">
        {icon}
        {!!badge && (
          <div className="absolute -top-2.5 break-keep left-4 bg-[linear-gradient(43.83deg,#FC2CFF_0%,#FFFFFF_47.32%,#FFFFFF_63.89%,#00FFCA_03.57%)] text-[calc(10rem/16)] leading-2.5 text-black rounded-[20px] rounded-bl-[2px] px-1.5 py-1">
            {badge}
          </div>
        )}
      </div>
      <div
        className={cn(
          'text-[calc(12rem/16)] text-[#FFFFFFB2] break-keep text-center',
          !disabled && 'group-hover:text-white',
        )}
      >
        {title}
      </div>
    </div>
  )
}

type MenuItem = {
  title: string
  icon: ReactNode
  onClick?: () => void
  badge?: string
  disabled?: boolean
  hidden?: boolean
}

export const HorizontalSettingsMenu = () => {
  const listRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const { scrollXProgress } = useScroll({ container: listRef })
  const [isOpen, setIsOpen] = useState(false)
  const [openWalletManagement, setOpenWalletManagement] = useState(false)
  const { t } = useTranslation()
  const activeAccount = useActiveAccount()
  const activeWallet = useSelector(_activeWallet)
  const withdrawalAddressWarningRef = useRef<BaseBottomDrawerHandle>(null)
  const showLoginRequiredToast = () => {
    toast.warning(t('appSettings.loginRequired'))
  }

  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [openDrawerBackup, setOpenDrawerBackup] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])

  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    setMemonic(response?.memonic!.split(' '))
    setShowSecurityModal(false)
    setOpenDrawerBackup(true)
  }
  const isLoggedIn = !!ServiceConfig.token && activeWallet?.isConnected
  const items: MenuItem[] = useMemo(() => {
    const allItems = [
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
        disabled: false,
        onClick: () => {
          if (!isLoggedIn) return showLoginRequiredToast()
          setOpenWalletManagement(true)
        },
      },
      {
        title: t('inviteFriends.title'),
        icon: <IconWalletMoney className="text-white" />,
        disabled: false,
        onClick: () => {
          if (!isLoggedIn) return showLoginRequiredToast()
          setIsOpen(true)
        },
      },
      // {
      //   title: t('walletBackup.mnemonicChecklist.backupTitle'),
      //   icon: <IconExportWallet />,
      //   // disabled: true,
      //   onClick: () => {
      //     if (!isLoggedIn) return showLoginRequiredToast()
      //     setShowSecurityModal(true)
      //   },
      // },
      // {
      //   title: t('appSettings.googleAuthenticator'),
      //   icon: <IconGoogleAuthenticator />,
      //   hidden: isLoggedIn && activeAccount === TYPE_ACCOUNT.CHAIN,
      //   badge:
      //     activeAccount === TYPE_ACCOUNT.TELEGRAM && userSettings?.googleAuthenticator?.isEnabled === false
      //       ? t('appSettings.unlinked')
      //       : undefined,
      //   onClick: () => {
      //     if (!isLoggedIn) return showLoginRequiredToast()
      //     navigate(APP_PATH.MEME_SETTINGS_GOOGLE_AUTH)
      //   },
      // },
      // {
      //   title: t('appSettings.withdrawalAddress'),
      //   icon: <IconWallets className="text-[#00FFB4]" />,
      //   badge:
      //     activeAccount === TYPE_ACCOUNT.TELEGRAM && userSettings?.googleAuthenticator?.isEnabled === false
      //       ? t('appSettings.unset')
      //       : undefined,
      //   hidden: isLoggedIn && activeAccount === TYPE_ACCOUNT.CHAIN,
      //   onClick: () => {
      //     if (!isLoggedIn) return showLoginRequiredToast()
      //     if (userSettings?.googleAuthenticator?.isEnabled === false) {
      //       withdrawalAddressWarningRef.current?.open()
      //       return
      //     }
      //     navigate(APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH)
      //   },
      // },
      // {
      //   title: t('appSettings.fundingHistory'),
      //   icon: <IconReceiptTime />,
      //   onClick: () => {
      //     if (!isLoggedIn) return showLoginRequiredToast()
      //     navigate(APP_PATH.ASSETS + '?page=overview?tab=funds')
      //   },
      // },
    ] as MenuItem[]
    return allItems.filter((item) => !item.hidden)
  }, [t, activeAccount, isLoggedIn])

  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / 3)

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    const page = Math.floor(latest * totalPages)
    if (page !== currentPage && page < totalPages) {
      setCurrentPage(page)
    }
  })

  const handleOnIndicatorClick = (index: number) => {
    if (listRef.current) {
      const scrollLeft = (listRef.current.scrollWidth / totalPages) * index
      listRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full">
      <div ref={listRef} className="w-full overflow-x-auto no-scrollbar flex snap-x snap-mandatory pt-4">
        {items.map((item, index) => (
          <div key={index} className="flex-1 flex justify-center snap-start basis-1/3 shrink-0">
            <Item
              icon={item.icon}
              title={item.title}
              onClick={item.onClick}
              badge={item.badge}
              disabled={item.disabled}
            />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div aria-label="indicator" className="flex items-center justify-center mt-3">
          {Array.from({ length: totalPages }, (_, index) => (
            <div className="h-2 px-1 cursor-pointer flex items-center" onClick={() => handleOnIndicatorClick(index)}>
              <div
                key={index}
                className={cn(
                  'h-1 rounded-full transition-all duration-500 cursor-pointer',
                  index === currentPage
                    ? 'bg-[linear-gradient(43.83deg,#FC2CFF_0%,#FFFFFF_47.32%,#FFFFFF_63.89%,#00FFCA_103.57%)] w-[13px]'
                    : 'bg-[#FFFFFF5C] w-1',
                )}
              />
            </div>
          ))}
        </div>
      )}
      <SetWithdrawalWhitelistWarning ref={withdrawalAddressWarningRef} />
      <div className="hidden">
        <TradeSettingsBottomSheet open={openTradeSettings} setOpen={setOpenTradeSettings} />
      </div>
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

      <AppSettingsPortal isOpen={isOpen} onClose={() => setIsOpen(false)} direction="right">
        <NodeAgent setIsOpen={setIsOpen} />
      </AppSettingsPortal>

      <NewSwitchWalletBottomSheet open={openWalletManagement} setOpen={setOpenWalletManagement} />
    </div>
  )
}
