import ChangeChainButton from '@components/PC/ChangeChainButton.tsx'
import HeaderNotifications from '@components/PC/HeaderNotifications.tsx'
import { exchangeActions } from '@/redux/modules/exchange.slice.ts'
import { WalletOverview } from '@components/PC/WalletOverview.tsx'
import DropdownUserSetting from '@components/PC/DropdownUserSetting.tsx'
import Text from '@components/common/Text.tsx'
import Setting from '@components/PC/Setting.tsx'
import DialogLoginNewLoginDrawer from '@components/PC/DialogLoginNewLoginDrawer.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/redux/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ls from '@/lib/local-storage.ts'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const AccountArea = () => {
  const location = useLocation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const activeWallet = useSelector(_activeWallet)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleClick = useCallback(() => {
    setShowLoginDrawer(true)
  }, [])

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setShowLoginDrawer(false)
    } else {
      // 用户退出登录时清除路由缓存
      ls.remove('cached_route')
    }
  }, [activeWallet?.isConnected])

  const isShowButonSwitchChain = useMemo(() => {
    const pathname = location.pathname
    // return !pathname.startsWith('/futures') && !pathname.startsWith('/xstocks')
    return pathname.startsWith('/meme') // only show on meme chain pages
  }, [location.pathname])

  return (
    <>
      {activeWallet?.isConnected ? (
        <div className="flex gap-1.5 2xl:gap-2.5 justify-center items-center">
          {isShowButonSwitchChain && (
            <div className="hidden lg:block">
              <ChangeChainButton />
            </div>
          )}

          <div className="hidden lg:block">
            <HeaderNotifications />
          </div>
          {/* <button
            className="h-[34px] bg-[#6A2AE0] text-white text-[calc(1rem*(13/16))] leading-[2.5] font-[450] tracking-[calc(1rem*(0.5/16))] rounded-[50px] px-3 whitespace-nowrap"
            onClick={() => {
              dispatch(
                exchangeActions.openExchangeDialog({
                  defaultTab: 'deposit',
                }),
              )
            }}
          >
            <span className="">{t('assets.deposit.title')}</span>
          </button> */}
          <Button
            className="w-full rounded-full"
            variant="gradient"
            onClick={() => {
              dispatch(
                exchangeActions.openExchangeDialog({
                  defaultTab: 'deposit',
                }),
              )
            }}
          >
            {t('assets.deposit.title')}
          </Button>

          <div className="hidden lg:block">
            <WalletOverview />
          </div>

          <DropdownUserSetting />
        </div>
      ) : (
        <div className="flex gap-3">
          {isShowButonSwitchChain && (
            <div className="hidden lg:block">
              <ChangeChainButton />
            </div>
          )}
          <div
            className="border-[0.5px] border-[#79778C29] bg-[#212127] h-[34px] rounded-full items-center justify-center cursor-pointer px-[16px]"
            onClick={handleClick}
          >
            <button className="h-full flex items-center gap-2 mx-auto">
              <div className="flex gap-1.5 items-center">
                <Text
                  text={t('login.LoginOrSignup')}
                  className="!font-[450] !text-[15px] leading-[1]"
                  color="#FFFFFF"
                />
              </div>
            </button>
          </div>

          <Setting />
        </div>
      )}
      {!activeWallet?.isConnected && showLoginDrawer && (
        <DialogLoginNewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      )}
    </>
  )
}
