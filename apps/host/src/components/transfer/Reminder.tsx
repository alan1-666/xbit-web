import { useState } from 'react'
import ButtonGradient from '../common/buttons/ButtonGradient'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export const Reminder = () => {
  const [showReminder, setShowReminder] = useState<boolean>(false)
  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogTrigger asChild className="cursor-pointer">
        <span
          className="inline-flex items-center gap-1 text-[12px] text-[#FFFFFFB2] cursor-pointer"
          onClick={() => setShowReminder(true)}
        >
          预留Arbitrum_ETH
          <span>
            <img src="/images/cryptoDeposit/info-circle.svg" alt="icon info circle" />
          </span>
        </span>
      </DialogTrigger>
      <DialogContent className="w-[335px] mx-auto rounded-[16px] p-[20px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <VisuallyHidden asChild>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>

        <p className="text-[#FFFFFFB2] text-[calc(15rem/16)] mb-4">
          在本次兑换中系统将额外自动兑换 $2.00（约等于 0.00078 ETH），用于未来在 Arbitrum 链上的交易手续费；
        </p>
        <ButtonGradient className="rounded-full w-full" onClick={() => setShowReminder(false)}>
          我知道了
        </ButtonGradient>
      </DialogContent>
    </Dialog>
  )
}
