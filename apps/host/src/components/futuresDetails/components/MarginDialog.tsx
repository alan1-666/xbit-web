import { useEditMarginMutation } from '@/components/futuresDetails/hooks/useAsyncMutation'
import { Button } from '@/components/ui/button'
import { MathFun, cn, fixNumber } from '@/lib/utils'
import { selectAllPerpMeta, selectSzMap, selectSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import InputBorderGradient, { InputBorderGradientRef } from '@components/futuresDetails/trade/InputBorderGradient'
import { useEffect, useMemo, useState, SetStateAction, Dispatch} from 'react'
import { xPositions } from '../types'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { useToast } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { useTranslation } from 'react-i18next'
import { agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { isHyperOrderSuccess } from '@/components/futuresDetails/trade/tools'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import FilterSelect from '@components/common/FilterSelect'
import { UITab } from '@/types/uiTabs'
import i18n from '@/i18n'
import { useActiveAssetData } from '@/hooks/hyperliquid/useActiveAssetData'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { baseCoinSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'










interface EditMarginPrpos {
  info: xPositions
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

type FormValues = {
  ntli: string
}

export type EditMarginType = 'add' | 'remove'

const orderTypeOptions = (): UITab[] => [
  {
    value: 'add',
    label: i18n.t('futuresDetails.margin.add'),
  },
  {
    value: 'remove',
    label: i18n.t('futuresDetails.margin.remove'),
  }
]

const EditMargin = ({ info,  open, setOpen }: EditMarginPrpos) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const methods = useForm<FormValues>({
    defaultValues: {
      ntli: '',
    }
  })

  const { handleSubmit, control, watch, reset, setValue, getValues } = methods

  const allMeta = useAppSelector(selectAllPerpMeta)
  const baseCoin = useAppSelector(baseCoinSelector)

  const coinIndex = allMeta.findIndex((item) => info.coin === item.name)
  const agentWallet = useAppSelector(agentWalletSelector)
  const walletDex = useSelector(_walletDex)
  
  const { activeAssetData } = useActiveAssetData(
    open ? info.coin : null,
    open ? walletDex.walletAddress : null,
    'EditMarginActiveAssetData' + info.coin
  )



  const availableForAdd = useMemo(() => {
    const side = info.side === 'B' ? 'buy' : 'sell'
    return side === 'buy' ? Number(activeAssetData?.availableToTrade?.[0]) : Number(activeAssetData?.availableToTrade?.[1])
 /*    if (baseCoin === info.coin) {
      return side === 'buy' ? Number(activeAssetData?.availableToTrade?.[0]) : Number(activeAssetData?.availableToTrade?.[1])
    }
    return available */

  }, [info.side, baseCoin, activeAssetData])

  const [type, setType] = useState<EditMarginType>('add')

  const mutation = useEditMarginMutation()

  const ntli = watch('ntli')
  
  const availableForRemove = useMemo(() => {
    const initial_margin_required = Number(info.szi) * Number(info.markPrice) / Number(info.leverage.value)
    const transfer_margin_required = Math.max(initial_margin_required, 0.1 * Number(info.positionValue)) 
    const canRemove = Number(info.marginUsed) - transfer_margin_required
    return canRemove <= 0 ? 0.00 : canRemove
  }, [info])

  const btnDisabled = useMemo(() => {
  if (mutation.isPending) return true

  const value = Number(ntli)
  if (!ntli || isNaN(value) || value <= 0) return true

  if (type === 'add') return value > availableForAdd
  if (type === 'remove') return value > availableForRemove

  return false
}, [mutation.isPending, type, ntli, availableForAdd, availableForRemove])

  



  const handleSureBtn = handleSubmit(async (form_data) => {
    try {
      const response = await mutation.mutateAsync({ 
        coinIndex, 
        agentWallet, 
        allMeta, 
        ntli: form_data.ntli,
        type
      })
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
      showToast({
        type: 'success',
        title: t('futuresDetails.tips.modifySuccess'),
        duration: 4000,
      })
        
      setOpen(false)
    } catch (err: any) {
        showToast({
          type: 'error',
          title: err.message || t('futuresDetails.tips.modifyFail'),
        })
    }
  })

  const handleNtilChange = (value: string) => {
    const maxDecimalPlaces = 2
    const isTypingIntermediate = value === '' || value === '.' || value === '0.'
    const decimalLimitRegex = new RegExp(`^\\d*(\\.\\d{0,${maxDecimalPlaces}})?$`)
    if (!isTypingIntermediate && !decimalLimitRegex.test(value)) {
      return 
    }
    setValue('ntli', value)
  }
  const handleSetMax = () => {
    const fund = type === 'add' ? fixNumber(availableForAdd, 2): fixNumber(availableForRemove, 2)
    handleNtilChange(fund.toString())
  }

  useEffect(() => {
    if (open) {
      setValue('ntli', '')
      setType('add')
    }
  }, [open])



  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onClick={(event) => event.stopPropagation()}
          className="bg-[#232329] rounded-2xl p-0 max-w-[420px]"
          showDialogPrimitiveClose={false}
          >
          <DialogHeader className="border-b border-[#ECECED0A] pb-0">
            <DialogTitle className="py-3 px-3.5 flex w-full items-center justify-between">
              <p className="text-[calc(18rem/16)] py-3">{t('futuresDetails.margin.adjustMargin')}</p>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt="close"
            />
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <div className="px-3 pb-8">
              <div className="pb-5 mb-4">
                <div className='text-[#FFFFFFB2] text-[calc(1rem*(12/16))] leading-[calc(1rem*(21/16))] mb-4'>
                  {t('futuresDetails.margin.adjustMarginIntrod')}
                </div>
                <div className='flex items-center mb-3'>
                  <Controller
                    name="ntli"
                    control={control}
                    render={({ field }) => (
                      <InputBorderGradient
                        unit={<div className="text-[#fff]" onClick={() => {handleSetMax()}}>{t('futuresDetails.margin.max')}</div>}
                        placeholder={t('futuresDetails.margin.amount')}
                        containerClassName="h-12 flex-1"
                        inputClassName="flex-1"
                        value={field.value}
                        inputProps={{
                        }}
                        onChange={(val) => {
                          handleNtilChange(val)
                        }}
                      />
                    )}
                  />

                  <FilterSelect
                    options={orderTypeOptions()}
                    triggerIcon="/images/tokenDetail/icon-chevron-down.svg"
                    triggerIconClassname="w-[8.42px] h-[5.14px] absolute top-[50%] translate-y-[-50%] right-[7.69px]"
                    value={type}
                    selectTriggerProps={{
                      className:
                        'w-[86px] ml-2 h-12  p-3 bg-none rounded-[6px]  relative border border-solid border-[#ECECED14]  app-font-medium text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#FFFFFFCC]',
                    }}
                    onValueChange={(e) => {
                      setType(e)
                    }}
                  />

                </div>


                <div className='mb-2 text-[calc(1rem*(12/16))] leading-[calc(1rem*(21/16))] flex items-center justify-between'>
                  <p className='text-[#FFFFFFB2]'>{`${t('futuresDetails.margin.current')}${info.coin}-${t('futuresDetails.margin.usdMargin')}`}</p>
                  <p>{fixNumber(info.marginUsed, 2)}</p>
                </div>

                <div className='text-[calc(1rem*(12/16))] leading-[calc(1rem*(21/16))] flex items-center justify-between'>
                  <p>{type === 'add' ? t('futuresDetails.margin.availableForAdd') : t('futuresDetails.margin.availableForRemove') }</p>
                  <p>{type === 'add' ? fixNumber(availableForAdd, 2) : fixNumber(availableForRemove, 2)}</p>
                </div>
                

            
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="greyDefault" className="w-full rounded-[50px] h-11" onClick={() => setOpen(false)}>
                  {t('futuresDetails.common.cancel')}
                </Button>
                <Button
                  variant="purpleDefault"
                  className="w-full rounded-[50px] h-11 text-white"
                  isLoading={mutation.isPending}
                  disabled={btnDisabled}
                  onClick={handleSureBtn}
                >
                  {t('futuresDetails.common.confirm')}
                </Button>
              </div>
            </div>
          </FormProvider>

        </DialogContent>
      </Dialog>
  )
}
export default EditMargin
