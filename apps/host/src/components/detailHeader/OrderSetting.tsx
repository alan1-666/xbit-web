import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { Switch } from '@components/ui/switch.tsx'
import { useEffect, useRef, useState } from 'react'
import GradientBordered from '@components/common/GradientBordered.tsx'
import SlipPageSettings from '@components/detailHeader/SlipPageSettings.tsx'
import PriorityFeeSettings from '@components/detailHeader/PriorityFeeSettings.tsx'
import ButtonGradient from '@components/common/buttons/ButtonGradient.tsx'
import GasFeeSettings from '@components/detailHeader/GasFeeSettings.tsx'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { z } from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import { TYPE_CHAIN } from '@/lib/blockchain'
import {
  initialStateTradeConfig,
  tradeConfigActions,
  tradeConfigChainSelected,
} from '@/redux/modules/tradeConfigs.slice'
import DetailHeaderButton from './DetailHeaderButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import eventBus from '@/lib/eventBus'
import { formatBalanceWallet } from '@/lib/number'
import { useTranslation } from 'react-i18next'
import { useGetNetworkFee } from '@/hooks/useGetNetWorkFee'

export const EVENT_MESSAGE_OPEN_TRADE_SETTING = 'EVENT_MESSAGE_OPEN_TRADE_SETTING'

export type OrderSettingOption = {
  value: string
  content: string | React.ReactNode
}

