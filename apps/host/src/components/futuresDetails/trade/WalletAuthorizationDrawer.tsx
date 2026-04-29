import AppDrawer from '@/components/common/AppDrawer'
import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import { cn } from '@/lib/utils'
import React, { FC, useState, useEffect } from 'react'

interface WalletAuthorizationDrawerProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>

  initialCompletedSteps?: number[]
  onStepComplete?: (step: number) => void
}

const WalletAuthorizationDrawer: FC<WalletAuthorizationDrawerProps> = ({
  open,
  setOpen,
  initialCompletedSteps = [],
  onStepComplete,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps)

  useEffect(() => {
    setCompletedSteps(initialCompletedSteps)
  }, [initialCompletedSteps])

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      const newCompletedSteps = [...completedSteps, step]
      setCompletedSteps(newCompletedSteps)

      if (onStepComplete) {
        onStepComplete(step)
      }
    }
  }

  const isStepCompleted = (step: number) => completedSteps.includes(step)

  const canProceedToStep2 = isStepCompleted(1)

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title="链接"
      drawerClassName="bg-[url('/images/tokenDetail/bg_top_100.png')] bg-no-repeat bg-center bg-cover"
      drawerHeaderClassName="py-[14px]"
      drawerContent={
        <div className="mt-2 text-[13px] text-[#FFFFFF80] ">
          <div className="flex items-center gap-2">
            <div
              style={{
                background: isStepCompleted(1)
                  ? 'linear-gradient(45deg, #E843FE,#fff,#00FFCD)'
                  : 'linear-gradient(45deg, #9945FF40,#00F3AB20)',
              }}
              className={cn("w-8 h-8 rounded-full  inline-flex items-center justify-center relative",
                !isStepCompleted(1) ? 'border-[0.5px] border-[#ECECED1F]' : '')}
              onClick={() => completeStep(1)}
            >
              <div className="h-[48px] border-l border-dashed border-gray-500 mt-0.5 left-1/2 -translate-x-1/2 w-0 absolute top-full"></div>
              {isStepCompleted(1) ? <img src="/images/wallets/close-circle.svg" className=" w-4 h-4" alt="close-circle" /> : 1}
            </div>
            <div>
              <h5 className="text-white text-base">授权</h5>
              <p>允许 KairoX 从您的钱包中充值 ETH。</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-10">
            <div
              style={{ background: 'linear-gradient(45deg, #9945FF40,#00F3AB20)' }}
              className={`w-8 h-8 rounded-full border-[0.5px] border-[#ECECED1F] inline-flex items-center justify-center relative ${!canProceedToStep2 ? 'opacity-50' : ''}`}
              onClick={() => canProceedToStep2 && completeStep(2)}
            >
              2
              {isStepCompleted(2) && (
                <img src="/images/wallets/close-circle.svg" className="absolute -top-1 -right-1 w-4 h-4" alt="close-circle" />
              )}
            </div>
            <div className={!canProceedToStep2 ? 'opacity-50' : ''}>
              <h5 className="text-white text-base">L2 确认</h5>
              <p>确认您的充值详细信息并签署以继续此交易。</p>
            </div>
          </div>
          <ButtonShadowGradient
            className="h-11 text-center text-white mt-8 w-full bg-transparent rounded-[200px]"
            disabled={!isStepCompleted(2)}
            onClick={() => {
            }}
          >
            {!isStepCompleted(1) ? '链接' : '重新链接'}
          </ButtonShadowGradient>
        </div>
      }
    />
  )
}

export default WalletAuthorizationDrawer
