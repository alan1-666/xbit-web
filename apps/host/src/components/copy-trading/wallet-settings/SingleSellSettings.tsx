import { Switch } from '@/components/ui/switch'
import XTooltip from '@/components/ui/XTooltip'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'
import { f } from 'fintech-number'
import React, { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { handleOnInput, WalletSettingsFormData } from './schema'
import { getNativeTokenByActiveChain } from '@/lib/blockchain'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
const SingleSellSettings: React.FC = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const configAmount = watch('configAmount')
  const tp = watch('tp')
  const sl = watch('sl')

  const totalTp = useMemo(() => {
    if (!tp || !configAmount) return '--'
    return f((+tp * +configAmount) / 100, {
      decimal: 6,
    })
  }, [configAmount, tp])

  const totalSl = useMemo(() => {
    if (!sl || !configAmount) return '--'
    return f((+sl * +configAmount) / 100, {
      decimal: 6,
    })
  }, [configAmount, sl])

  function handleOnChangeNumber(e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof WalletSettingsFormData, ableMinus: boolean = true) {
    // let value = e.target.value.replace(/[^0-9.]/g, '')
    // ableMinus = true : value able negative
    // ableMinus = false : value not able negative
    let value = e.target.value.replace(ableMinus ? /[^\-0-9.]/g : /[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue(fieldName, value)
  }
  return (
    <>
      <div className="flex items-start mb-0 mt-5">
        <span className="text-sm font-normal w-[40px] pr-[5px] leading-[22px] h-[44px] flex items-center">{t('walletCopy.settings.takeProfit')}</span>
        <div className="flex-1">
          <InputGroup className={cn(errors.tp && 'border-red-500')}>
            <InputGroupInput
              type="text"
              placeholder={t('walletCopy.settings.enterTakeProfit')}
              className={cn("w-full h-[44px] bg-transparent rounded-md pl-3 pr-10 outline-none text-sm")}
              {...register('tp', {
                onChange: (e) => handleOnChangeNumber(e, 'tp'),
              })}
              onKeyDown={(e) => handleOnInput(e, 2)}
              autoComplete='off'
            />
            <InputGroupAddon align="inline-end">
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]">%</span>
            </InputGroupAddon>
          </InputGroup>

          {/* hidden error XBI-6507  */}
          {/*
          {errors.tp && (
            <div className="ml-[8px] my-2 justify-start text-[#FF353C] text-xs font-normal leading-3">{t(errors.tp.message)}</div>
          )} */}
          <div className="text-xs text-[#FFFFFFB2] mb-[28px] mt-[4px] ml-[8px]">
            {t('walletCopy.settings.estimatedProfit')} {totalTp} {getNativeTokenByActiveChain(activeChain)}
          </div>
        </div>
      </div>

      <div className="flex items-start mt-[-7px] mb-2">
        <span className="text-sm font-normal w-[40px] leading-[22px] h-[44px]">{t('walletCopy.settings.stopLoss')}</span>
        <div className="flex-1">
          <InputGroup className={cn(errors.sl && 'border-red-500')}>
            <InputGroupInput
              type="text"
              placeholder={t('walletCopy.settings.enterStopLoss')}
              className="w-full h-[44px] bg-transparent rounded-md pl-3 pr-9 outline-none text-sm"
              {...register('sl', {
                onChange: (e) => handleOnChangeNumber(e, 'sl'),
              })}
              onKeyDown={(e) => handleOnInput(e, 2)}
              autoComplete='off'
            />
            <InputGroupAddon align="inline-end">
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]">%</span>
            </InputGroupAddon>
          </InputGroup>
          <div className="flex items-center justify-between mt-1">
            <div className="text-[11px] text-[#FFFFFFB2] ml-2">
              {t('walletCopy.settings.estimatedLoss')} {totalSl} {getNativeTokenByActiveChain(activeChain)}
            </div>
            <div className="flex items-center gap-4 justify-between">
              <span className="inline-flex items-center mr-1">
                <label className="text-[11px] font-medium text-[#FFFFFFCC]" htmlFor="trailingStopLoss">
                  {t('walletCopy.settings.trailingStopLoss')}
                </label>
                <XTooltip description={t('listCoin.copyTrade.hint.trailingStopLoss.intro')} title={t('walletCopy.settings.trailingStopLoss')} />
              </span>
              <Controller
                name="trailingSl"
                control={control}
                render={({ field }) => (
                  <Switch id="trailingSl" ref={field.ref} checked={field.value} onCheckedChange={field.onChange} className='h-[26px] w-[40px] p-[1px] mt-[1px] ml-[-4px] data-[state=checked]:bg-impartal data-[state=unchecked]:bg-tertiary' classNameThumb={cn('w-[24px]', 'data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-0')} />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SingleSellSettings
