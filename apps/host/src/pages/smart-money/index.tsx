import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useTranslation } from 'react-i18next'
// import TokenDetailSmartMoney from '@components/tokenDetailSmartMoney'
import TabCopyTrade from '@components/listCoin/TabCopyTrade.tsx'
// import TabSmartMoney from '@components/listCoin/TabSmartMoney.tsx'
import { IconRanking, Wallet } from '@/components/icon'
import DrawerCopyTrade from '@/components/listCoin/drawer/DrawerCopyTrade'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { UITab } from '@/types/uiTabs'
import { saveFirstPageToStorage } from '@/utils/storage'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import {
  SmartMoneyContextProvider,
  SmartMoneyTab,
  useSmartMoneyContextFields,
} from '@/components/listCoin/SmartMoneyContext'
// import { Drawer } from 'vaul';
// import TabSmartMoney from '@/components/listCoin/TabSmartMoney'
// import TokenDetailSmartMoney from '@/components/tokenDetailSmartMoney'
import { SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS } from '@/const/smartMoney'
import { useActiveChain } from '@/hooks/useActiveChain'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { useAppSelector } from '@/redux/store'
import MonitoringPage from '@pages/monitoring/index.tsx'
import { APP_PATH } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'

const SmartMoneyPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isOpenDrawerCopyTrade, tab: activeTab } = useSmartMoneyContextFields(['isOpenDrawerCopyTrade', 'tab'])
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { isDesktop } = useResponsive()
  const activeWallet = useSelector(_activeWallet)
  const walletCopyTradeRef = useRef<(() => void) | null>(null)
  const activeChain = useActiveChain()
  const isAllowCreateCopyTrade = useMemo(() => {
    return SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS.includes(activeChain)
  }, [activeChain])
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const { isEmptyWalletCopyTrade, tab } = useSmartMoneyContextFields(['isEmptyWalletCopyTrade', 'tab'])

  const navTabs: UITab[] = [
    {
      value: SmartMoneyTab.TOP_TALENTS,
      label: (
        <div className="flex">
          <IconRanking className={cn('mr-[4px] size-[18px]', isDesktop ? '' : 'hidden')} />
          {t('smartMoney.tabs.topTalents')}
        </div>
      ),
    },
    ...(isAllowCreateCopyTrade
      ? [
          {
            value: SmartMoneyTab.WALLET_COPY,
            label: (
              <div className="flex">
                <Wallet className={cn('mr-[4px] size-[18px]', isDesktop ? '' : 'hidden')} />
                {t('smartMoney.tabs.walletCopy')}
              </div>
            ),
          },
        ]
      : []),
    ...(isDesktop
      ? []
      : [
          {
            value: SmartMoneyTab.MONITORING,
            label: t('bottomNav.monitoring'),
          },
        ]),
    // {
    //   value: 'smartMoney',
    //   label: t('smartMoney.tabs.smartMoney'),
    // },
    // {
    //   value: 'activities',
    //   label: t('smartMoney.tabs.Activities'),
    // },
  ]
  const tabParam = (searchParams.get('tab') || SmartMoneyTab.TOP_TALENTS) as SmartMoneyTab

  useEffect(() => {
    if (!activeTab.get) {
      activeTab.set(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    activeTab.set(tabParam)
  }, [location.pathname, location.search, tabParam])

  useEffect(() => {
    if (tabParam === SmartMoneyTab.MONITORING) {
      activeTab.set(SmartMoneyTab.MONITORING)
    } else if (!isAllowCreateCopyTrade) {
      activeTab.set(SmartMoneyTab.TOP_TALENTS)
    }
  }, [isAllowCreateCopyTrade, tabParam])

  const handleRenderTab = useCallback(() => {
    switch (activeTab.get) {
      case SmartMoneyTab.TOP_TALENTS:
        return <TabCopyTrade.TopTraders isPC={isDesktop} />
      case SmartMoneyTab.WALLET_COPY:
        return <TabCopyTrade.WalletCopyTrade isPC={isDesktop} onRefetch={walletCopyTradeRef} />
      // case navTabs[2].value:
      //   return <TabSmartMoney />
      // case navTabs[3].value:
      //   return <TokenDetailSmartMoney />
      case SmartMoneyTab.MONITORING:
        return <MonitoringPage />
      default:
        return <TabCopyTrade.TopTraders />
    }
  }, [activeTab.get, isDesktop])

  const handleChangeTab = useCallback(
    (tab: string) => {
      setSearchParams({ tab })
      activeTab.set(tab as SmartMoneyTab)
      saveFirstPageToStorage('smartMoneyTab', tab)
    },
    [activeTab.set, setSearchParams],
  )

  function onCreateCopyTrade() {
    isOpenDrawerCopyTrade.set(true)
    // if (activeWallet?.isConnected) {
    //   navigate(APP_PATH.COPY_TRADING_WALLET_SETTINGS)
    // }
  }

  const isShowCreateCopyTradeButton = useMemo(() => {
    return (
      isDesktop &&
      activeWallet.isConnected &&
      isAllowCreateCopyTrade &&
      (!isEmptyWalletCopyTrade.get || tab.get !== SmartMoneyTab.WALLET_COPY)
    )
  }, [isDesktop, activeWallet.isConnected, isAllowCreateCopyTrade, isEmptyWalletCopyTrade.get, tab.get])

  useEffect(() => {
    if (activeTab.get !== SmartMoneyTab.TOP_TALENTS) {
      const footer = document.querySelector('footer')
      if (footer) {
        footer.classList.add('hidden')
      }
    } else {
      const footer = document.querySelector('footer')
      if (footer) {
        footer.classList.remove('hidden')
      }
    }
  }, [activeTab.get])

  useEffect(() => {
    const tab = location.search ? (new URLSearchParams(location.search).get('tab') as SmartMoneyTab) : null
    const page = location.search ? new URLSearchParams(location.search).get('page') : null
    if (tab === SmartMoneyTab.MONITORING && isDesktop) {
      navigate(APP_PATH.MEME_MONITORING + (page ? `?tab=${page}` : ''))
    }
  }, [isDesktop])

  return (
    <div
      className={cn(
        '@container relative mx-auto -mt-1.5 -mb-20',
        isShowMaintenanceNotification
          ? isDesktop
            ? 'max-h-[calc(100vh-167px)] overflow-hidden pt-2'
            : 'pt-0'
          : isDesktop
            ? 'max-h-[calc(100vh-135px)] overflow-hidden pt-2'
            : 'pt-0',
      )}
    >
      <div
        className={cn(
          isDesktop
            ? 'flex items-center justify-between z-10 bg-[transparent] h-[48px]'
            : 'z-10 bg-gradient-to-b from-[#38245D] to-[#060606] sticky top-[-1px] py-2',
        )}
      >
        <MovingLineTabs
          tabs={navTabs}
          defaultTab={activeTab.get}
          onTabChange={handleChangeTab}
          containerClassName={cn(
            isDesktop ? 'relative before:absolute bg-[transparent] after:h-[0px] p-0' : 'bg-transparent',
          )}
          wrapperClassName="z-1"
          tabsClassName="w-full"
          itemClassName="text-[calc(1rem*(14/16))] font-[400]"
          itemClassNameActive="!text-[calc(1rem*(14/16))] !font-[500]"
          showTabLine={!isDesktop}
        />
        {isShowCreateCopyTradeButton ? (
          <div className="p-0">
            <Button
              className="gap-0 mr-4"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (enabled) {
                  setOpenRestrictRegiongDialog(true)
                } else {
                  onCreateCopyTrade()
                }
              }}
              variant="btnOpacity"
            >
              <span className="text-[15px] font-medium text-inherit flex items-center gap-2">
                <Wallet className="mr-[1.25px] size-[18px] opacity-80" />
                {t('listCoin.copyTrade.createCopyTradePC')}
              </span>
            </Button>
          </div>
        ) : null}
      </div>
      {handleRenderTab()}
      {isDesktop ? (
        <DrawerCopyTrade
          open={isOpenDrawerCopyTrade.get}
          setOpen={isOpenDrawerCopyTrade.set}
          onSuccess={() => {
            // Trigger reload of WalletCopyTrade when copy trade is created
            if (walletCopyTradeRef.current) {
              walletCopyTradeRef.current()
            }
          }}
        />
      ) : null}

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </div>
  )
}

export const SmartMoneyPageWithContext = () => {
  return (
    <SmartMoneyContextProvider>
      <SmartMoneyPage />
    </SmartMoneyContextProvider>
  )
}

export default SmartMoneyPageWithContext
