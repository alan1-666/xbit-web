import GradientBordered from '@components/common/GradientBordered.tsx'
import { cn } from '@/lib/utils.ts'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { SetStateAction, useCallback, useEffect, useMemo } from 'react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import { UseFormReturn } from 'react-hook-form'
import { EthereumFeeDto } from '@/@generated/gql/graphql-core'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { formatBalanceWallet } from '@/lib/number'
import { tradeConfigActions } from '@/redux/modules/tradeConfigs.slice'

type OrderSettingOption = {
  type: string
  value: string | number
  content: string | React.ReactNode
}

type PriorityFeeSettingsProps = {
  methods: UseFormReturn<any>
  data: EthereumFeeDto
  configs: any
}

const GasFeeSettings = ({ methods, data, configs }: PriorityFeeSettingsProps) => {
  const {
    setValue,
    register,
    formState: { errors },
    watch,
    trigger,
  } = methods
  const priorityFeePrice = watch('priorityFeePrice')
  const { type, value } = priorityFeePrice
  const priceEth = useAppSelector(priceChain('ETH'))
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { low, medium, high } = data
  const getFeeEth = (eth: number) => {
    if (eth)
      return formatBalanceWallet({
        balance: eth,
        decimal: 3,
      })
    return 0
  }

  useEffect(() => {
    if (medium) {
      dispatch(
        tradeConfigActions.updateValidateFee({
          chain: activeChain,
          validate: {
            minFee: (+low?.suggestedMaxFeePerGas)?.toFixed(3),
            maxFee: 2,
          },
        }),
      )
    }
  }, [medium])

  const gasFeeSettings: OrderSettingOption[] = useMemo(() => {
    if (!data) return []
    return [
      {
        type: 'medium',
        value: getFeeEth(low?.suggestedMaxFeePerGas),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>市价</div>
            <div>{getFeeEth(low?.suggestedMaxFeePerGas)} Gwei</div>
            <div>
              $
              {formatBalanceWallet({
                balance: (+low?.suggestedMaxFeePerGas * 200000 * priceEth) / Math.pow(10, 9),
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
      {
        type: 'high',
        value: getFeeEth(medium?.suggestedMaxFeePerGas),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>快</div>
            <div>{getFeeEth(medium?.suggestedMaxFeePerGas)} Gwei</div>
            <div>
              $
              {formatBalanceWallet({
                balance: (medium?.suggestedMaxFeePerGas * 200000 * priceEth) / Math.pow(10, 9),
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
      {
        type: 'veryHigh',
        value: getFeeEth(high?.suggestedMaxFeePerGas),
        content: (
          <div className="flex flex-col gap-[8px]">
            <div>极速</div>
            <div>{getFeeEth(high?.suggestedMaxFeePerGas)} Gwei</div>
            <div>
              $
              {formatBalanceWallet({
                balance: (high?.suggestedMaxFeePerGas * 200000 * priceEth) / Math.pow(10, 9),
                decimal: 3,
              })}
            </div>
          </div>
        ),
      },
    ]
  }, [data])

  useEffect(() => {
    if (low && low?.suggestedMaxFeePerGas && configs?.priorityFeePrice?.type === 'medium') {
      updatePriorityFeePrice('high', low?.suggestedMaxFeePerGas)
    }
  }, [low?.suggestedMaxFeePerGas])

  useEffect(() => {
    if (medium && medium?.suggestedMaxFeePerGas && configs?.priorityFeePrice?.type === 'high') {
      updatePriorityFeePrice('high', medium?.suggestedMaxFeePerGas)
    }
  }, [medium?.suggestedMaxFeePerGas])

  useEffect(() => {
    if (high && high?.suggestedMaxFeePerGas && configs?.priorityFeePrice?.type === 'veryHigh') {
      updatePriorityFeePrice('veryHigh', high?.suggestedMaxFeePerGas)
    }
  }, [high?.suggestedMaxFeePerGas])

  const updatePriorityFeePrice = (type: string, value: number) => {
    dispatch(
      tradeConfigActions.updateTradeConfig({
        chain: activeChain,
        config: {
          ...configs,
          priorityFeePrice: {
            type: type,
            value: getFeeEth(value),
          },
        },
      }),
    )
  }

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
          <div className="text-[calc(1rem*(18/16))] text-white">Gas费</div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger type="button">
                <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px]">
                <p className="text-xs leading-none">
                  优先费则是用户愿意额外支付给矿工或验证者的附加费用（小费），从而提高你的订单成交优先级，加快成交速度。在推荐的费率区间内，优先费越高，成交时成功率越高且成交速度越快。如果交易失败，优先费仍会从你的余额中被扣除。
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-[8px] mb-[16px]">
          {gasFeeSettings.map((option) => (
            <GradientBordered
              key={option.value}
              containerClassName={cn(
                'cursor-pointer flex-1 text-center h-[86px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px] hover-scale',
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
          <span className="text-white">自定义Gas费</span>
          <span className="text-[#FFFFFF7A]">({getFeeEth(low?.suggestedMaxFeePerGas)}~∞)</span>
        </div>
        <InputBorderGradient
          unit="Gwei"
          placeHolder={`${getFeeEth(low?.suggestedMaxFeePerGas)}~∞`}
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
        {errors.priorityFeePrice && errors?.priorityFeePrice?.value?.message && (
          <span className="text-xs leading-none text-red-500 mt-1">{errors?.priorityFeePrice?.value?.message}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-[10px] text-[calc(1rem*(14/16))] text-white mb-[12px]">
        <div>总费用：</div>
        <div className="app-font-medium">
          $
          {formatBalanceWallet({
            balance: (+value * priceEth * 200000) / Math.pow(10, 9),
            decimal: 3,
          })}
        </div>
      </div>
    </>
  )
}

export default GasFeeSettings
