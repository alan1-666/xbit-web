import React, { useState } from 'react'
import UnlockItem from './UnlockItem.tsx'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { ChainIds } from '@/types/enums.ts'
import { useAppDispatch } from '@/redux/store'
import { useNavigate } from 'react-router-dom'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'

const UnlockMoreCard: React.FC<{ 
  depositItems: any[]; 
  tradeItems: any[];
  depositUnlockNum: number;
  tradeUnlockNum: number;
  loading?: boolean;
}> = ({ depositItems, tradeItems, depositUnlockNum, tradeUnlockNum, loading = false  }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLogin = useCheckLoginOnArb()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const handleGoDeposit = () => {
    if (!isLogin) {
      setShowLoginDrawer(true)
      return
    }
    dispatch(
      exchangeActions.openExchangeDialog({
        defaultTab: 'deposit',
        defaultChainId: ChainIds.Arbitrum,
      }),
    )
  }
  
  const handleGoTrade = () => {
    navigate(getFuturesTradePath())
  }
  

  return (
    <>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      <div className="mb-6 w-full rounded-3xl inline-flex flex-col justify-start items-start">
      <div className="w-full">
        <div className="self-stretch flex items-center justify-between gap-10 mb-6">
          <div className="justify-start text-white text-xl font-normal">{t('red.packet.unlock.more')}</div>
          <div className="opacity-60 text-right justify-start text-white text-xs font-normal">{t('red.packet.deposit.to.unlock')}</div>
        </div>
        <div className="self-stretch flex items-start gap-6">
          <div className="bg-[url('/images/redpacket/bg-4.webp')] bg-cover bg-center  flex-1 self-stretch px-3 py-6 rounded-[20px] outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-5">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="w-36 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-white text-base font-normal">{t('red.packet.deposit.unlock')}</div>
                <div className="self-stretch opacity-60 justify-start text-white text-xs font-normal">{t('red.packet.packet.unlocked', { num: depositUnlockNum })}</div>
              </div>
              <div 
                className="p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/30 inline-flex flex-col justify-start items-start overflow-hidden cursor-pointer"
                onClick={handleGoDeposit}
              >
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-xs font-normal leading-4">{t('red.packet.deposit.title')}</div>
                  <img src="/images/redpacket/enter-icon.svg"/>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="self-stretch px-3 py-2.5 bg-[#262626] rounded-2xl flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-2">
                        <Skeleton className="w-5 h-5 rounded-lg" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                depositItems.map((it, idx) => (
                  <UnlockItem key={idx} {...it} />
                ))
              )}
            </div>
          </div>
          <div className="bg-[url('/images/redpacket/bg-4.webp')] bg-cover bg-center  flex-1 self-stretch px-3 py-6 rounded-[20px] outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-5">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="w-36 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-white text-base font-normal leading-5">{t('red.packet.trade.unlock')}</div>
                <div className="self-stretch opacity-60 justify-start text-white text-xs font-normal leading-4">{t('red.packet.packet.unlocked', { num: tradeUnlockNum })}</div>
              </div>
              <div className="p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/30 inline-flex flex-col justify-start items-start overflow-hidden cursor-pointer"
                onClick={handleGoTrade}
              >
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-white text-xs font-normal leading-4">{t('red.packet.trade.title')}</div>
                   <img src="/images/redpacket/enter-icon.svg"/>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-3 ">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="self-stretch px-3 py-2.5 bg-[#262626] rounded-2xl flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-2">
                        <Skeleton className="w-5 h-5 rounded-lg" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                tradeItems.map((it, idx) => (
                  <UnlockItem key={idx} {...it} />
                ))
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
    </>
  )
}

export default UnlockMoreCard
