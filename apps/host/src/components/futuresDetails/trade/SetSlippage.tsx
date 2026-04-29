import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

import InputBorderGradient from './InputBorderGradient'

interface SetSlippageProps {
  open: boolean
  slippage: string
  onOpenChange: (open: boolean) => void
  onConfirm: (value: string) => void
}

const SetSlippage = ({
  open,
  slippage,
  onOpenChange,
  onConfirm,
}: SetSlippageProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const [maxSlippage, setMaxSlippage] = useState<string>(slippage)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMaxSlippage(slippage)
    }
  }, [open, slippage])

  const handleConfirm = () => {
    onConfirm(maxSlippage)
    onOpenChange(false)
  }

  const handleSlippageChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return

    const [intPart, decimalPart] = value.split('.')
    if (decimalPart && decimalPart.length > 2) {
      setMaxSlippage(`${intPart}.${decimalPart.slice(0, 2)}`)
    } else {
      setMaxSlippage(value)
    }
  }

  const Content = (
    <>
      <div className="text-[#A9A9B3] text-sm leading-[21px] mb-4">
        {t('futuresDetails.common.slippageDialogIntrod')}
      </div>

      <InputBorderGradient
        unit="%"
        placeholder={t('tradeSettings.slippage')}
        value={maxSlippage}
        onChange={handleSlippageChange}
        innerBgClassName="bg-[#1F1E25]"
        containerClassName="mb-4 w-full"
        inputClassName="flex-1"
        inputProps={{ ref: inputRef }}
      />

      <Button
        variant="purpleDefault"
        className="w-full h-[44px] rounded-[200px]"
        disabled={Number(maxSlippage) <= 0}
        onClick={handleConfirm}
      >
        {t('futuresDetails.common.confirm')}
      </Button>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#232329] w-[400px] p-4">
          <DialogHeader>
            <DialogTitle className="text-[18px]">
              {t('futuresDetails.common.slippageAjust')}
            </DialogTitle>
          </DialogHeader>

          {Content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="flex items-center justify-between px-4 py-5">
          <DrawerTitle className="text-[18px]">
            {t('futuresDetails.common.slippageAjust')}
          </DrawerTitle>

          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => onOpenChange(false)}
            alt="close"
          />
        </DrawerHeader>

        <div className="px-4 pb-8">{Content}</div>
      </DrawerContent>
    </Drawer>
  )
}

export default SetSlippage
