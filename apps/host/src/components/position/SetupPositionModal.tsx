import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatMoney } from '@/utils/helpers'
import { Button } from '@components/ui/button.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import InputPosition from './InputPosition.tsx'

type SetupPositionModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  position: any
  modalType: 'TPSL' | 'CLOSE'
}

const SetupPositionModal = ({ open, setOpen, position, modalType }: SetupPositionModalProps) => {
  const { t } = useTranslation()
  const [siderQuantity, setSiderQuantity] = useState([50])

  const totalValue = 100000

  const [formMockup, setFormMockup] = useState({
    quantity: {
      value: ((totalValue * siderQuantity[0]) / 100).toString(),
      unit: 'USD',
    },
    tpPrice: {
      value: '',
      unit: 'USD',
    },
    slPrice: {
      value: '',
      unit: 'USD',
    },
  })

  const realtimeMockup = {
    price: '26800.00',
    price24hChange: '0.5',
  }

  const mapData = [
    {
      label: t('position.currentPosition'),
      value:
        formatNumber(Number(position.quantity) * (Number(realtimeMockup.price) - Number(position.entryPrice))) +
        ' USDC',
    },
    {
      label: t('position.markPrice'),
      value: formatNumber(position.markPrice),
    },
    {
      label: t('position.indexPrice'),
      value: formatNumber(Number(realtimeMockup.price)),
    },
  ]

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto max-h-[80vh]">
        <DrawerHeader className="px-3 flex w-full items-center justify-between">
          <DialogTitle>
            <div className="text-[18px] font-[500] text-white">
              {modalType === 'TPSL' ? t('position.setupTPSL') : t('position.closePosition')}
            </div>
          </DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="mt-2 mx-3 bg-linear-to-b from-[#3C3C41] to-[#6E787900] rounded-t-[8px]">
          {mapData.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-3 mt-[18px]">
              <div className="font-normal font-[14px] leading-none text-white/70">{item.label}</div>
              <div className="font-medium font-[14px] leading-none text-white">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-[18px] mx-3">
          <InputPosition
            value={formMockup.quantity.value}
            onChange={(value) => {
              setFormMockup((prev) => ({
                ...prev,
                quantity: {
                  ...prev.quantity,
                  value,
                },
              }))
            }}
            unit={formMockup.quantity.unit}
            onSwapUnit={() => {
              setFormMockup((prev) => ({
                ...prev,
                quantity: {
                  ...prev.quantity,
                  unit: prev.quantity.unit === 'USD' ? 'BTC' : 'USD',
                },
              }))
            }}
            placeholder={t('position.quantity')}
          />
          <div className="mt-5 mb-[40px]">
            <SliderGradient
              sliderValue={siderQuantity}
              onSliderValueChange={(value) => {
                setSiderQuantity(value)
                setFormMockup((prev) => ({
                  ...prev,
                  quantity: {
                    ...prev.quantity,
                    value: ((totalValue * value[0]) / 100).toString(),
                  },
                }))
              }}
            />
          </div>
          {modalType === 'TPSL' && (
            <>
              <InputPosition
                className="mt-[14px]"
                value={formMockup.tpPrice.value}
                onChange={(value) => {
                  setFormMockup((prev) => ({
                    ...prev,
                    tpPrice: {
                      ...prev.tpPrice,
                      value,
                    },
                  }))
                }}
                unit={formMockup.tpPrice.unit}
                onSwapUnit={() => {
                  setFormMockup((prev) => ({
                    ...prev,
                    tpPrice: {
                      ...prev.tpPrice,
                      unit: prev.tpPrice.unit === 'USD' ? 'BTC' : 'USD',
                    },
                  }))
                }}
                placeholder={t('position.takeProfit')}
              />
              <InputPosition
                className="mt-[14px]"
                value={formMockup.slPrice.value}
                onChange={(value) => {
                  setFormMockup((prev) => ({
                    ...prev,
                    slPrice: {
                      ...prev.slPrice,
                      value,
                    },
                  }))
                }}
                unit={formMockup.slPrice.unit}
                onSwapUnit={() => {
                  setFormMockup((prev) => ({
                    ...prev,
                    slPrice: {
                      ...prev.slPrice,
                      unit: prev.slPrice.unit === 'USD' ? 'BTC' : 'USD',
                    },
                  }))
                }}
                placeholder={t('position.stopLoss')}
              />
            </>
          )}
        </div>
        <div className="mt-5 h-20 w-full px-3 flex gap-4 items-center">
          <Button
            variant="borderGradient"
            className="rounded-full flex-1 h-11"
            onClick={() => {
              setOpen(false)
            }}
          >
            {t('position.cancel')}
          </Button>
          <Button variant="gradient" className="rounded-full flex-1 h-11 text-[#141414]" onClick={() => {}}>
            {t('position.confirm')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SetupPositionModal
