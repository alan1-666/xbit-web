import { useActiveAccount } from '@/hooks/useActiveAccount'
import { useResponsive } from '@/hooks/useResponsive'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { capitalizeFirstLetter } from '@/lib/utils'
import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@components/ui/drawer.tsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { X } from 'lucide-react'
import { IconEmail } from '../icon/brands/IconEmail'
import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { useAppSelector } from '@/redux/store'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useWallet } from '@solana/wallet-adapter-react'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

const LoginByExplained = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const activeAccount = useActiveAccount()
  const activeWallet = useAppSelector(_activeWallet)
  const { wallet } = useWallet()

  const handleMapText = useCallback(() => {
    switch (activeAccount) {
      case NEW_TYPE_ACCOUNT.WALLET:
        return 'Web3'

      case NEW_TYPE_ACCOUNT.WC:
        return 'Wallet Connect'

      default:
        return activeAccount
    }
  }, [activeAccount])

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(activeWallet?.walletAddress).then(setSrc)
  }, [activeWallet?.walletAddress])

  const IconActiveAccount = useMemo(() => {
    switch (activeAccount) {
      case NEW_TYPE_ACCOUNT.EMAIL:
        return (
          <span className="size-3 bg-[#212127] rounded-full flex items-center justify-center">
            <IconEmail className="text-[#908E98] size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.GOOGLE:
        return (
          <span className="size-3 bg-[#212127] rounded-full flex items-center justify-center">
            <img src="/images/google-logo.svg" alt="Google" className="size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.WC:
        return <img src="/images/login/walletconnect.png" alt="WalletConnect" className="size-3" />
      case NEW_TYPE_ACCOUNT.APPLE:
        return (
          <span className="size-3 bg-[#212127] rounded-full flex items-center justify-center">
            <img src="/images/apple-logo.svg" alt="Apple" className="size-3" />
          </span>
        )
      case NEW_TYPE_ACCOUNT.WALLET:
        return <img src={wallet?.adapter.icon ?? ''} alt="Wallet" className="size-3 rounded-full" />
      default:
        return <img data-avatar-type="wallet" src={src} alt="Wallet" className="size-5 rounded-full" />
    }
  }, [activeAccount, activeWallet?.walletAddress])

  return (
    <>
      {isDesktop ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              {/* <img src="/images/orderSetting/icon-info.svg" className="size-3 mt-[3px]" alt="" /> */}
              {IconActiveAccount}
            </TooltipTrigger>
            <TooltipContent className="rounded-md border border-[#79778C29] bg-[#212127] p-2 text-[12px] leading-1.5 font-[330]">
              {t('login.loginType', { LoginType: capitalizeFirstLetter(handleMapText()) })}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger>
            {/* <img src="/images/orderSetting/icon-info.svg" className="size-3 mt-[3px]" alt="" /> */}
            {IconActiveAccount}
          </DrawerTrigger>
          <DrawerContent className="mx-auto max-h-[80vh] w-full max-w-[768px] bg-[#232329]">
            <DrawerDescription className="mt-4 flex flex-col gap-[12px] px-4 text-[16px] text-white">
              <DrawerClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                <X className="size-5" />
              </DrawerClose>
              {t('login.loginType', { LoginType: capitalizeFirstLetter(handleMapText()) })}
            </DrawerDescription>

            <DrawerFooter className="mt-3 border-t-[0.5px] border-t-[#ECECED0A] pt-0">
              <div className="flex flex-row items-center justify-center gap-2.5 pt-4">
                <Button
                  size="lg"
                  variant="gradient"
                  className="h-11 flex-1 rounded-[50px] text-[#261236]"
                  onClick={() => setOpen(false)}
                >
                  {t('futuresDetails.common.close')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

export default LoginByExplained
