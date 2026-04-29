import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { cn, MathFun } from '@/lib/utils'
import { setSymbolInfo, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectAllPerpMeta, selectSymbolListCtxs, selectSzMap } from '@/redux/modules/futuresMeta.slice'
import { agentWalletSelector, builderSelector } from '@/redux/modules/futuresUserInfo.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { formatNumberWithCommas } from '@/utils/helpers'
import InputBorderGradient from '@components/futuresDetails/trade/InputBorderGradient'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useMutation } from '@tanstack/react-query'
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCurrencySwitch } from '../hooks/useCurrencySwitch'
import { useInitFormValues } from '../hooks/useInitFormValues'
import { useSliderSync } from '../hooks/useSliderSync'
import { submitMarketCloseOrder } from '../trade/MyPositionList/SubmitMarketCloseOrder'
import {
  convertSizeToBase,
  formatSize,
  getAdjustedTriggerPrice,
  handleSizeChange,
  isHyperOrderSuccess,
} from '../trade/tools'
import { xPositions } from '../trade/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Text from '@/components/common/Text'
import { isEqual } from 'lodash-es'
import useLoaclLasrTraddePrice from './TradingDashboard/hooks/useLoaclLasrTraddePrice'
import { InputBorderGradientRef } from '../trade/InputRightBorderGradient'

interface MarketPriceCloseDialogPrpos {
  open: boolean
  info: xPositions
  baseCoin: string
  setOpen: Dispatch<SetStateAction<boolean>>
}

type FormValues = {
  size: string
}

const MarketPriceCloseDialog = ({ info, open, baseCoin, setOpen }: MarketPriceCloseDialogPrpos) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { localLastTradePrice } = useLoaclLasrTraddePrice({
    baseCoin,
    open,
  })

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
  const quantityRef = useRef<InputBorderGradientRef>(null)

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

  useEffect(() => {
    setCurrency(info?.coin)
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
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
    onError: () => {
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

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        quantityRef?.current?.blur()
      }, 100)
    }
  }, [open])

  return (
    <FormProvider {...methods}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="bg-[#232329] rounded-2xl p-0 max-w-[420px]"
          showDialogPrimitiveClose={false}
        >
          <DialogHeader className="border-b border-[#ECECED0A] pb-0">
            <DialogTitle className="py-3 px-3.5 flex w-full items-center justify-between">
              <p className="text-[calc(18rem/16)] py-3">{t('futuresDetails.common.marketPriceClose')}</p>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt="close"
              />
            </DialogTitle>
          </DialogHeader>

          <div className="px-3 pb-8">
            <div className="pb-5 mb-4">
              <div className="pt-1 pb-[14px] flex flex-col">
                <div className="flex justify-between h-[35px] items-center">
                  <div className="text-[#FFFFFFB2] font-[330] text-[14px]">
                    {t('futuresDetails.tpsl.currentPosition')}
                  </div>
                  <div className="text-[#FFFFFF] text-[14px] font-[500]">{`${info.szi} ${info.coin}`}</div>
                </div>
                <div className="flex justify-between h-[35px] items-center">
                  <div className="text-[#FFFFFFB2] font-[330] text-[14px]">{t('futuresDetails.common.markPrice')}</div>
                  <div className="text-[#FFFFFF] text-[14px] font-[500]">{formatNumberWithCommas(info.markPrice)}</div>
                </div>
                <div className="flex justify-between h-[35px] items-center">
                  <div className="text-[#FFFFFFB2] font-[330] text-[14px]">{t('futuresDetails.common.newPrice')}</div>
                  <div className="text-[#FFFFFF] text-[14px] font-[500]">
                    {formatNumberWithCommas(localLastTradePrice)}
                  </div>
                </div>
              </div>

              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <InputBorderGradient
                    ref={quantityRef}
                    unit={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className="text-[#FFFFFF] cursor-pointer"
                            // onClick={() => {
                            //   handleCurrencyChange(
                            //     currency === coinOptions[0].value ? coinOptions[1].value : coinOptions[0].value,
                            //   )
                            // }}
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
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[80px] bg-[#232329] p-[6px] border border-[#ECECED0A]">
                          {coinOptions.map((e) => (
                            <DropdownMenuItem
                              className={cn('cursor-pointer', currency === e.value && 'bg-[#ECECED14]')}
                              onClick={() => {
                                handleCurrencyChange(e.value)
                              }}
                            >
                              <Text text={e.value as string} className="!font-[330] text-center mx-auto" />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}

export default memo(MarketPriceCloseDialog, (prevProps, nextProps) => {
  return (
    prevProps.baseCoin === nextProps.baseCoin &&
    prevProps.open === nextProps.open &&
    isEqual(prevProps.info, nextProps.info)
  )
})
