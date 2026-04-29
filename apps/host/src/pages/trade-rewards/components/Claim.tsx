import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog.tsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { useTradeRewards } from '../hooks/useTradeRewards.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useResponsive } from '@/hooks/useResponsive.ts'

type Reward = {
  id: string
  symbol: string
  amount: string
  usdValue: string
  icon: string
  type: string
}

const RewardDrawer = ({
  banlancelist, 
  onClaimSuccess,
  solPrice
}: {
  banlancelist: any, 
  onClaimSuccess: () => void,
  solPrice?: number
}) => {
  const { isDesktop } = useResponsive()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { claimReward } = useTradeRewards()
  const solTotalUsd = Number(banlancelist?.claimActivityCashback) * Number(solPrice) || 0
  const rewards: Reward[] = [
    { id: '1', symbol: 'SOL',type:"MEME", amount: banlancelist?.claimActivityCashback, usdValue: solTotalUsd, icon: '/images/cryptoDeposit/solana.svg' },
    { id: '2', symbol: 'USDC',type:"PERPETUAL", amount: banlancelist?.claimPerpetualCashback, usdValue: banlancelist?.claimPerpetualCashback, icon: '/images/cryptoDeposit/usdc.svg' },
  ]
  
  const totalClaimedUsd = banlancelist?.totalClaimedUsd || '0'
  const [claimingAll, setClaimingAll] = useState(false)

  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress

  // 一键领取
  const handleClaimToken = async (item:any) => {
    if (Number(item.usdValue) < 5) {
      toast.error(t('Activityrewards.mustBeGreaterThanOrEqualTo'))
      return
    }
    setClaimingAll(true)
    try {
      const res: any = await claimReward(userAddress,item.type)
      if (res.success) {
        if(item.type === 'PERPETUAL'){
          toast.success(t('Activityrewards.claimPerpSuccess'))
        } else {
          toast.success(t('Activityrewards.claimSuccess'))
        }
        setOpen(false)
        onClaimSuccess && onClaimSuccess()
      } else {
        toast.error(t('Activityrewards.claimFailed'))
        setOpen(false)
      }
    } finally {
      setClaimingAll(false)
    }
  }

  const RewardContent = () => (
    <>
      {/* Reward List */}
      <div className="px-4 mt-2 bg-[#141417] rounded-xl">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between py-3 border-b border-[#ECECED14]"
          >
            <div className="flex items-center gap-3">
              <img src={reward.icon} alt={reward.symbol} className="w-8 h-8" />
              <div>
                <div className="text-white text-base font-medium">
                  {reward.amount} {reward.symbol}
                </div>
                <div className="text-sm text-white/70">
                  ${formatNumberWithCommas((reward.usdValue || 0).toString(), 9)}
                </div>
              </div>
            </div>
            <div className="">
              <Button
                variant="link"
                disabled={Number(reward.usdValue) <= 0}
                onClick={() => handleClaimToken(reward)}
                className={`w-full py-3 h-[28px] rounded-full text-white text-[14px] border border-[#908E98] text-[#ffffff]  
                  ${Number(reward.usdValue) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {claimingAll
                  ? t('Activityrewards.claimLoading')
                  : t('Activityrewards.claim')}
              </Button>
            </div>
          </div>
        ))}
        
        {/* Total */}
        <div className="py-4 flex items-center justify-between">
          <div className="text-[#ffffff80] text-[14px]">
            {t('Activityrewards.Totalreceived')}
          </div>
          <div className="text-[#ffffff60] text-[16px]">
            ${formatNumberWithCommas(totalClaimedUsd, 9)}
          </div>
        </div>
      </div>

      {/* Claim All Button */}
      {/* <div className="mt-6">
        <Button
          variant="gradient"
          disabled={Number(availableUsdValue) <= 0}
          onClick={handleClaimAll}
          className={`w-full py-3 h-[44px] rounded-full text-white text-[18px] 
            ${Number(availableUsdValue) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {claimingAll
            ? t('Activityrewards.claimLoading')
            : t('Activityrewards.claimAll')}
        </Button>
      </div> */}
    </>
  )

  // Trigger Button
  const TriggerButton = () => (
    <button
      onClick={() => setOpen(true)}
      className="px-4 h-[36px] bg-[#ffffff] hover:from-[#6A5ACD] hover:to-[#8B008B] text-[#141414] text-[16px] font-medium rounded-full disabled:opacity-50"
    >
      {t('nodeAgent.claimNow')}
    </button>
  )

  // Desktop: Dialog
  // if (isDesktop) {
  //   return (
  //     <Dialog open={open} onOpenChange={setOpen}>
  //       <TriggerButton />

  //       <DialogContent className="w-full bg-[#232329] max-w-[500px] rounded-2xl p-6" showDialogPrimitiveClose={false}>
  //         <DialogHeader className="flex flex-row justify-between items-center pb-4">
  //           <DialogTitle className="text-white text-lg font-medium">
  //             {t('Activityrewards.title')}
  //           </DialogTitle>
  //           <img
  //             src="/images/icons/icon-x.svg"
  //             className="w-6 h-6 cursor-pointer"
  //             onClick={() => setOpen(false)}
  //             alt="close"
  //           />
  //         </DialogHeader>

  //         <RewardContent />
  //       </DialogContent>
  //     </Dialog>
  //   )
  // }

  // Mobile: Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <TriggerButton />

      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 rounded-t-2xl px-2">
        <DrawerHeader className="flex justify-between items-center py-3">
          <DrawerTitle className="text-white text-lg font-medium">
            {t('Activityrewards.title')}
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>

        <RewardContent />
      </DrawerContent>
    </Drawer>
  )
}

export default RewardDrawer