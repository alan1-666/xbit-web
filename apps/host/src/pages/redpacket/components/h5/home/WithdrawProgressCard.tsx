import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { WithdrawalStatus } from '@/@generated/gql/graphql-redpacket'

import { WITHDRAW_RED_PACKET_MUTATION } from '@/services/redpacket.service.ts'
import { WithdrawConfirmModal } from '../../ConfirmModal'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface WithdrawProgressCardProps {
  availableBalance: string
  onWithdraw?: () => void
  withdrawalThreshold: number
  withdrawalEnabledWeb?: boolean
  onOpenDownloadAppModal?: () => void
}
const WithdrawProgressCard: React.FC<WithdrawProgressCardProps> = ({ 
  availableBalance, 
  onWithdraw, 
  withdrawalThreshold,
  withdrawalEnabledWeb,
  onOpenDownloadAppModal
}) => {
  const { t } = useTranslation()
  const isWithdrawalEnabledWeb = withdrawalEnabledWeb !== false

  const percent = Math.min(100, Math.max(0, (parseFloat(availableBalance || '0') / withdrawalThreshold) * 100))
  const barRef = useRef<HTMLDivElement | null>(null)
  const INDICATOR_WIDTH = 129
  const [clampedPercent, setClampedPercent] = useState<number>(percent)

  const [isOpenWithdrawConfirmModal, setIsOpenWithdrawConfirmModal] = useState<boolean>(false)
  

  useEffect(() => {
    const compute = () => {
      const barWidth = barRef.current?.clientWidth || 1
      const containerWidth = barWidth + 100

      const halfIndicator = INDICATOR_WIDTH / 2
      const minPercent = (halfIndicator / containerWidth) * 100
      const maxPercent = 100 - minPercent
      const clamped = Math.min(maxPercent, Math.max(minPercent, percent))
      setClampedPercent(clamped)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [percent])

  // 三角形定位：直接使用 percent，让三角形中心对准进度条右边缘
  const dotPercent = Math.min( percent > 98 ? 98 : 100, Math.max(1, percent))

  const handleClaim = async () => {
    try {
      const res = await redpacketClient.mutate({
        mutation: WITHDRAW_RED_PACKET_MUTATION,
        variables: {},
      })
      if (res.data?.withdrawRedPacket?.status !== WithdrawalStatus.Failed) {
        toast.success(t('red.packet.withdraw.result.tips'))
        if (res.data?.withdrawRedPacket?.status === WithdrawalStatus.Completed) {
          onWithdraw && onWithdraw()
       }
      } else {
        // toast.error('Withdraw request failed. Please try again later.')
      }

    } catch (error:any) {
      toast.error(error?.[0]?.message || 'Withdraw request failed. Please try again later.')
    }
    // onWithdraw && onWithdraw()
  }

  const hanleWithdrawClick = () => {
     if (!isWithdrawalEnabledWeb) {
      onOpenDownloadAppModal?.()
      return
    }
    setIsOpenWithdrawConfirmModal(true)
  }
  const handleWithdrawConfirmModal = (status: boolean, action: 'cancel' | 'confirm') => {
      setIsOpenWithdrawConfirmModal(status)
      if (action === 'confirm') {
        handleClaim()
      }
    
  }
  return (
    <div className="aspect-[693/312] relative bg-[url('/images/redpacket/bg-2.png')] bg-cover bg-center w-full mb-6 p-6 bg-gradient-to-b from-zinc-950 to-zinc-950/0 rounded-[20px] shadow-[inset_0px_11px_30px_0px_rgba(255,42,106,0.16)] outline-1 outline-offset-[-1px] outline-white/20 inline-flex flex-col justify-start items-start gap-8">
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="w-48 flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-white text-xl font-normal">{t('red.packet.withdraw.threshold')}</div>
            <div className="self-stretch opacity-60 justify-start text-white text-xs font-normal">{t('red.packet.accumulate.withdraw', { num: withdrawalThreshold })}</div>
          </div>
          <div className="inline-flex justify-start items-end gap-[3px]">
            <div className="text-right justify-start text-white text-4xl font-bold">{availableBalance}</div>
            <div className="pb-2 flex justify-center items-center gap-2.5">
              <div className="justify-start text-white text-xs font-normal">USDC</div>
            </div>
          </div>
        </div>
        <div className="self-stretch pt-12 flex flex-col justify-start items-center gap-px relative">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="w-full h-2  rounded relative" ref={barRef}>
              <img className="w-full absolute top-0 left-0 right-0 h-2 opacity-30  rounded" src="/images/redpacket/progress-bar.png" />
              <div 
                className={cn("absolute top-0 left-0 h-2 bg-gradient-to-r from-[#F10609] to-[#FE3E3E] rounded max-w-full min-w-[8px]" , '')}
                style={{ width: `${percent}%` }}
              />

           
            </div>
            <div
              id="indicator-brand"
              className="absolute top-0 w-[129px] bg-gradient-to-r from-[#F10609] to-[#FE3E3E] rounded-[200px] py-1"
              style={{ left: `${clampedPercent}%`, transform: 'translateX(-50%)' }}
            >
               <div className="self-stretch text-center justify-start text-white text-xs font-bold">
                {Number(availableBalance) < withdrawalThreshold ? (() => {
                  const diff = withdrawalThreshold - parseFloat(availableBalance || '0')
                  return Number.isInteger(diff) ? diff.toString() : diff.toFixed(2)
                })() : availableBalance} USDC
              </div>
              <div className="self-stretch text-center justify-start text-white text-xs font-light">
                {Number(availableBalance) < withdrawalThreshold ? t('red.packet.more.to.withdraw') : <span className='text-[#FFD209]'>{t('red.packet.withdrawable')}</span>}
              </div>
            </div>

            {/* triangle indicator dot positioned by percent (follows progress width) */}
            <div
              id="indicator-dot"
              style={{
                position: 'absolute',
                bottom: '37px',
                left: `${dotPercent}%`,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid #FE3E3E'
              }}
            />

           

            
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="opacity-60 justify-start text-white text-xs font-normal">0 USDC</div>
              <div className="opacity-60 text-right justify-start text-white text-xs font-normal">{withdrawalThreshold} USDC</div>
            </div>
          </div>

        </div>
      </div>
      <div className="text-center bg-white/10 rounded-[20px] flex items-center shadow-[inset_0px_-1px_4px_0px_rgba(255,255,255,0.25),inset_2px_2px_4px_0px_rgba(255,255,255,0.25)] backdrop-blur-3px  justify-center px-5 py-2 w-full" onClick={hanleWithdrawClick}>
        <img className="w-6 h-5 mr-2.5" src="/images/redpacket/gift.png"/>
        <div className={cn(" text-white text-xs font-medium ", Number(availableBalance) < withdrawalThreshold ? "cursor-not-allowed" : 'cursor-pointer')}>
            {t('red.packet.claim')}
        </div>
      </div>
      <WithdrawConfirmModal 
        isOpen={isOpenWithdrawConfirmModal}
        onOpenChange={handleWithdrawConfirmModal}
       />
    </div>
  )
}

export default WithdrawProgressCard
