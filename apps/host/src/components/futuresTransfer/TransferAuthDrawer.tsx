import AppDrawer from '@/components/common/AppDrawer'
import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import { cn } from '@/lib/utils'
import React, { FC, useState, useEffect, useCallback, useMemo } from 'react'

type StepStatus = 'pending' | 'loading' | 'completed' | 'failed'

interface StepState {
  status: StepStatus
}

interface TransferAuthDrawerProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  stepStates?: Record<number, StepState>
  onStepStatusChange?: (step: number, status: StepStatus) => void
}

const TransferAuthDrawer: FC<TransferAuthDrawerProps> = ({ open, setOpen, stepStates = {}, onStepStatusChange }) => {
  const [currentStepStates, setCurrentStepStates] = useState<Record<number, StepState>>(stepStates)

  useEffect(() => {
    setCurrentStepStates(stepStates)
  }, [stepStates])

  const updateStepStatus = useCallback(
    (step: number, status: StepStatus) => {
      setCurrentStepStates((prev) => ({
        ...prev,
        [step]: { status },
      }))

      if (onStepStatusChange) {
        onStepStatusChange(step, status)
      }
    },
    [onStepStatusChange],
  )

  const getStepStatus = useCallback(
    (step: number): StepStatus => {
      return currentStepStates[step]?.status || 'pending'
    },
    [currentStepStates],
  )

  const canProceedToStep = useCallback(
    (step: number): boolean => {
      if (step === 1) return true
      for (let i = 1; i < step; i++) {
        if (getStepStatus(i) !== 'completed') return false
      }
      return true
    },
    [getStepStatus],
  )

  const steps = useMemo(
    () => [
      {
        title: '连接',
        description: '将您的钱包连接到 KairoX。',
      },
      {
        title: '授权',
        description: '允许 KairoX 从您的钱包中充值 USDC。',
      },
      {
        title: 'L2 确认',
        description: '确认您的充值详细信息并签署以继续此交易。',
      },
    ],
    [],
  )

  const renderStepIcon = useCallback(
    (stepNumber: number) => {
      const status = getStepStatus(stepNumber)

      switch (status) {
        case 'loading':
          return (
            <svg
              width="19"
              height="20"
              viewBox="0 0 19 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
            >
              <circle cx="10" cy="10" r="7.1875" stroke="#232329" strokeOpacity="0.18" strokeWidth="3.125" />
              <path
                d="M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5"
                stroke="#141414"
                strokeWidth="3.75"
              />
            </svg>
          )
        case 'completed':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path
                d="M12.723 1.08514L13.6325 2.03383C13.8836 2.29581 13.8749 2.71178 13.6129 2.96294L5.95985 10.3C5.70271 10.5466 5.29597 10.5433 5.0428 10.2927L1.13819 6.4276C0.880271 6.17228 0.878155 5.75622 1.13347 5.4983L2.05805 4.56427C2.29369 4.32615 2.66633 4.30604 2.92513 4.50516L2.98731 4.55958L5.2988 6.84802C5.42537 6.97334 5.62874 6.97498 5.75732 6.85173L11.7938 1.06552C12.0558 0.814444 12.4718 0.823229 12.723 1.08514Z"
                fill="#261236"
              />
            </svg>
          )
        case 'failed':
          return (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.41421 7L12.7071 2.70711C13.0976 2.31658 13.0976 1.68342 12.7071 1.29289C12.3166 0.902369 11.6834 0.902369 11.2929 1.29289L7 5.58579L2.70711 1.29289C2.31658 0.902369 1.68342 0.902369 1.29289 1.29289C0.902369 1.68342 0.902369 2.31658 1.29289 2.70711L5.58579 7L1.29289 11.2929C0.902369 11.6834 0.902369 12.3166 1.29289 12.7071C1.68342 13.0976 2.31658 13.0976 2.70711 12.7071L7 8.41421L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L8.41421 7Z"
                fill="#FF353C"
              />
            </svg>
          )
        default:
          return stepNumber
      }
    },
    [getStepStatus],
  )

  const getStepBackground = useCallback(
    (stepNumber: number) => {
      const status = getStepStatus(stepNumber)

      switch (status) {
        case 'completed':
          return 'linear-gradient(45deg, #E843FE,#fff,#00FFCD)'
        case 'failed':
          return 'linear-gradient(45deg, #E843FE,#fff,#00FFCD)'
        case 'loading':
          return 'linear-gradient(45deg, #E843FE,#fff,#00FFCD)'
        default:
          return 'linear-gradient(45deg, #9945FF40,#00F3AB20)'
      }
    },
    [getStepStatus],
  )

  const getStepBorderClass = useCallback(
    (stepNumber: number) => {
      const status = getStepStatus(stepNumber)
      return status === 'pending' ? 'border-[0.5px] border-[#ECECED1F]' : ''
    },
    [getStepStatus],
  )

  const handleStepClick = useCallback(
    (stepNumber: number) => {
      if (!canProceedToStep(stepNumber)) return

      const currentStatus = getStepStatus(stepNumber)

      if (currentStatus === 'pending') {
        updateStepStatus(stepNumber, 'loading')
        setTimeout(() => {
          updateStepStatus(stepNumber, 'completed')
        }, 2000)
      }
    },
    [canProceedToStep, getStepStatus, updateStepStatus],
  )

  const renderStep = useCallback(
    (stepNumber: number) => {
      const status = getStepStatus(stepNumber)
      const canProceed = canProceedToStep(stepNumber)
      const isDisabled = !canProceed && status === 'pending'

      return (
        <div key={stepNumber} className="flex items-center gap-2 mt-10 first:mt-0">
          <div
            style={{ background: getStepBackground(stepNumber) }}
            className={cn(
              'w-8 h-8 rounded-full inline-flex items-center justify-center relative',
              getStepBorderClass(stepNumber),
            )}
            onClick={() => !isDisabled && handleStepClick(stepNumber)}
          >
            {stepNumber < 3 && (
              <div className="h-[48px] border-l border-dashed border-gray-500 mt-0.5 left-1/2 -translate-x-1/2 w-0 absolute top-full"></div>
            )}
            <div className="flex items-center justify-center w-full h-full">{renderStepIcon(stepNumber)}</div>
          </div>
          <div >
            <h5 className="text-white text-base">{steps[stepNumber - 1].title}</h5>
            <p>{steps[stepNumber - 1].description}</p>
          </div>
        </div>
      )
    },
    [getStepStatus, canProceedToStep, getStepBackground, getStepBorderClass, handleStepClick, renderStepIcon, steps],
  )

  const handleConnect = useCallback(() => {
    // Handle connect action
  }, [])

  const hasAnyCompleted = useMemo(() => {
    return Object.values(currentStepStates).some((state) => state.status === 'completed')
  }, [currentStepStates])

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title="连接"
      drawerClassName="bg-[url('/images/tokenDetail/bg_top_100.png')] bg-no-repeat bg-center bg-cover"
      drawerHeaderClassName="py-[14px]"
      drawerContent={
        <div className="mt-4 text-[13px] text-[#FFFFFF80]">
          {renderStep(1)}
          {renderStep(2)}
          {renderStep(3)}

          {/* Risk Warning */}
          <div className="mt-6 p-2 rounded-lg bg-gradient-to-r from-[#FF1D1D1A] to-[#BB00351A]">
            <div className="flex items-center gap-2 text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.00276 9.83318C7.72943 9.83327 7.5027 9.60667 7.50261 9.33333L7.50161 6C7.50153 5.72667 7.72813 5.49993 8.00146 5.49985C8.2748 5.49977 8.50153 5.72637 8.50161 5.9997L8.50261 9.33303C8.5027 9.60637 8.2761 9.8331 8.00276 9.83318Z"
                  fill="#FF353C"
                />
                <path
                  d="M8.003 11.9998C7.963 11.9999 7.91634 11.9932 7.86967 11.9865C7.82967 11.9799 7.78966 11.9666 7.74965 11.9466C7.70965 11.9333 7.66964 11.9133 7.62964 11.8866C7.5963 11.86 7.56295 11.8333 7.52961 11.8066C7.40958 11.68 7.33619 11.5067 7.33614 11.3334C7.33609 11.16 7.40937 10.9867 7.52933 10.86C7.56265 10.8333 7.59598 10.8066 7.62931 10.78C7.6693 10.7533 7.70929 10.7333 7.74929 10.7199C7.78928 10.6999 7.82928 10.6866 7.86928 10.6799C7.95594 10.6599 8.04927 10.6598 8.12928 10.6798C8.17594 10.6865 8.21595 10.6998 8.25595 10.7198C8.29596 10.7331 8.33596 10.7531 8.37597 10.7797C8.40931 10.8064 8.44265 10.833 8.476 10.8597C8.59603 10.9863 8.66942 11.1596 8.66947 11.333C8.66952 11.5063 8.59624 11.6797 8.47628 11.8064C8.44295 11.833 8.40963 11.8597 8.3763 11.8864C8.33631 11.9131 8.29632 11.9331 8.25632 11.9464C8.21633 11.9664 8.17633 11.9798 8.12967 11.9865C8.08967 11.9931 8.043 11.9998 8.003 11.9998Z"
                  fill="#FF353C"
                />
                <path
                  d="M12.0445 14.7718L3.96453 14.7742C2.66453 14.7746 1.67106 14.3016 1.16414 13.4484C0.66388 12.5952 0.730217 11.4952 1.36321 10.355L5.40103 3.08715C6.06734 1.88695 6.98714 1.22667 8.00047 1.22637C9.01381 1.22606 9.934 1.88579 10.601 3.08559L14.6432 10.3577C15.2769 11.4975 15.3505 12.5908 14.8441 13.451C14.3377 14.2978 13.3445 14.7714 12.0445 14.7718ZM8.00077 2.22637C7.37411 2.22655 6.76092 2.70674 6.27451 3.57355L2.24336 10.8481C1.79027 11.6616 1.71716 12.4083 2.03065 12.9482C2.34415 13.4881 3.03757 13.7812 3.9709 13.7809L12.0509 13.7785C12.9842 13.7782 13.6708 13.4847 13.9907 12.9446C14.3105 12.4045 14.2303 11.6645 13.7767 10.8446L9.72784 3.57251C9.24092 2.70599 8.62744 2.22618 8.00077 2.22637Z"
                  fill="#FF353C"
                />
              </svg>
              <span className="text-[11px]">
                风险提示风险提示风险提示风险提示风险提示风险提示风险提示风险提示风险提示
              </span>
            </div>
          </div>

         <div className="mt-6 py-3">
             <ButtonShadowGradient
            className="h-11 text-center text-white w-full bg-transparent rounded-[200px]"
            disabled={true}
            onClick={handleConnect}
          >
            连接
          </ButtonShadowGradient>
         </div>
        </div>
      }
    />
  )
}

export default TransferAuthDrawer
