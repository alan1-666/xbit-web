import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { IconTelegram } from '../icon'
import eventBus from '@/lib/eventBus'
import { EVENT_MESSAGE_MODAL_WALLET_CONNECT } from './wallet-connect'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { walletActions } from '@/redux/modules/wallet.slice'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import ButtonLogin from '@components/common/LoginSection/ButtonLogin.tsx'
import { useTranslation } from 'react-i18next'

const LoginPage = () => {
  const { openConnectModal } = useConnectModal()
  const [open, setOpen] = useState(false)
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const { connectTelegramForChain } = useMultiChainWallet({})
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const onClickOpenModalConnectWallet = () => {
    dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
    if (chain === TYPE_CHAIN.ETH && openConnectModal) openConnectModal()
    if (chain === TYPE_CHAIN.SOLANA) {
      eventBus.dispatch(EVENT_MESSAGE_MODAL_WALLET_CONNECT, {
        data: {
          isOpen: true,
        },
      })
    }
    setOpen(false)
  }

  const onClickLoginByTG = () => {
    connectTelegramForChain()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonLogin toolTip={t('login.recommended')}>
          <img src="/images/icons/icon-telegram.svg" className="w-[1rem] h-[calc(1rem*(13.43/16))]" alt="" />
          {t('login.telegramLogin')}
        </ButtonLogin>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lvh">
        <DialogHeader>
          <DialogTitle className="text-center">
            <p className="text-3xl">Fast Trade, Fast Copy Trade,</p>
            <p className="mt-1 text-3xl">Fast AFK Automation 🚀</p>
          </DialogTitle>
          <div className="mt-2 mb-8">
            <p className="text-center">
              Discover faster, Trading in seconds 🚀 On-chain at the speed of light. Click to trade.
            </p>
            <div className="flex justify-center items-center flex-col gap-4 mt-4">
              <Button
                className="cursor-pointer not-disabled::bg-green-500 hover:not-disabled::bg-green-400"
                onClick={() => onClickLoginByTG()}
              >
                <IconTelegram />
                Connect telegram
              </Button>
              <div className="flex items-center gap-1 cursor-pointer" onClick={onClickOpenModalConnectWallet}>
                <p>Or Sign in With Wallet</p>
                <ArrowRight width={18} />
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  )
}

export default LoginPage
