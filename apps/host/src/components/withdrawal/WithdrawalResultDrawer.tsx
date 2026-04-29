import { Ref, useImperativeHandle, useState } from 'react'
import { Drawer, DrawerContent } from '@components/ui/drawer.tsx'
import { IconChevronLeft } from '@components/icon'
import { cn } from '@/lib/utils.ts'
import { Button } from '@components/ui/button.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'

export interface WithdrawalResultDrawerMessage {
  type: 'success' | 'failed'
  amount: number
  unit: string
  title: string
  message: string
  buttonText: string
  onClick: () => void
}

const IconSuccess = () => (
  <svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50.3324" cy="50.3333" r="40.8333" fill="url(#paint0_linear_22905_566549)" fill-opacity="0.1" />
    <circle
      cx="50.5"
      cy="50.5"
      r="49.75"
      stroke="url(#paint1_linear_22905_566549)"
      stroke-width="0.5"
      stroke-dasharray="6 6"
    />
    <circle
      cx="50.3324"
      cy="50.3333"
      r="40.4167"
      stroke="url(#paint2_linear_22905_566549)"
      stroke-width="0.833333"
      stroke-linecap="round"
      stroke-dasharray="0.33 10"
    />
    <circle cx="14.1694" cy="85.5" r="3" fill="#AB57FF" />
    <circle cx="84.9976" cy="13.833" r="3" fill="#00FFB4" />
    <path
      d="M39.9951 50.5L47.4951 58L62.4951 43"
      stroke="#00FFB4"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_22905_566549"
        x1="31.2768"
        y1="88.6807"
        x2="91.238"
        y2="9.55483"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#E149F8" />
        <stop offset="0.28" stop-color="#9945FF" />
        <stop offset="0.92" stop-color="#00F3AB" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_22905_566549"
        x1="0.500003"
        y1="97.456"
        x2="100.5"
        y2="97.456"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stop-color="#9945FF" />
        <stop offset="1" stop-color="#00F3AB" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_22905_566549"
        x1="9.49903"
        y1="88.6807"
        x2="91.1657"
        y2="88.6807"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stop-color="#9945FF" />
        <stop offset="1" stop-color="#00F3AB" />
      </linearGradient>
    </defs>
  </svg>
)

const IconFailed = () => (
  <svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50.3324" cy="50.3333" r="40.8333" fill="url(#paint0_linear_22905_566651)" fill-opacity="0.1" />
    <circle
      cx="50.5"
      cy="50.5"
      r="49.75"
      stroke="url(#paint1_linear_22905_566651)"
      stroke-width="0.5"
      stroke-dasharray="6 6"
    />
    <circle
      cx="50.3324"
      cy="50.3333"
      r="40.4167"
      stroke="url(#paint2_linear_22905_566651)"
      stroke-width="0.833333"
      stroke-linecap="round"
      stroke-dasharray="0.33 10"
    />
    <circle cx="14.1694" cy="85.5" r="3" fill="#AB57FF" />
    <circle cx="84.9976" cy="13.833" r="3" fill="#00FFB4" />
    <path
      d="M60.375 41.125L41.625 59.875"
      stroke="#AB57FF"
      stroke-width="4.9875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M41.625 41.125L60.375 59.875"
      stroke="#AB57FF"
      stroke-width="4.9875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_22905_566651"
        x1="31.2768"
        y1="88.6807"
        x2="91.238"
        y2="9.55483"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#E149F8" />
        <stop offset="0.28" stop-color="#9945FF" />
        <stop offset="0.92" stop-color="#00F3AB" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_22905_566651"
        x1="0.500003"
        y1="97.456"
        x2="100.5"
        y2="97.456"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stop-color="#9945FF" />
        <stop offset="1" stop-color="#00F3AB" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_22905_566651"
        x1="9.49903"
        y1="88.6807"
        x2="91.1657"
        y2="88.6807"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stop-color="#9945FF" />
        <stop offset="1" stop-color="#00F3AB" />
      </linearGradient>
    </defs>
  </svg>
)

export interface WithdrawalResultDrawerHandle {
  show: (message: WithdrawalResultDrawerMessage) => void
}

export interface WithdrawalResultDrawerProps {
  ref: Ref<WithdrawalResultDrawerHandle>
}

export const WithdrawalResultDrawer = (props: WithdrawalResultDrawerProps) => {
  const { ref } = props
  const [message, setMessage] = useState<WithdrawalResultDrawerMessage | null>(null)

  useImperativeHandle(ref, () => {
    return {
      show: (message: WithdrawalResultDrawerMessage) => {
        setMessage(message)
      },
    }
  })

  const isSuccess = message?.type === 'success'

  return (
    <Drawer open={!!message} onClose={() => setMessage(null)}>
      <DrawerContent className="h-screen w-screen bg-[url('/images/walletCopy/bg_setting.png')] max-w-[786px] mx-auto bg-cover bg-center overflow-hidden px-5 border-none rounded-none">
        <DialogTitle></DialogTitle>
        <div className="py-6 flex flex-col h-full">
          <button onClick={() => setMessage(null)} type="button">
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex flex-col justify-center items-center">
            {isSuccess ? <IconSuccess /> : <IconFailed />}
            <div className={cn('mt-2 text-[calc(32rem/16)] font-semibold', isSuccess ? 'text-rise' : 'text-fall')}>
              {message?.amount} <span className="text-[calc(24rem/16)]">{message?.unit}</span>
            </div>
            <div className="text-[calc(24rem/16)] font-semibold mb-1">{message?.title}</div>
            <div className="text-center text-[calc(14rem/16)] text-[#FFFFFFB2]">{message?.message}</div>
          </div>
          <div className="pb-4">
            <Button variant="borderGradient" className="w-full rounded-full h-11"
              onClick={() => {
                setMessage(null)
                message?.onClick()
              }}
            >
              {message?.buttonText}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