const OrderSetting = () => {
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const validateFee = useAppSelector(tradeConfigChainSelected(activeChain))?.validate

  const formSchema = z.object({
    mevProtect: z.boolean({}),
    slippage: z
      .string({
        required_error: 'required',
      })
      .superRefine((val, ctx) => {
        const num = Number(val)
        if (!val) return true
        if (num < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('orderForm.orderSetting.slippageTooLow'),
          })
          return false
        }

        if (num > 50 && num <= 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('orderForm.orderSetting.slippageTooHigh'),
          })
          return false
        }

        if (num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('orderForm.orderSetting.cannotOver100'),
          })
          return false
        }

        return true
      }),
    priorityFeePrice: z.object({
      type: z.string(),
      value: z.string().superRefine((val, ctx) => {
        const num = Number(val)
        if (!val || val.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('orderForm.orderSetting.priorityFeeRequire'),
          })
          return false
        }
        const { minFee, maxFee } = validateFee
        if (num < minFee) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('orderForm.orderSetting.priorityFeeTooLow'),
          })
          return false
        }

        if (activeChain === TYPE_CHAIN.SOLANA) {
          if (num > maxFee) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${t('orderForm.orderSetting.maximumPriorityFee')} ${maxFee} ${activeChain.toUpperCase()}`,
            })
            return false
          }
        }
        return true
      }),
    }),
  })
  type FormValues = z.infer<typeof formSchema>

  const [typeUpdate, setTypeUpdate] = useState<'default' | 'update'>('default')
  const [orderSettingOpen, setOrderSettingOpen] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const configs = useAppSelector(tradeConfigChainSelected(activeChain))?.configs
  const dispatch = useAppDispatch()
  const flagSol = useRef(false)
  const flagEth = useRef(false)

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slippage: configs?.slippage,
      mevProtect: configs?.mevProtect,
      priorityFeePrice: configs?.priorityFeePrice,
    },
  })

  const {
    setValue,
    watch,
    reset,
    formState: { isValid },
  } = methods

  const networkFee = useGetNetworkFee(activeChain)

  function onSubmit(values: FormValues) {
    if (typeUpdate === 'default') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const initConfig = initialStateTradeConfig?.tradeConfigs?.[activeChain]?.configs
      dispatch(
        tradeConfigActions.updateTradeConfig({
          chain: activeChain,
          config: initConfig,
        }),
      )
      setValue('mevProtect', initConfig?.mevProtect)
      setValue('slippage', initConfig?.slippage)
      setValue('priorityFeePrice', initConfig?.priorityFeePrice)
    }
    if (typeUpdate === 'update') {
      if (!isValid) return
      dispatch(
        tradeConfigActions.updateTradeConfig({
          chain: activeChain,
          config: values,
        }),
      )
    }

    setOpen(false)
    setOrderSettingOpen(false)
  }

  const handeClickConfirm = () => {
    const formValues = methods.getValues()
    onSubmit(formValues)
  }

  //Update form when drawer opens to ensure it has latest Redux state
  useEffect(() => {
    if (orderSettingOpen && configs) {
      reset({
        slippage: configs?.slippage,
        mevProtect: configs?.mevProtect,
        priorityFeePrice: configs?.priorityFeePrice,
      })
    }
  }, [orderSettingOpen, configs, reset])

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OPEN_TRADE_SETTING, (data: any) => {
      if (data?.data) {
        setOrderSettingOpen(data?.data?.isOpen)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OPEN_TRADE_SETTING)
    }
  }, [])

  //Set default priority fee price when high is available
  useEffect(() => {
    if (
      activeChain === TYPE_CHAIN.SOLANA &&
      networkFee &&
      'priorityFeePrice' in networkFee &&
      configs?.priorityFeePrice?.type === 'high' &&
      !configs?.priorityFeePrice?.value &&
      !flagSol.current
    ) {
      updatePriorityFeePrice('high', networkFee.priorityFeePrice?.high)
      flagSol.current = true
    }

    if (
      activeChain === TYPE_CHAIN.ETH &&
      networkFee &&
      'medium' in networkFee &&
      configs?.priorityFeePrice?.type === 'high' &&
      !configs?.priorityFeePrice?.value &&
      !flagEth.current
    ) {
      updatePriorityFeePrice('high', Number(networkFee.medium.suggestedMaxFeePerGas))
      flagEth.current = true
    }
  }, [activeChain, networkFee, configs])

  const updatePriorityFeePrice = (type: string, value: number) => {
    dispatch(
      tradeConfigActions.updateTradeConfig({
        chain: activeChain,
        config: {
          ...configs,
          priorityFeePrice: {
            type: type,
            value: activeChain === TYPE_CHAIN?.ETH ? getFeeEth(value) : getFeeSol(value),
          },
        },
      }),
    )
  }

  const getFeeSol = (sol: number) => {
    if (sol && activeChain === TYPE_CHAIN.SOLANA && networkFee && 'maxComputeUnits' in networkFee)
      return formatBalanceWallet({
        balance: (sol * networkFee.maxComputeUnits) / Math.pow(10, 15),
        decimal: 6,
      })
    return 0
  }

  const getFeeEth = (eth: number) => {
    if (eth)
      return formatBalanceWallet({
        balance: eth,
        decimal: 3,
      })
    return 0
  }

  return (
    <>
      <DetailHeaderButton
        className="transition-all duration-100 hover:scale-[1.1]"
        icon="/images/detailHeader/icon-setting.svg"
        onClick={() => setOrderSettingOpen(true)}
      />
      <Drawer
        open={orderSettingOpen}
        onOpenChange={(open) => {
          setOrderSettingOpen(open)
        }}
        repositionInputs={false}
      >
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader className="py-[17px] px-[12px] flex w-full items-center justify-between leading-[1]">
            <DrawerTitle className="app-font-medium text-[calc(1rem*(18/16))] text-white">
              {t('orderForm.orderSetting.title')}
            </DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => {
                setOrderSettingOpen(false)
              }}
              alt=""
            />
          </DrawerHeader>
          <FormProvider {...methods}>
            <form className="overflow-y-auto">
              <div className="px-[12px] pb-[8px]">
                <div className="flex items-center justify-between mb-[20px]">
                  <div className="flex items-center gap-[6px] leading-[1]">
                    <div className="text-[calc(1rem*(14/16))] text-[#FFFFFFCC]">
                      {t('orderForm.orderSetting.antiClipMode')}
                    </div>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <p className="text-xs leading-none">{t('orderForm.orderSetting.antiClipModeTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    checked={watch('mevProtect')}
                    onCheckedChange={(val: boolean) => setValue('mevProtect', val)}
                  />
                </div>
                <SlipPageSettings methods={methods} />
                {activeChain === TYPE_CHAIN.SOLANA ? (
                  <PriorityFeeSettings methods={methods} data={networkFee} configs={configs} />
                ) : (
                  <GasFeeSettings methods={methods} data={networkFee} configs={configs} />
                )}
              </div>

              {/* warning */}
              <div className="px-[12px]">
                <div className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] bg-[#ECECED0A]">
                  <img src="/images/orderSetting/icon-warn.svg" className="w-[20px] min-w-[20px]" alt="" />
                  <div className="text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1.5]">
                    {t('orderForm.orderSetting.warning')}
                  </div>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <div className="px-[12px] py-[16px] border-t-[0.5px] border-[#ECECED0A] flex items-center justify-center gap-[8px]">
                    <GradientBordered
                      containerClassName="rounded-full w-1/2 max-w-[171.5px] h-[44px] cursor-pointer hover-scale"
                      innerBgClassName="p-[10px] app-font-medium text-[calc(1rem*(16/16))] text-white leading-[1] bg-[#3B3B41] rounded-full flex items-center justify-center"
                      onClick={() => {
                        setTypeUpdate('default')
                        setOpen(true)
                      }}
                    >
                      {t('orderForm.buySettings.reset')}
                    </GradientBordered>
                    <ButtonGradient
                      type="button"
                      className="rounded-full w-1/2 max-w-[171.5px] p-[16px] h-[44px] app-font-medium text-[calc(1rem*(16/16))] text-[#141414] leading-[1] hover-scale"
                      onClick={() => {
                        setTypeUpdate('update')
                        setOpen(true)
                      }}
                      disabled={!isValid}
                    >
                      {t('orderForm.buySettings.confirm')}
                    </ButtonGradient>
                  </div>
                </DialogTrigger>
                <DialogContent className="w-[360px] bg-[#232329] rounded-2xl p-5">
                  <DialogHeader>
                    <DialogTitle>
                      <p className="text-sm text-white leading-[1.5] pt-8">{t('orderForm.orderSetting.warning')}</p>
                    </DialogTitle>
                    <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
                      <Button type="button" variant="close" className="flex-1" onClick={() => setOpen(false)}>
                        {t('orderForm.orderSetting.cancel')}
                      </Button>
                      <Button
                        variant="gradient"
                        type="button"
                        className="text-[#261236] flex-1 rounded-[50px]"
                        onClick={() => {
                          handeClickConfirm()
                        }}
                      >
                        {t('orderForm.orderSetting.open')}
                      </Button>
                    </div>
                  </DialogHeader>
                  <DialogDescription />
                </DialogContent>
              </Dialog>
            </form>
          </FormProvider>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default OrderSetting
