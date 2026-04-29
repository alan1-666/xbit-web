import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { MathFun } from '@/lib/utils'
import { selectAllPerpMeta, selectSzMap, selectSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import InputBorderGradient from '@components/futuresDetails/trade/InputBorderGradient'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useMutation } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useCurrencySwitch } from '../../hooks/useCurrencySwitch'
import { useInitFormValues } from '../../hooks/useInitFormValues'
import { useSliderSync } from '../../hooks/useSliderSync'
import { convertSizeToBase, formatSize, getAdjustedTriggerPrice, handleSizeChange, isHyperOrderSuccess } from '../tools'
import { xPositions, xBuilderInfo } from '../types'
import { submitMarketCloseOrder } from './SubmitMarketCloseOrder'
import { builderSelector, agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import useCustomToast from '@/hooks/useCustomToast'
import { useTranslation } from 'react-i18next'
import { updatePositionsFromWebData2 } from '@/redux/modules/userPosition.Slice'

interface MarketPriceCloseButtonPrpos {
  info: xPositions
  setDisableNavigte?: Dispatch<SetStateAction<boolean>>
}

type FormValues = {
  size: string
}

const MarketPriceCloseButton = ({ info, setDisableNavigte }: MarketPriceCloseButtonPrpos) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { showToast } = useCustomToast()

  const methods = useForm<FormValues>({
    defaultValues: {
      size: '',
    },
  })
  const builder = useAppSelector(builderSelector)
  const agentWallet = useAppSelector(agentWalletSelector)

  const allMeta = useAppSelector(selectAllPerpMeta)
  const szMap = useAppSelector(selectSzMap)

  const coinIndex = allMeta.findIndex((item) => info.coin === item.name)

  const symbolList = useAppSelector(selectSymbolListCtxs)
  const symbol = symbolList[coinIndex]

  const [currency, setCurrency] = useState(info.coin)

  const coinOptions = useMemo(() => {
    return [
      {
        value: info.coin,
      },
      {
        value: 'USDC',
      },
    ]
  }, [info.coin])

  const { control, setValue, reset, watch } = methods

  const positionSize = Number(info.szi)
  const symbolPrice = Number(symbol?.markPx ?? 0)
  const { handleCurrencyChange } = useCurrencySwitch({
    currency,
    setCurrency,
    szMap,
    symbolPrice,
    watch,
    setValue,
    coin: info.coin,
  })

  const { sliderValue, handleSliderChange } = useSliderSync({
    methods,
    fieldName: 'size',
    szDecimals: szMap[info.coin],
    currency,
    positionSize,
    price: symbolPrice,
  })

  const maxValue = useMemo(() => {
    if (!positionSize || !symbolPrice) return 0
    return currency === 'USDC' ? MathFun.mul(positionSize, symbolPrice) : positionSize
  }, [currency, positionSize, symbolPrice])

  useInitFormValues({
    open,
    info,
    currency,
    szMap,
    symbolPrice,
    reset,
    handleSliderChange,
    maxValue,
    fields: {
      tpPrice: false,
      slPrice: false,
    },
  })
  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: submitMarketCloseOrder,
    onSuccess: async (response: any) => {
      if (response === 'fail') return
      const result = isHyperOrderSuccess(response)
      if (!result.ok) {
        handleHyperliquidOrderError(result.error as string, dispatch)
        setOpen(false)
        return
      }
      toast.success(t('futuresDetails.tips.closeSuccess'))
      setOpen(false)
    },
    onError: (err: any) => {
      toast.error(t('futuresDetails.tips.closeFailed'))
    },
  })

  const handleSureBtn = async () => {
    const form_data = methods.getValues()

    const isBuy = info.side === 'B' ? false : true
    const newPrice = getAdjustedTriggerPrice(info.side, info.midPrice, true, szMap[info.coin])
    const rawInputSize = Number(form_data.size)

    const coinSize = convertSizeToBase(rawInputSize, currency, symbolPrice)

    const newSize = formatSize(coinSize, szMap[info.coin])

    submitOrder({
      coinIndex,
      isBuy,
      price: newPrice,
      size: newSize,
      builder,
      agentWallet,
      allMeta,
    })
  }

  // console.log(sliderValue, 'sliderValue')
  // console.log(newSize, 'newSize')

  useEffect(() => {
    if (open && setDisableNavigte) {
      setDisableNavigte?.(true)
    }
  }, [open])

  return (
    <FormProvider {...methods}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation()
            }}
            variant={'ghost'}
            className="flex-1 rounded-[6px] text-[calc(12rem/16)] text-[#FFFFFF] border-[0.5px] border-[#343339] bg-[#282830] h-[calc(32rem/16)]"
          >
            {t('position.closePosition')}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">
              {t('futuresDetails.common.marketPriceClose')}
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>

          <div className="px-3 pb-8">
            <div className="pb-5 mb-4">
              <div className="px-3 pt-4.5 pb-4 rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-b from-[#3e3e3e82] to-transparent flex items-center justify-between text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))]">
                <span className="text-[#FFFFFFB2]">{t('futuresDetails.tpsl.currentPosition')}</span>
                <span className="text-[#FFFFFF]">{`${info.szi} ${info.coin}`}</span>
              </div>

              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <InputBorderGradient
                    unit={
                      // <DrawerCheckSelect
                      //   childrenTrigger={
                      //     <div className="text-[#FFFFFF] cursor-pointer">
                      //       <div className="flex items-center">
                      //         <span>{currency}</span>
                      //         <img className="ml-1" src="/images/futuresDetail/s-down-arrow-icon.svg" />
                      //       </div>
                      //     </div>
                      //   }
                      //   options={coinOptions}
                      //   value={currency}
                      //   onChange={(value) => handleCurrencyChange(value)}
                      // />
                      <div
                        className="text-[#FFFFFF] cursor-pointer"
                        onClick={() => {
                          handleCurrencyChange(
                            currency === coinOptions[0].value ? coinOptions[1].value : coinOptions[0].value,
                          )
                        }}
                      >
                        <div className="flex items-center">
                          <span>{currency}</span>
                          <img
                            className="ml-1"
                            src="/images/futuresDetail/s-down-arrow-icon.svg"
                            alt="icon arrow down"
                          />
                        </div>
                      </div>
                    }
                    placeholder={t('futuresDetails.common.quantity')}
                    containerClassName="mb-[16px] h-[48px] w-full"
                    inputClassName="flex-1"
                    value={field.value}
                    inputProps={{}}
                    onChange={(val) => handleSizeChange(val, field.onChange, info.coin, szMap)}
                  />
                )}
              />

              <SliderGradient
                containerClassName="mb-[30px]"
                sliderValue={sliderValue}
                onSliderValueChange={handleSliderChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="greyDefault"
                className="w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
              >
                {t('futuresDetails.common.cancel')}
              </Button>
              <Button
                variant="purpleDefault"
                className="text-white w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSureBtn()
                }}
                isLoading={isPending}
                disabled={Number(watch('size')) <= 0 || isPending}
              >
                {t('futuresDetails.common.confirm')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </FormProvider>
  )
}

export default MarketPriceCloseButton
