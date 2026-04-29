import AppDrawer from '@/components/common/AppDrawer'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface MessageDrawerProps {
  open: boolean
  type: 'info' | 'error' | 'warning'
  text: string
  buttonTitle: string
  onClose: (isBtnClick: boolean) => void
}

export const MessageDrawer = ({ open, type, text, buttonTitle, onClose }: MessageDrawerProps) => {
  const [show, setShow] = useState(open)
  const { isDesktop } = useResponsive()

  const navigate = useNavigate()
  useEffect(() => {
    setShow(open)
  }, [open])

  const handleClose = (isBtnClick: boolean = false) => {
    setShow(false)
    onClose(isBtnClick)
  }
  return (
    <AppDrawer
      isShowBgImg={false}
      setOpen={(val) => {
        setShow(val)
        if (!val) onClose(false)
        handleClose()
      }}
      open={show}
      title={
        <div className="bg-[#EC46991A] size-11 p-2.5 rounded-full">
          {type === 'info' && <img src="/images/cryptoDeposit/info.svg" alt="icon info" />}
          {type === 'error' && <img src="/images/cryptoDeposit/error.svg" alt="icon error" />}
          {type === 'warning' && <img src="/images/cryptoDeposit/info.svg" alt="icon warning" />}
        </div>
      }
      drawerContentClassName={isDesktop ? 'pb-0' : ''}
      drawerContent={
        <div className={cn(!isDesktop ? 'pb-6' : '')}>
          <p className="text-[calc(14rem/16)] text-[#FFFFFFB2]">{text}</p>
          <Button
            variant="gradient"
            className="rounded-full w-full text-[calc(14rem/16)] mt-6 text-[#141414]"
            onClick={() => handleClose(true)}
          >
            {buttonTitle}
          </Button>
        </div>
      }
    />
  )
}
