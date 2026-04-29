import { useTpslMutation } from '@/components/futuresDetails/hooks/useAsyncMutation'
import { handlePriceChange, handleSizeChange } from '@/components/futuresDetails/trade/tools'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { MathFun, cn } from '@/lib/utils'
import { selectAllPerpMeta, selectSzMap, selectSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import InputBorderGradient, { InputBorderGradientRef } from '@components/futuresDetails/trade/InputBorderGradient'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useState, useEffect, useMemo, ReactNode, useRef, Dispatch, SetStateAction } from 'react'
import { xPositions, xOpenOrders } from '../types'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { useSliderSync } from '../../hooks/useSliderSync'
import { useCurrencySwitch } from '../../hooks/useCurrencySwitch'
import { useInitFormValues } from '../../hooks/useInitFormValues'
import { formatPrice } from '../tools'
import { toast } from 'sonner'
import { buildTpslOrders } from './BuildTpslOrders'
import { UITab } from '@/types/uiTabs.ts'
import { useCancelOrdersMutation } from '@/components/futuresDetails/hooks/useCancelOrdersMutation'
import { isHyperOrderSuccess } from '@/components/futuresDetails/trade/tools'
import { validateTpSlPrices } from '@/components/futuresDetails/helper/validateFunc'
import { agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { useToast } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { useTranslation } from 'react-i18next'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { validatePrice } from '@/components/futuresDetails/trade/tools'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

interface TpslButtonPrpos {
  info: xPositions
  childrenTrigger: string | ReactNode
  setDisableNavigte?: Dispatch<SetStateAction<boolean>>
}

type FormValues = {
  size: string
  tpPrice: string
  slPrice: string
  tpPricePercent: string
  slPricePercent: string
}

const TpslButton = ({ info, childrenTrigger, setDisableNavigte }: TpslButtonPrpos) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const { showToast } = useToast()
  const methods = useForm<FormValues>({
    defaultValues: {
      size: info.szi || '',
      tpPrice: info.tpPrice || '',
      slPrice: info.slPrice || '',
      tpPricePercent: '',
      slPricePercent: '',
    },
  })

  const { handleSubmit, control, watch, reset, setValue, getValues } = methods

  const allMeta = useAppSelector(selectAllPerpMeta)
  const szMap = useAppSelector(selectSzMap)

  const [currency, setCurrency] = useState(info.coin)

  const coinIndex = allMeta.findIndex((item) => info.coin === item.name)
  const symbolList = useAppSelector(selectSymbolListCtxs)
  const symbol = symbolList[coinIndex]
  const symbolPrice = Number(symbol?.markPx ?? 0)

  const tpPriceInputRef = useRef<InputBorderGradientRef>(null)
  const slPriceInputRef = useRef<InputBorderGradientRef>(null)

  const agentWallet = useAppSelector(agentWalletSelector)

  const { mutate: cancelOrders, isPending } = useCancelOrdersMutation()
  const [currentCancelId, setCurrentCancelId] = useState(0)

  const cancelQueueRef = useRef<{ orderId: number; type: 'tp' | 'sl' }[]>([])
  const [isCancelling, setIsCancelling] = useState(false)

  const unitList: UITab[] = [
    {
      value: '%',
      label: t('futuresDetails.tpsl.rate'),
    },
    {
      value: '$',
      label: t('futuresDetails.tpsl.pnl'),
    },
  ]

  // 添加单位状态
  const [unit, setUnit] = useState<string>(unitList[0].value)

  // 当前仓位大小
  const { openOrders } = useWebData2()

  const positionSize = Number(info.szi)
  // 当前价格应该是当前币对的开仓价
  const entryPrice = Number(info.entryPx)
  // 杠杆倍数
  const leverage = info.leverage.value

  const { sliderValue, handleSliderChange, setSliderValue } = useSliderSync({
    methods,
    fieldName: 'size',
    szDecimals: szMap[info.coin],
    currency,
    positionSize,
    price: entryPrice,
  })

  const mutation = useTpslMutation()

  const maxValue = useMemo(() => {
    if (!positionSize || !entryPrice) return 0
    return currency === 'USDC' ? MathFun.mul(positionSize, entryPrice) : positionSize
  }, [currency, positionSize, entryPrice])

  useInitFormValues({
    open,
    info,
    currency,
    szMap,
    symbolPrice: entryPrice,
    reset,
    handleSliderChange,
    maxValue,
    fields: {
      tpPrice: true,
      slPrice: true,
    },
  })

  // 处理单位切换
  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    // 切换单位后重新计算百分比/盈亏值
    const currentTpPrice = getValues('tpPrice')
    const currentSlPrice = getValues('slPrice')

    if (currentTpPrice) {
      handleChangeTsSl('tpPrice', currentTpPrice)
    }

    if (currentSlPrice) {
      handleChangeTsSl('slPrice', currentSlPrice)
    }
  }

  // 直接切换单位（在 % 和 $ 之间切换）
  const toggleUnit = () => {
    const newUnit = unit === '%' ? '$' : '%'
    handleUnitChange(newUnit)
  }

  // 处理价格变化，计算对应的百分比或盈亏值
  // leverage 是杠杆倍数
  // entryPrice 是开仓价
  // size 是仓位大小
  // priceNumber 是输入的价格
  // resultStr 是计算后的百分比或盈亏值
  const handleChangeTsSl = (name: 'slPrice' | 'tpPrice', value: string) => {
    setValue(name, value)
    // 如果输入值为空，同时清除对应的收益/亏损字段
    if (!value || value.trim() === '') {
      if (name === 'tpPrice') {
        setValue('tpPricePercent', '')
      } else {
        setValue('slPricePercent', '')
      }
      return
    }
    const priceNumber = Number(value)
    if (isNaN(priceNumber) || priceNumber <= 0) return

    let resultStr = ''
    const size = watch('size')
    const side = info.side === 'B' ? 'buy' : 'sell'
    const priceDiff = side === 'buy' ? priceNumber - entryPrice : entryPrice - priceNumber

    if (entryPrice && leverage && priceNumber) {
      if (unit === '%') {
        const percentage = MathFun.mul(MathFun.div(priceDiff, entryPrice), leverage * 100)
        resultStr = percentage.toFixed(2)
      } else if (unit === '$' && Number(size) > 0) {
        let pnlUsd = 0
        if (currency === 'USDC') {
          // USD 本位：size 是 USD 金额，priceDiff × size / entryPrice
          pnlUsd = MathFun.mul(MathFun.div(priceDiff, entryPrice), size)
        } else {
          // 币本位：size 是币数量，盈亏 = priceDiff  × size
          pnlUsd = MathFun.mul(priceDiff, size)
        }

        resultStr = pnlUsd.toFixed(2)
      }
    }

    if (name === 'tpPrice') {
      setValue('tpPricePercent', resultStr)
    } else {
      if (priceDiff < 0) {
        resultStr = Math.abs(parseFloat(resultStr)).toString()
      } else {
        resultStr = (-Math.abs(parseFloat(resultStr))).toString()
      }
      setValue('slPricePercent', resultStr)
    }
  }

  // 处理百分比或盈亏值变化，计算对应的价格
  const handleChangePricePercent = (name: 'slPricePercent' | 'tpPricePercent', value: string) => {
    const sanitizedValue = value.replace(/(\.\d{0,2}).*$/, '$1') // 小数最多保留2位

    setValue(name, sanitizedValue)
    // 如果输入值为空，同时清除对应的价格字段
    if (!value || value.trim() === '') {
      if (name === 'tpPricePercent') {
        setValue('tpPrice', '')
      } else {
        setValue('slPrice', '')
      }
      setValue(name, '')
      return
    }
    const numericInput = Number(value)
    let newPrice = 0
    const size = watch('size')

    if (!entryPrice || !leverage || !numericInput) return

    if (unit === '%') {
      // 按收益率计算
      // 当单位为%时，计算公式为：(价格差 / 当前价格) * 杠杆 * 100
      const priceOffset = MathFun.div(MathFun.mul(numericInput, entryPrice), leverage * 100)
      const side = info.side === 'B' ? 'buy' : 'sell'

      const isPositive = (name === 'tpPricePercent' && side === 'buy') || (name === 'slPricePercent' && side === 'sell')

      newPrice = isPositive ? MathFun.add(entryPrice, priceOffset) : MathFun.sub(entryPrice, priceOffset)
    } else if (unit === '$') {
      let priceOffset = 0
      if (currency === 'USDC') {
        // USD 本位，目标盈亏 = size * Δp / entryPrice
        priceOffset = MathFun.div(MathFun.mul(numericInput, entryPrice), size)
      } else {
        // 币本位，目标盈亏 = Δp * size * leverage
        priceOffset = MathFun.div(numericInput, size)
      }

      const side = info.side === 'B' ? 'buy' : 'sell'
      const isProfit = (name === 'tpPricePercent' && side === 'buy') || (name === 'slPricePercent' && side === 'sell')

      newPrice = isProfit ? MathFun.add(entryPrice, priceOffset) : MathFun.sub(entryPrice, priceOffset)
    }
    const formatNewPrice = formatPrice(newPrice, szMap[info.coin], {limitSigFigs: true})

    // 更新价格
    if (name === 'tpPricePercent') {
      setValue('tpPrice', formatNewPrice)
    } else {
      setValue('slPrice', formatNewPrice)
    }
  }

  // 检查是否禁用输入
  const handleCheckDisable = () => {
    return Number(watch('size')) <= 0
  }

  // 更新表单提交处理
  const handleSureBtn = handleSubmit(async (form_data) => {
    const side = info.side === 'B' ? 'buy' : 'sell'
    const takeProfit = watch('tpPrice')
    const stopLoss = watch('slPrice')

    const resultValidateTpSlPrices = validateTpSlPrices({
      side,
      marketPrice: Number(symbolPrice),
      takeProfit,
      stopLoss,
    })
    if (!resultValidateTpSlPrices.isValid) {
      toast.error(resultValidateTpSlPrices.message)
      setOpen(false)
      return false
    }

    // 检查之前有没有对应的挂单
    // const needCancelOrder = openOrders.filter(item => (item.coin === info.coin && item.isTrigger && !item.children.length))


    const coinIndex = allMeta.findIndex(item => info.coin === item.name)
    const orders = buildTpslOrders({
      size: form_data.size === info.szi ? '0' : form_data.size,
      tpPrice: !info.tpOrderId ? form_data.tpPrice : '',
      slPrice: !info.slOrderId ? form_data.slPrice : ''
    }, info, szMap, coinIndex)
    if (!orders.length || !agentWallet) {
      setOpen(false)
      return false
    }

    try {
      const response = await mutation.mutateAsync({ orders, agentWallet, allMeta })

      if (response === 'fail') {
        setOpen(false)
        return
      }

      const result = isHyperOrderSuccess(response)
      if (!result.ok) {
        handleHyperliquidOrderError(result.error as string, dispatch)
        setOpen(false)
        return
      }
      logEvent2(ACTIONS.contract_set_sl_tp, {
        symbol: info.coin,
        stop_loss: form_data?.slPrice,
        take_profit: form_data?.tpPrice,
      })
      showToast({
        type: 'success',
        title: t('futuresDetails.tpsl.setTpslSuccess'),
        duration: 4000,
      })

      setOpen(false)
    } catch (err: any) {
      showToast({
        type: 'error',
        title: err.message || t('futuresDetails.tpsl.setTpslFailed'),
      })
    }
  })

  const processNextCancel = () => {
    if (cancelQueueRef.current.length === 0) {
      setIsCancelling(false)
      return
    }

    setIsCancelling(true)
    const { orderId, type } = cancelQueueRef.current.shift()! // 取出队首任务
    setCurrentCancelId(orderId)

    const needCancelOrder = openOrders.filter((item) => item.oid === orderId)
    if (!agentWallet || needCancelOrder.length === 0) {
      processNextCancel() // 跳过
      return
    }

    cancelOrders(
      { orders: needCancelOrder, allMeta, agentWallet },
      {
        onSuccess: (response: any) => {
          if (response !== 'fail') {
            const result = isHyperOrderSuccess(response)
            if (result.ok) {
              setTimeout(() => {
                if (type === 'tp') {
                  handleChangeTsSl('tpPrice', '')
                  tpPriceInputRef.current?.focus()
                } else {
                  handleChangeTsSl('slPrice', '')
                  slPriceInputRef.current?.focus()
                }
              }, 1000)
            } else {
              handleHyperliquidOrderError(result.error as string, dispatch)
            }
          }
          processNextCancel() // 继续下一个
        },
        onError: () => {
          processNextCancel() // 出错也继续下一个
        },
      },
    )
  }

  const handleCancelOrders = (orderId: number, type: 'tp' | 'sl') => {
    cancelQueueRef.current.push({ orderId, type })
    if (!isCancelling) {
      processNextCancel()
    }
  }

  const expectedProfitDisplay = useMemo(() => {
    const tpPrice = Number(getValues('tpPrice'));
    const size = Number(getValues('size')) || 0;
    const side = info.side === 'B' ? 'buy' : 'sell';

    const isProfitInsteadOfLoss = side === 'buy' ? tpPrice > entryPrice : tpPrice < entryPrice;
    let text = isProfitInsteadOfLoss ? 'Expected Profit:' : 'Expected Loss:'
    const mathSymbol = (!isProfitInsteadOfLoss && unit === '%') ? '-' : ''

    const priceDiff = isProfitInsteadOfLoss
      ? (side === 'buy' ? tpPrice - entryPrice : entryPrice - tpPrice) // 盈利止损
      : (side === 'buy' ? entryPrice - tpPrice : tpPrice - entryPrice); // 正常亏损


    if (!tpPrice || !size) return '--';

    if (unit === '%') {
      // 显示 USD 收益
      let pnlUsd = 0;
      if (currency === 'USDC') {
        pnlUsd = MathFun.mul(MathFun.div(priceDiff, entryPrice), size);
      } else {
        pnlUsd = MathFun.mul(priceDiff, size);
      }
      return `${text}${mathSymbol}${pnlUsd.toFixed(2)} USDC`;
    } else {
        // 显示百分比收益
      const percentage = MathFun.mul(MathFun.div(priceDiff, entryPrice), leverage * 100);
      return `${text}${mathSymbol}${percentage.toFixed(2)}%`;
    }
  }, [unit, currency, watch('tpPrice'), watch('size')]);
  
  
  const expectedLossDisplay = useMemo(() => {
    const slPrice = Number(getValues('slPrice'));
    const size = Number(getValues('size')) || 0;
    const side = info.side === 'B' ? 'buy' : 'sell';

    
      // 判断止损是亏损还是盈利
    const isProfitInsteadOfLoss = side === 'buy' ? slPrice > entryPrice : slPrice < entryPrice;
    let text = isProfitInsteadOfLoss ? 'Expected Profit:' : 'Expected Loss:'
    const mathSymbol = (!isProfitInsteadOfLoss && unit === '%') ? '-' : ''

    const priceDiff = isProfitInsteadOfLoss
      ? (side === 'buy' ? slPrice - entryPrice : entryPrice - slPrice) // 盈利止损
      : (side === 'buy' ? entryPrice - slPrice : slPrice - entryPrice); // 正常亏损

      if (!slPrice || !size) return '--';

      if (unit === '%') {
          // USD 亏损
        let pnlUsd = 0;
        if (currency === 'USDC') {
          pnlUsd = MathFun.mul(MathFun.div(priceDiff, entryPrice), size);
        } else {
          pnlUsd = MathFun.mul(priceDiff, size);
        }
        return `${text}${mathSymbol}${(pnlUsd).toFixed(2)} USDC`;
        
      } else {
        // 百分比亏损
      const percentage = MathFun.mul(MathFun.div(priceDiff, entryPrice), leverage * 100);
      return `${text}${mathSymbol}${percentage.toFixed(2)}%`;
    }
  }, [unit, currency, watch('slPrice'), watch('size')]);

  // 当单位或仓位大小变化时，重新计算百分比/盈亏值
  useEffect(() => {
    const tpPrice = watch('tpPrice')
    const slPrice = watch('slPrice')
    const size = parseFloat(watch('size') || '0')
    const percentage = maxValue === 0 ? 0 : (size / maxValue) * 100

    if (tpPrice) handleChangeTsSl('tpPrice', tpPrice)
    if (slPrice) handleChangeTsSl('slPrice', slPrice)

    if (size !== undefined) {
      setSliderValue([percentage])
    }
  }, [unit, watch('size'), open])

  useEffect(() => {
    if (open && setDisableNavigte) {
      setDisableNavigte?.(true)
    }
  }, [open])

  // console.log(info.tpPrice, 'tpPrice')
  // console.log(info.slPrice, 'tpPrice')

  return (
    <FormProvider {...methods}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{childrenTrigger}</DrawerTrigger>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle>{t('futuresDetails.tpsl.setTpsl')}</DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>

          <div className="px-3 pb-8">
            <div className="pb-5 mb-4">
              <div className="px-3 pt-4.5 pb-4 rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-b from-[#3e3e3e82] to-transparent text-sm">
                <RawItem
                  title={t('futuresDetails.tpsl.currentPosition')}
                  value={`${info.szi} ${info.coin}`}
                  className="mb-2"
                />
                {info.tpPrice !== '' && (
                  <RawItem
                    title={t('futuresDetails.common.takeProfitPrice')}
                    value={info.tpPrice}
                    isTpsl={true}
                    btnPending={(isPending || isCancelling) && currentCancelId === info.tpOrderId}
                    onCancel={() => handleCancelOrders(info.tpOrderId, 'tp')}
                  />
                )}

                {info.slPrice !== '' && (
                  <RawItem
                    title={t('futuresDetails.common.stopLossPrice')}
                    value={info.slPrice}
                    isTpsl={true}
                    btnPending={(isPending || isCancelling) && currentCancelId === info.slOrderId}
                    onCancel={() => handleCancelOrders(info.slOrderId, 'sl')}
                  />
                )}
              </div>

              {/* 数量输入框 */}
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <InputBorderGradient
                    unit={<div className="text-[#fff]">{info.coin}</div>}
                    placeholder={t('futuresDetails.common.quantity')}
                    containerClassName="mb-3 h-12 w-full"
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

              {/* 止盈价格和收益 */}
              <div className="flex items-center mb-3">
                <Controller
                  name="tpPrice"
                  control={control}
                  render={({ field }) => (
                    <InputBorderGradient
                      placeholder={t('futuresDetails.common.takeProfitPrice')}
                      containerClassName="h-12 w-full mr-2"
                      inputClassName="flex-1"
                      value={`${field.value}`}
                      ref={tpPriceInputRef}
                      inputProps={{
                        disabled: info.tpPrice !== '',
                      }}
                      onChange={(val) => {
                        const isValid = validatePrice(info.coin, val, szMap)
                        if (!isValid) return
                        handleChangeTsSl('tpPrice', val)
                      }
                    }
                    />
                  )}
                />

                <Controller
                  name="tpPricePercent"
                  control={control}
                  render={({ field }) => (
                    <InputBorderGradient
                      unit={
                        <div className="text-[#FFFFFF] cursor-pointer" onClick={toggleUnit}>
                          <div className="flex items-center">
                            <span>{unit}</span>
                            <img className="ml-1" src="/images/futuresDetail/s-down-arrow-icon.svg" alt="s-down-arrow-icon" />
                          </div>
                        </div>
                      }
                      placeholder={t('futuresDetails.common.takeProfit')}
                      containerClassName="h-12 w-full"
                      inputClassName="flex-1"
                      value={field.value}
                      inputProps={{
                        disabled: info.tpPrice !== '',
                      }}
                      onlyPositiveInteger={false}
                      onChange={(val) => handleChangePricePercent('tpPricePercent', val)}
                    />
                  )}
                />
              </div>

              <div className="text-right text-[12px] leading-[12px] text-[#FFFFFFB2] mb-3">
                {expectedProfitDisplay}
              </div>

              {/* 止损价格和亏损 */}
              <div className="flex items-center mb-3">
                <Controller
                  name="slPrice"
                  control={control}
                  render={({ field }) => (
                    <InputBorderGradient
                      placeholder={t('futuresDetails.common.stopLossPrice')}
                      containerClassName="h-12 w-full mr-2"
                      inputClassName="flex-1"
                      value={field.value}
                      ref={slPriceInputRef}
                      inputProps={{
                        disabled: info.slPrice !== '',
                      }}
                      onChange={(val) => {
                        const isValid = validatePrice(info.coin, val, szMap)
                        if (!isValid) return
                        handleChangeTsSl('slPrice', val)
                      }}
                    />
                  )}
                />
                <Controller
                  name="slPricePercent"
                  control={control}
                  render={({ field }) => (
                    <InputBorderGradient
                      unit={
                        <div className="text-[#FFFFFF] cursor-pointer" onClick={toggleUnit}>
                          <div className="flex items-center">
                            <span>{unit}</span>
                            <img className="ml-1" src="/images/futuresDetail/s-down-arrow-icon.svg" alt="s-down-arrow-icon" />
                          </div>
                        </div>
                      }
                      placeholder={t('futuresDetails.common.stopLoss')}
                      containerClassName="h-12 w-full"
                      inputClassName="flex-1"
                      value={field.value}
                      inputProps={{
                        disabled: info.slPrice !== '',
                      }}
                      onlyPositiveInteger={false}
                      onChange={(val) => handleChangePricePercent('slPricePercent', val)}
                    />
                  )}
                />
              </div>

              <div className="text-right text-[12px] leading-[12px] text-[#FFFFFFB2] ">
                 {expectedLossDisplay}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="greyDefault"
                className="w-full rounded-[50px] h-11"
                onClick={() => setOpen(false)}
              >
                {t('futuresDetails.common.cancel')}
              </Button>
              <Button
                variant="purpleDefault"
                className="w-full rounded-[50px] h-11 text-white"
                isLoading={mutation.isPending}
                disabled={
                  mutation.isPending ||
                  Number(watch('size')) <= 0 ||
                  (!watch('tpPrice') && !watch('slPrice')) ||
                  (info.tpPrice !== '' && info.slPrice !== '')
                }
                onClick={handleSureBtn}
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
export interface RawItemProps {
  title: string
  value: ReactNode
  isTpsl?: boolean
  className?: string
  classNameValue?: string
  btnPending?: boolean
  onCancel?: () => void
}

export const RawItem = ({
  title,
  value,
  isTpsl = false,
  className,
  onCancel,
  btnPending,
  classNameValue,
}: RawItemProps) => {
  const { t } = useTranslation()
  return (
    <div className={cn('flex items-center justify-between ', className)}>
      <span className="text-[#FFFFFFB2] ">{title}</span>
      <span className={cn('text-[#FFFFFF] font-bold flex items-center', classNameValue)}>
        {value}
        {isTpsl && (
          <Button
            variant="ghost"
            className="p-0 text-rise ml-3"
            isLoading={btnPending}
            disabled={btnPending}
            onClick={() => onCancel && onCancel()}
          >
            <p className="text-[#AB57FF]">{t('futuresDetails.common.cancel')}</p>
          </Button>
        )}
      </span>
    </div>
  )
}

export default TpslButton
