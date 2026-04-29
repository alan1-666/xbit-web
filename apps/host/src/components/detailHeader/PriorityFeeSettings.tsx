import GradientBordered from '@components/common/GradientBordered.tsx'
import { cn } from '@/lib/utils.ts'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { useCallback, useEffect, useMemo } from 'react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import { UseFormReturn } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
// import { SolanaFeeDto } from '@/@generated/gql/graphql-core'
import { formatBalanceWallet } from '@/lib/number'
import { tradeConfigActions } from '@/redux/modules/tradeConfigs.slice'
import { useTranslation } from 'react-i18next'
import isEmpty from 'lodash/isEmpty'
import { BASIC_FEE } from '@/lib/blockchain'

type PriorityFeeSettingsProps = {
  methods: UseFormReturn<any>
  data: any //SolanaFeeDto
  configs: any
}

type OrderSettingOption = {
  type: string
  value: string | number
  content: string | React.ReactNode
}

const PriorityFeeSettings = ({ methods, data, configs }: PriorityFeeSettingsProps) => {
  const {
    setValue,
    // register,
    formState: { errors },
    watch,
    trigger,
  } = methods
  const priorityFeePrice = watch('priorityFeePrice')
  const { type, value } = priorityFeePrice

  const { t } = useTranslation()
  const { maxComputeUnits } = !isEmpty(data) ? data : {}
  const { high, medium, veryHigh } = !isEmpty(data) ? data?.priorityFeePrice : {}
  const priceSol = useAppSelector(priceChain('SOL'))
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const basicFee = BASIC_FEE
  const getFeeSol = (sol: number) => {
    if (sol)
      return formatBalanceWallet({
        balance: (sol * maxComputeUnits) / Math.pow(10, 15),
        decimal: 6,
      })
    return 0
  }

  useEffect(() => {
    if (medium) {
      dispatch(
        tradeConfigActions.updateValidateFee({
          chain: activeChain,
          validate: {
            minFee: +getFeeSol(medium),
            maxFee: 2,
          },
        }),
      )
    }
    if (medium && configs?.priorityFeePrice?.type === 'medium') {
      updatePriorityFeePrice('medium', medium)
    }
  }, [medium])

  useEffect(() => {
    if (high && configs?.priorityFeePrice?.type === 'high') {
      updatePriorityFeePrice('high', high)
    }
  }, [high])

  useEffect(() => {
    if (veryHigh && configs?.priorityFeePrice?.type === 'veryHigh') {
      updatePriorityFeePrice('veryHigh', veryHigh)
    }
  }, [veryHigh])

  const updatePriorityFeePrice = (type: string, value: number) => {
    dispatch(
      tradeConfigActions.updateTradeConfig({
        chain: activeChain,
        config: {
          ...configs,
          priorityFeePrice: {
            type: type,
            value: getFeeSol(value),
          },
        },
      }),
    )
  }
  const priorityFeeSettings: OrderSettingOption[] = useMemo(() => {
    if (!data) return []
    return [
      {
        type: 'medium',
        value: getFeeSol(medium),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>{t('orderForm.orderSetting.marketPrice')}</div>
            <div>{getFeeSol(medium)}SOL</div>
            <div>
              {formatBalanceWallet({
                balance: +getFeeSol(medium) * priceSol,
                decimal: 3,
              }) !== '--'
                ? '$'
                : ''}
              {formatBalanceWallet({
                balance: +getFeeSol(medium) * priceSol,
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
      {
        type: 'high',
        value: getFeeSol(high),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>{t('orderForm.orderSetting.quick')}</div>
            <div>{getFeeSol(high)}SOL</div>
            <div>
              {formatBalanceWallet({
                balance: +getFeeSol(high) * priceSol,
                decimal: 3,
              }) !== '--'
                ? '$'
                : ''}
              {formatBalanceWallet({
                balance: +getFeeSol(high) * priceSol,
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
      {
        type: 'veryHigh',
        value: getFeeSol(veryHigh),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>{t('orderForm.orderSetting.fast')}</div>
            <div>{getFeeSol(veryHigh)}SOL</div>
            <div>
              {formatBalanceWallet({
                balance: +getFeeSol(veryHigh) * priceSol,
                decimal: 3,
              }) !== '--'
                ? '$'
                : ''}
              {formatBalanceWallet({
                balance: +getFeeSol(veryHigh) * priceSol,
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
    ]
  }, [data])

  // Input validation handler
  const handleOnInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key
    const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] as const

    // Special case for reload shortcut
    if ((e.ctrlKey || e.metaKey) && char === 'r') {
      console.log('Ctrl+R or Cmd+R pressed!')
      return true
    }

    // Allow control keys
    if (CONTROL_KEYS.includes(char as (typeof CONTROL_KEYS)[number])) {
      return true
    }

    const input = e.currentTarget.value
    const [decimal, decimalPart] = input.split('.')

    // Prevent more than max decimal places
    if (decimal && decimal.length >= 10) {
      e.preventDefault()
      return false
    }

    // Prevent more than max decimal places
    if (decimalPart && decimalPart.length >= 6) {
      e.preventDefault()
      return false
    }

    // Allow numeric input
    if (char >= '0' && char <= '9') {
      return true
    }

    // Allow first decimal point
    if (char === '.') {
      return input.indexOf('.') === -1
    }

    // Prevent other characters
    e.preventDefault()
    return false
  }, [])

  return (
    <>
      <div className="mb-[20px]">
        <div className="flex items-center gap-[6px] leading-[1] mb-[12px]">
          <div className="text-[calc(1rem*(18/16))] text-white">{t('orderForm.orderSetting.priorityFee')}</div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger type="button">
                <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px]">
                <p className="text-xs leading-none">{t('orderForm.orderSetting.priorityFeeTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-[8px] mb-[16px]">
          {priorityFeeSettings.map((option) => (
            <GradientBordered
              key={option.value}
              containerClassName={cn(
                'cursor-pointer flex-1 text-center h-[86px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px]  hover-scale',
                type !== option.type && '!bg-[#ECECED14] !bg-none',
              )}
              innerBgClassName={cn(
                'p-[8px] rounded-[6.5px] !bg-[transparent] flex items-center justify-center',
                type === option.type && '!bg-[rgba(36,36,36,0.7)] text-[#00FFB4]',
              )}
              onClick={() =>
                setValue('priorityFeePrice', {
                  type: option.type,
                  value: option.value,
                })
              }
            >
              {option.content}
            </GradientBordered>
          ))}
        </div>
        <div className="text-[calc(1rem*(14/16))] leading-[1] flex items-center gap-[10px] mb-[12px]">
          <span className="text-white">{t('orderForm.orderSetting.customFee')}</span>
          <span className="text-[#FFFFFF7A]">({getFeeSol(medium)}～2)</span>
        </div>
        <InputBorderGradient
          unit="SOL"
          placeHolder={`${getFeeSol(medium)}～2`}
          containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
          innerBgClassName="rounded-[8px]"
          inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
          unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
          inputProps={{
            value: priorityFeePrice.value,
            onChange: (e) => {
              setValue('priorityFeePrice', {
                type: 'custom',
                value: e.target.value,
              })
              trigger('priorityFeePrice')
            },
            onKeyDown: handleOnInput,
            onMouseLeave: () => trigger('priorityFeePrice'),
          }}
        />

        {errors.priorityFeePrice && (errors as any)?.priorityFeePrice?.value?.message && (
          <span className="text-xs leading-none text-red-500 mt-1">
            {(errors as any)?.priorityFeePrice?.value?.message}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-[10px] text-[calc(1rem*(14/16))] text-white mb-[12px]">
        <div>{t('orderForm.orderSetting.totalCost')}：</div>
        <div className="app-font-medium">
          {formatBalanceWallet({
            balance: (+value + basicFee) * priceSol,
            decimal: 3,
          }) !== '--'
            ? '$'
            : ''}
          {formatBalanceWallet({
            balance: (+value + basicFee) * priceSol,
            decimal: 3,
          })}
        </div>
      </div>
      <>
        <div className="flex items-center justify-between gap-[10px] text-[calc(1rem*(12/16))] text-[#FFFFFF99] mb-[12px]">
          <div>{t('orderForm.orderSetting.basicFee')}：</div>

          <div>
            {formatBalanceWallet({
              balance: basicFee * priceSol,
              decimal: 3,
            }) !== '--'
              ? '$'
              : ''}
            {formatBalanceWallet({
              balance: basicFee * priceSol,
              decimal: 3,
            })}{' '}
            ({basicFee} SOL)
          </div>
        </div>
        <div className="flex items-center justify-between gap-[10px] text-[calc(1rem*(12/16))] text-[#FFFFFF99] mb-[16px]">
          <div>{t('orderForm.orderSetting.fee')}：</div>
          <div>
            {formatBalanceWallet({
              balance: value * priceSol,
              decimal: 3,
            }) !== '--'
              ? '$'
              : ''}
            {formatBalanceWallet({
              balance: value * priceSol,
              decimal: 3,
            })}{' '}
            ({value} SOL)
          </div>
        </div>
      </>
    </>
  )
}

export default PriorityFeeSettings
