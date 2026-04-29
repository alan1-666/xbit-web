import { IconCPDelete } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { get } from 'lodash-es'
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { handleOnInput, WalletSettingsFormData } from './schema'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const BatchSellSettings: React.FC = () => {
  const {
    register,
    control,
    setValue,
    trigger,
    formState: { errors },
    watch,
  } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tpslConfig',
  })

  // Watch all values in the tpslConfig array
  const tpslConfigValues = watch('tpslConfig')

  // Calculate the total sum of value and sellRate
  const totalPercent = tpslConfigValues?.reduce((sum, config) => {
    // const value = parseFloat(config.value || '0');
    const sellRate = parseFloat(`${get(config, 'sellRate', 0)}`) || 0
    return sum + sellRate
  }, 0)

  const addBatchRule = async () => {
    //trigger check validate before add new rule if have error, not add new rule
    const isValidate = await trigger('tpslConfig')
    if (fields.length < 10 && !errors.tpslConfig) {
      append({
        value: '',
        sellRate: '',
      })
    }
  }

  function handleOnChangeNumber(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof WalletSettingsFormData,
    ableMinus: boolean = true,
    max?: number,
  ) {
    // allow digits, dot, and (optionally) minus
    let value = e.target.value.replace(ableMinus ? /[^0-9.\-]/g : /[^0-9.]/g, '')

    // keep only a single leading minus (if allowed)
    if (ableMinus) {
      const isNegative = value.startsWith('-')
      value = value.replace(/-/g, '')
      if (isNegative) value = '-' + value
    } else {
      // if minus not allowed, ensure no minus remains
      value = value.replace(/-/g, '')
    }

    if (max) {
      value = Math.min(Number(value), max).toString()
    }
    setValue(fieldName, value)
  }

  return (
    <div className="mt-4">
      {fields.map((rule, index) => {
        const isMinus = parseFloat(`${watch(`tpslConfig.${index}.value`)}`) < 0
        return (
          <div key={rule.id} className="mb-[3px] flex flex-row gap-1">
            <div className="text-[13px] font-normal text-[#FFFFFFCC] whitespace-nowrap flex items-center mt-[8px] min-w-[46px]">
              {t('copyTrade.settings.Level', { level: index + 1 })}
            </div>
            <div className="flex flex-row w-full gap-[6px]">
              <InputGroup>
                <InputGroupAddon className="pl-1.5">
                  <span
                    className="text-[10px] text-[#9B9B9B] h-full rounded-sm max-w-14
                pr-1.5 reak-all leading-tight text-center inline-flex items-center pt-1"
                  >
                    {isMinus ? t('copyTrade.customTPSL.estimateSL') : t('copyTrade.settings.TpPercent')}
                  </span>
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  {...register(`tpslConfig.${index}.value` as const, {
                    required: t('listCoin.copyTrade.warning.profitPercent'),
                    onChange: (e) =>
                      handleOnChangeNumber(e, `tpslConfig.${index}.value` as keyof WalletSettingsFormData),
                  })}
                  className="bg-transparent text-[13px] outline-none flex-1 px-1.5 w-full text-center"
                  onKeyDown={(e) => handleOnInput(e, 2, true, true)}
                  autoComplete="off"
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[#FFFFFFB2] text-[12px] inline-flex items-center">%</span>
                </InputGroupAddon>
              </InputGroup>
              <InputGroup>
                <InputGroupAddon className="pl-1.5">
                  <span className="text-[10px] text-[#9B9B9B] h-full rounded-sm max-w-14 pr-1.5 break-all leading-tight text-center inline-flex items-center pt-1">
                    {t('copyTrade.settings.SellOutPercent')}
                  </span>
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  {...register(`tpslConfig.${index}.sellRate` as const, { 
                    onChange: (e) =>
                      handleOnChangeNumber(
                        e,
                        `tpslConfig.${index}.sellRate` as keyof WalletSettingsFormData,
                        false,
                        100,
                      ),
                  })}
                  className="bg-transparent text-sm outline-none flex-1 px-1.5 w-full text-center"
                  onKeyDown={(e) => handleOnInput(e, 2, false, true)}
                  autoComplete="off"
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[#FFFFFFB2] text-[12px] inline-flex items-center">%</span>
                </InputGroupAddon>
              </InputGroup>
              <button
                type="button"
                className={cn('flex items-center justify-center mt-1', fields.length === 1 && 'opacity-50')}
                onClick={() => (fields.length === 1 ? null : remove(index))}
              >
                <IconCPDelete />
              </button>
            </div>
          </div>
        )
      })}
      <div className="text-end pl-[50px] pr-[19px]">
        <Button
          variant="default"
          type="button"
          // disabled={Object.keys(errors).length > 0}
          className="w-full py-0 px-3.5 text-center h-9 text-sm text-[#FBFBFB] bg-[#79778C29] font-normal disabled:opacity-50 mt-[2px] rounded-[6px]"
          disabled={fields.length >= 10}
          onClick={addBatchRule}
        >
          {t('walletCopy.settings.addRule')}
        </Button>
        {parseInt(`${totalPercent || 0}`) < 100 && (
          <div className="w-full text-center text-[11px] text-[#EA963A] mt-[5px]">
            {t('walletCopy.settings.noFullSellWarning')}
          </div>
        )}
      </div>
    </div>
  )
}

export default BatchSellSettings
