import React, { useState } from 'react'
import UnlockItem from './UnlockItem.tsx'
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
}> = ({ depositItems, tradeItems, depositUnlockNum, tradeUnlockNum, loading = false }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLogin = useCheckLoginOnArb()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const depositItemsUnlocked = depositItems.filter(item => item.isReached).length
  const tradeItemsUnlocked = tradeItems.filter(item => item.isReached).length

  const handleGoDeposit = () => {
    if (!isLogin) {
      setShowLoginDrawer(true)
      return
    }
    navigate('/perps-deposit')
  }

  const handleGoTrade = () => {
    navigate(getFuturesTradePath())
  }

  return (
    <>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      <div className="px-2 pb-2 pt-6 mb-6 bg-zinc-950 w-full rounded-3xl shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] outline-1 outline-offset-[-1px] outline-white/20 inline-flex flex-col justify-start items-start">
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          <div className="self-stretch flex flex-col justify-start items-start gap-1 px-2">
            <div className="justify-start text-white text-xl font-normal">{t('red.packet.unlock.more')}</div>
            <div className="opacity-60 text-right justify-start text-white text-xs font-normal">{t('red.packet.deposit.to.unlock')}</div>
          </div>
          <div className="self-stretch flex flex-col justify-center items-start gap-6">
            <div className="bg-[url('/images/redpacket/bg-4.webp')] bg-cover bg-center self-stretch px-3 py-6 rounded-[20px] outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="inline-flex flex-col justify-start items-start gap-1">
                  <div className="justify-start text-white text-base font-normal">{t('red.packet.deposit.unlock')}</div>
                  <div className="opacity-60 justify-start text-white text-xs font-normal leading-[1.2]">{t('red.packet.packet.unlocked', { num: depositUnlockNum })}</div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/30 inline-flex flex-col justify-start items-start overflow-hidden">
                  <div className="inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-xs font-normal leading-[1.2] cursor-pointer" onClick={handleGoDeposit}>{t('red.packet.deposit.title')}</div>
                    <img src="/images/redpacket/enter-icon.svg" />
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
            <div className="bg-[url('/images/redpacket/bg-4.webp')] bg-cover bg-center self-stretch px-3 py-6 rounded-[20px] outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="inline-flex flex-col justify-start items-start gap-1">
                  <div className="justify-start text-white text-base font-normal leading-[1.2]">{t('red.packet.trade.unlock')}</div>
                  <div className="opacity-60 justify-start text-white text-xs font-normal leading-[1.2]">{t('red.packet.packet.unlocked', { num: tradeUnlockNum })}</div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-2xl outline-1 outline-offset-[-1px] outline-white/30 inline-flex flex-col justify-start items-start overflow-hidden">
                  <div className="inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-white text-xs font-normal leading-[1.2] cursor-pointer" onClick={handleGoTrade}>{t('red.packet.trade.title')}</div>
                    <img src="/images/redpacket/enter-icon.svg" />
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
