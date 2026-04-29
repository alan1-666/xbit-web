import { useActiveAccount } from '@/hooks/useActiveAccount'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { formatBalance } from '@/lib/format'
import { formatAddressWallet, formatEmail } from '@/lib/string'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { IconEmail } from '@components/icon/brands/IconEmail.tsx'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useOverviewBalance } from '@pages/assets/overview/hooks/useOverviewBalance.ts'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconDisconnect } from '../icon/stroke/IconDisconnect'
import { LogoutDialog } from '../settings/LogoutDialog'
import { DropdownMenu, DropdownMenuContent } from '../ui/dropdown-menu'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { trackUserLoginedIn } from '@/services/google-analytics.service'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

const useConnectOrDisconnect = () => {
  const activeWallet = useActiveWallet()
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
      handleConnect()
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

function svgStringToDataUrl(svg: string): string {
  // If you are already returning dataURL from getAvatarFromAddress, this won't be used.
  // Keep it safe for raw "<svg ...>" strings.
  const encoded = btoa(unescape(encodeURIComponent(svg)))
  return `data:image/svg+xml;base64,${encoded}`
}

export const WalletOverview = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(false)
  const { totalBalance, fundingBalance, futuresBalance, predictionBalance } = useOverviewBalance({ skip: !shouldFetch })
  const activeAccount = useActiveAccount()
  const activeWallet = useAppSelector(_activeWallet)
  const { email, walletAddressLogin } = useAppSelector((state) => state.newWallet) as any
  const userId = useAppSelector(_userInfo)?.userId
  const { handleClick: handleLoginClick, showDisconnectConfirm, setShowDisconnectConfirm } = useConnectOrDisconnect()
  const { wallet } = useWallet()
  const { connectedWalletIcon } = useAppSelector((state) => state.newWallet) as any
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  // Avatar src for the "default" account type (where we used getAvatarFromAddress synchronously before)
  const [walletAvatarSrc, setWalletAvatarSrc] = useState<string>('')

  useEffect(() => {
    trackUserLoginedIn(userId || 'unknown')
    let cancelled = false

    const shouldLoadDefaultAvatar = activeAccount == null || activeAccount === ('' as any)

    if (!shouldLoadDefaultAvatar) {
      // Not in default branch -> no need to load this async avatar
      setWalletAvatarSrc('')
      return
    }

    const addr = activeWallet?.walletAddress
    if (!addr) {
      setWalletAvatarSrc('')
      return
    }

    ;(async () => {
      try {
        const result = await getAvatarFromAddress(addr)
        if (cancelled) return

        // If helper returns dataURL already -> use it
        if (typeof result === 'string' && result.startsWith('data:')) {
          setWalletAvatarSrc(result)
          return
        }

        // If helper returns raw svg string -> convert to dataURL
        if (typeof result === 'string' && result.trim().startsWith('<svg')) {
          setWalletAvatarSrc(svgStringToDataUrl(result))
          return
        }

        // Otherwise just store whatever it is (e.g., absolute/relative url)
        setWalletAvatarSrc(result || '')
      } catch {
        if (!cancelled) setWalletAvatarSrc('')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeAccount, activeWallet?.walletAddress])

  const btnList = [
    {
      icon: '/images/icons/asset-deposit.svg',
      label: t('assets.overview.deposit'),
      key: 'deposit',
    },
    {
      icon: '/images/icons/asset-withdraw.svg',
      label: t('assets.withdraw.withdrawLabel'),
      key: 'withdraw',
    },
    {
      icon: '/images/icons/asset-swap.svg',
      label: t('assets.transfer'),
      key: 'transfer',
    },
  ]

  const IconActiveAccount = useMemo(() => {
    switch (activeAccount) {
      case NEW_TYPE_ACCOUNT.EMAIL:
        return (
          <span className="size-6 bg-[#212127] rounded-full flex items-center justify-center">
            <IconEmail className="text-[#908E98] size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.GOOGLE:
        return (
          <span className="size-6 bg-[#212127] rounded-full flex items-center justify-center">
            <img src="/images/google-logo.svg" alt="Google" className="size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.WC:
        return <img src="/images/login/walletconnect.png" alt="WalletConnect" className="size-5" />
      case NEW_TYPE_ACCOUNT.APPLE:
        return (
          <span className="size-6 bg-[#212127] rounded-full flex items-center justify-center">
            <img src="/images/apple-logo.svg" alt="Apple" className="size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.WALLET:
        // Use connectedWalletIcon from Redux (for MetaMask/OKX) or fallback to Solana adapter icon
        const walletIcon = connectedWalletIcon || wallet?.adapter.icon || ''
        return <img src={walletIcon} alt="Wallet" className="size-5 rounded-full" />
      default:
        return (
          <img
            src={walletAvatarSrc || ''}
            alt="Wallet"
            className="size-5 rounded-full"
            // optional: prevent broken-image icon flash
            onError={() => setWalletAvatarSrc('')}
          />
        )
    }
  }, [activeAccount, wallet?.adapter.icon, walletAvatarSrc, connectedWalletIcon])

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div
            role="button"
            aria-label="Wallet overview"
            onMouseEnter={() => setShouldFetch(true)}
            className="border-[0.5px] border-[#79778C29] bg-[#0D0D0E] h-[34px] rounded-full items-center justify-center px-1.5 cursor-pointer"
          >
            <button className="h-full flex items-center gap-2">
              {IconActiveAccount}
              {email ? (
                <span className="text-[11px] font-[330] text-white">{formatEmail(email, 5)}</span>
              ) : (
                <span className="text-[12px] font-medium text-[#D9D9D9]">
                  {formatAddressWallet(walletAddressLogin, 5, 5)}
                </span>
              )}
              <IconTriangleDown />
            </button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[360px] border border-[#79778C29] bg-[#212127] flex flex-col p-3"
          side="bottom"
          align="end"
          alignOffset={0}
          sideOffset={10}
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger className="mr-auto">
                <span
                  className="inline-block !text-[#9b9b9b] text-[12px]
                      leading-[16px] !font-normal tracking-[-0.02em]
                      border-dashed hover:border-b-[#9b9b9b] border-b border-b-transparent
                      transition-colors duration-150 mr-[8px] cursor-pointer"
                >
                  {t('detail.tokenDetail.totalValue')}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px] border border-[#79778C29] bg-[#212127] text-[#908E98]">
                <p className="text-[11px] tracking-wide">{t('wallet.availableAllAssets')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mt-1.5 text-[24px] leading-[24px] font-normal text-rise">
            {formatBalance(totalBalance, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </div>

          <div className="mt-[14px] flex divide-x divide-[#79778C29]">
            <div className="space-y-1.5 px-1 min-w-0 text-center flex-1">
              <div className="text-[12px] font-normal text-[#908E98] leading-none truncate">
                {t('assets.funding.title')}
              </div>
              <div className="text-[14px] font-medium leading-none truncate">
                {formatBalance(fundingBalance, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
              </div>
            </div>
            <div className="space-y-1.5 px-1 min-w-0 text-center flex-1">
              <div className="text-[12px] font-normal text-[#908E98] leading-none truncate">
                {t('assets.futures.title')}
              </div>
              <div className="text-[14px] font-medium leading-none truncate">
                {formatBalance(futuresBalance, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
              </div>
            </div>
            {isPredictionEnabled && (
              <div className="space-y-1.5 px-1 min-w-0 text-center flex-1">
                <div className="text-[12px] font-normal text-[#908E98] leading-none truncate">Prediction</div>
                <div className="text-[14px] font-medium leading-none truncate">
                  {predictionBalance
                    ? formatBalance(predictionBalance, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })
                    : '$0'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-2">
            {btnList.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  dispatch(
                    exchangeActions.openExchangeDialog({
                      defaultTab: item.key as 'deposit' | 'withdraw' | 'transfer',
                    }),
                  )
                }}
                className={`flex p-2.5 bg-[#2B2B33] rounded-md items-center justify-center gap-1 cursor-pointer ${
                  item.key === 'transfer' ? 'col-span-2' : ''
                }`}
              >
                <img src={item.icon} alt={item.label} className="w -[18px]" />
                <span className="text-[13px] font-normal text-white">{item.label}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-2 flex items-center justify-between text-[#CACACA] hover:text-[#EA3B4F] cursor-pointer"
            onClick={handleLoginClick}
          >
            <div className="flex items-center gap-2 text-[12px] font-[300] leading-none">
              <IconDisconnect className="size-4" />
              <span>{email ? formatEmail(email, 5) : formatAddressWallet(walletAddressLogin, 5, 5)}</span>
            </div>
            <span className="text-[12px] font-normal">{t('appSettings.disconnectWallet')}</span>
          </div>

          <LogoutDialog open={showDisconnectConfirm} setOpen={setShowDisconnectConfirm} />
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
