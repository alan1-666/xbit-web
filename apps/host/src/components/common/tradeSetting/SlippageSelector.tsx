import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import TooltipWithInfo from '../TooltipWithInfo'
import { SlippageOptions, TradeSetting, updateTradeSettings } from '@/redux/modules/tradeSettings.slice'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { ErrorTradeSettingProps } from '.'

const SlippageSelector = ({
  presetSelected,
  sideSelected,
  setTradeSettingsByChain,
  tradeSettingsByChain,
  isForm = false,
  isError,
  setIsError,
}: {
  presetSelected: TradeSetting
  sideSelected: TransactionType
  tradeSettingsByChain: TradeSetting[]
  setTradeSettingsByChain: Dispatch<SetStateAction<TradeSetting[]>>
  isForm?: boolean
  isError?: ErrorTradeSettingProps
  setIsError?: Dispatch<SetStateAction<ErrorTradeSettingProps>>
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [slippage, setSlippage] = useState<{
    type: string
    value: string | undefined
  }>()

  useEffect(() => {
    if (presetSelected && sideSelected) {
      setSlippage({
        type: presetSelected?.[sideSelected]?.newSlippage?.type || 'auto',
        value: presetSelected?.[sideSelected]?.newSlippage?.value || '',
      })
    }
  }, [presetSelected, sideSelected])
  const [error, setError] = useState(false)

  useEffect(() => {
    if (setIsError && isError) {
      setIsError({
        ...isError,
        isSlippageError: error,
      })
    }
  }, [error])

  //Set max slippage value = 50 when value < 1 & value > 50
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e?.target?.value
    if (!rawValue) {
      setSlippage({
        type: 'auto',
        value: '',
      })
      handleSlippageChange('auto')
    }
    if (error && isForm) {
      const maxSlippageValue = '50'
      setError(false)
      setSlippage({
        type: 'custom',
        value: maxSlippageValue,
      })
      handleSlippageChange('custom', maxSlippageValue)
    }
  }

  const handleOnChangeValue = (type: string, e?: ChangeEvent<HTMLInputElement>) => {
    let newValue
    if (e) {
      const rawValue = e?.target?.value
      newValue = rawValue?.replace(/[^0-9.,]/g, '')
      newValue = newValue?.replace(/,/g, '.')
      if (newValue?.includes('.')) {
        const parts = newValue?.split('.')
        newValue = parts[0] + '.' + parts[1]
      }
    }
    newValue = type === 'auto' ? slippage?.value : newValue

    setSlippage({
      type: type,
      value: newValue,
    })

    const feeValue = Number(newValue)
    if ((feeValue < 1 || feeValue > 50) && !!newValue) {
      setError(true)
    } else {
      setError(false)
    }

    handleSlippageChange(type, newValue)
  }

  const handleSlippageChange = (type: string, value?: string) => {
    const updatedSettings = tradeSettingsByChain.map((item) => {
      if (item.key === presetSelected.key) {
        return {
          ...item,
          [sideSelected]: {
            ...item[sideSelected],
            newSlippage: {
              type: type,
              value: value,
            },
          },
        }
      }
      return item
    })
    setTradeSettingsByChain(updatedSettings)
    if (isForm) {
      dispatch(
        updateTradeSettings({
          chain: activeChain,
          settings: updatedSettings,
        }),
      )
    }
  }

  if (isForm) {
    return (
      <div className="flex items-center gap-1 mt-2.5">
        <p className="font-[400] text-[12px] text-[#605e68] leading-none w-24">{t('tradeSettings.slippage')}</p>
        <div className="flex items-center flex-1 gap-2.5">
          {SlippageOptions?.map((option: string) => (
            <Button
              type="button"
              key={option}
              className={cn(
                'flex-1 rounded-md transition-colors duration-200 text-[14px] font-normal text-white h-7.5 bg-[#1f1e25] px-0',
                // value === option ? 'bg-[#3E2761]' : 'bg-transparent',
                {
                  'border-[#c8a7fd] border-[1px]': slippage?.type === 'auto',
                },
              )}
              onClick={() => handleOnChangeValue('auto')}
            >
              {option === '20' ? t('tradeSettings.auto') : option + '%'}
            </Button>
          ))}
          <InputGroup
            className={cn('h-7.5 flex-1', {
              'border-[#c8a7fd]': slippage?.type === 'custom',
            })}
          >
            <InputGroupInput
              name="slippagePercentage"
              className={cn('w-full outline-none text-sm', {
                'text-[#EA963A]': !!error && slippage?.value !== '',
              })}
              placeholder={t('tradeSettings.custom') + ' %'}
              value={slippage?.value}
              inputMode="decimal"
              onBlur={(e) => handleBlur(e)}
              onKeyDown={(e) => onKeyDownValidateInput(e, 2)}
              onFocus={(e) => handleOnChangeValue('custom', e)}
              onChange={(e) => handleOnChangeValue('custom', e)}
            />
            {error && (
              <InputGroupAddon align="inline-end">
                <TooltipWithInfo
                  tooltipKey={
                    slippage?.value && +slippage?.value > 50
                      ? t('orderForm.orderSetting.slippageTooHigh')
                      : t('orderForm.orderSetting.slippageTooLow')
                  }
                  isWarning={true}
                />
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="flex items-center gap-1 w-28">
        <p className="font-[330] text-[15px] text-white leading-none">{t('tradeSettings.slippage')}</p>
        <TooltipWithInfo
          tooltipKey={t('tradeSettings.toolTip.slippage')}
          tooltipContentClassName="!max-w-[320px]"
        ></TooltipWithInfo>
      </div>
      <div className="mt-4 flex items-center gap-2.5">
        {SlippageOptions?.map((option) => (
          <Button
            type="button"
            key={option}
            className={cn(
              'h-10 w-27 bg-[#2b2b33] flex items-center justify-center py-3 rounded-md cursor-pointer font-[400] text-[14px] text-[#908e98] hover:text-white leading-none transition-colors duration-200',
              {
                'text-white border-[#c8a7fd] border-[1px]': slippage?.type === 'auto',
              },
            )}
            onClick={() => handleOnChangeValue('auto')}
          >
            {option === '20' ? t('tradeSettings.auto') : option + '%'}
          </Button>
        ))}
        <InputGroup
          className={cn('flex-1', {
            'border-[#c8a7fd]': slippage?.type === 'custom',
          })}
        >
          <InputGroupInput
            name="slippagePercentage"
            className={cn('w-full  outline-none text-sm', {
              // 'text-[#EA963A]': !!error,
            })}
            placeholder={t('tradeSettings.custom') + ' %'}
            defaultValue={slippage?.value}
            value={slippage?.value}
            inputMode="decimal"
            onBlur={(e) => handleBlur(e)}
            onKeyDown={(e) => onKeyDownValidateInput(e, 2)}
            onFocus={(e) => handleOnChangeValue('custom', e)}
            onChange={(e) => handleOnChangeValue('custom', e)}
          />
          <InputGroupAddon align="inline-end">
            <p>%</p>
          </InputGroupAddon>
        </InputGroup>
      </div>
      {error && (
        <div className="mt-2 text-[14px] text-[#ff6e27] font-[350] leading-[1.3]">
          {slippage?.value && +slippage?.value > 50
            ? t('orderForm.orderSetting.slippageTooHigh')
            : t('orderForm.orderSetting.slippageTooLow')}
        </div>
      )}
    </div>
  )
}

export default SlippageSelector
