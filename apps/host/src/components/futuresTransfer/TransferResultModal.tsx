import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import { cn } from '@/lib/utils'
import React, { FC } from 'react'
import HeaderWithBack from '../header/HeaderWithBack'

type ResultType = 'success' | 'failed'

interface TransferResultModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  type: ResultType
  amount: string
  currency: string
  description?: string
  onButtonClick?: () => void
  buttonText?: string
}

const TransferResultModal: FC<TransferResultModalProps> = ({
  open,
  setOpen,
  type,
  amount,
  currency,
  description,
  onButtonClick,
  buttonText,
}) => {
  if (!open) return null

  const isSuccess = type === 'success'

  const defaultDescription = isSuccess
    ? `您的 ${currency} 已发送至您的合约账户。`
    : '失败原因失败原因失败原因失败原因失败原因失败原因失败原因失败原因失败原因失败原因失败原因失败原因'

  const defaultButtonText = isSuccess ? '去交易' : '查看详情'

  const SuccessIcon = () => (
    <svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50.3324" cy="50.3333" r="40.8333" fill="url(#paint0_linear_success)" fillOpacity="0.1" />
      <circle
        cx="50.5"
        cy="50.5"
        r="49.75"
        stroke="url(#paint1_linear_success)"
        strokeWidth="0.5"
        strokeDasharray="6 6"
      />
      <circle
        cx="50.3324"
        cy="50.3333"
        r="40.4167"
        stroke="url(#paint2_linear_success)"
        strokeWidth="0.833333"
        strokeLinecap="round"
        strokeDasharray="0.33 10"
      />
      <circle cx="14.1689" cy="85.5" r="3" fill="#AB57FF" />
      <circle cx="84.9971" cy="13.833" r="3" fill="#00FFB4" />
      <path
        d="M39.9951 50.5L47.4951 58L62.4951 43"
        stroke="#00FFB4"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_success"
          x1="31.2768"
          y1="88.6807"
          x2="91.238"
          y2="9.55483"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E149F8" />
          <stop offset="0.28" stopColor="#9945FF" />
          <stop offset="0.92" stopColor="#00F3AB" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_success"
          x1="0.500003"
          y1="97.456"
          x2="100.5"
          y2="97.456"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="#9945FF" />
          <stop offset="1" stopColor="#00F3AB" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_success"
          x1="9.49903"
          y1="88.6807"
          x2="91.1657"
          y2="88.6807"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="#9945FF" />
          <stop offset="1" stopColor="#00F3AB" />
        </linearGradient>
      </defs>
    </svg>
  )

  const FailedIcon = () => (
    <svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50.3324" cy="50.3333" r="40.8333" fill="url(#paint0_linear_failed)" fillOpacity="0.1" />
      <circle
        cx="50.5"
        cy="50.5"
        r="49.75"
        stroke="url(#paint1_linear_failed)"
        strokeWidth="0.5"
        strokeDasharray="6 6"
      />
      <circle
        cx="50.3324"
        cy="50.3333"
        r="40.4167"
        stroke="url(#paint2_linear_failed)"
        strokeWidth="0.833333"
        strokeLinecap="round"
        strokeDasharray="0.33 10"
      />
      <circle cx="14.1689" cy="85.5" r="3" fill="#AB57FF" />
      <circle cx="84.9971" cy="13.833" r="3" fill="#00FFB4" />
      <path
        d="M60.375 41.125L41.625 59.875"
        stroke="#AB57FF"
        strokeWidth="4.9875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41.625 41.125L60.375 59.875"
        stroke="#AB57FF"
        strokeWidth="4.9875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_failed"
          x1="31.2768"
          y1="88.6807"
          x2="91.238"
          y2="9.55483"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E149F8" />
          <stop offset="0.28" stopColor="#9945FF" />
          <stop offset="0.92" stopColor="#00F3AB" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_failed"
          x1="0.500003"
          y1="97.456"
          x2="100.5"
          y2="97.456"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="#9945FF" />
          <stop offset="1" stopColor="#00F3AB" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_failed"
          x1="9.49903"
          y1="88.6807"
          x2="91.1657"
          y2="88.6807"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="#9945FF" />
          <stop offset="1" stopColor="#00F3AB" />
        </linearGradient>
      </defs>
    </svg>
  )

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else {
      setOpen(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false)
    }
  }

  return (
    <div
      className="fixed z-50 flex items-center justify-center max-w-[768px] left-50% top-0 bottom-0 w-full"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center " />

      <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
        <HeaderWithBack title={''} className="bg-transparent" />
        <div className="flex-1 flex flex-col items-center py-10 mt-[61.5px]">
          <div>{isSuccess ? <SuccessIcon /> : <FailedIcon />}</div>

          <div className="space-y-2">
            <h1 className={cn('text-[32px] font-bold leading-8 mt-4', isSuccess ? 'text-[#00FFB4]' : 'text-[#AB57FF]')}>
              {amount} <span className="text-2xl">{currency}</span>
            </h1>

            <h2 className="text-2xl font-semibold text-white">{isSuccess ? '已到账' : '划转失败'}</h2>
          </div>

          <p className="text-xs text-[#FFFFFF70] px-4 mt-3">{description || defaultDescription}</p>
        </div>

        <div className="w-full px-6 pb-8">
          <button
            className="h-12 text-center text-white w-full bg-transparent rounded-[200px] relative"
            onClick={handleButtonClick}
            style={{
              background:
                ' linear-gradient(37deg, color(display-p3 0.8824 0.2863 0.9725 / 0.10) 13.23%, color(display-p3 0.6 0.2706 1 / 0.10) 37.52%, color(display-p3 0 0.9529 0.6706 / 0.10) 93.06%)',
            }}
          >
            <span
              style={{
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '200px',
                padding: '0.5px',
                background: 'linear-gradient(37deg, #9945FF40,#ffffff40, #19FB9B40)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                zIndex: 1,
              }}
            />
            {buttonText || defaultButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransferResultModal
