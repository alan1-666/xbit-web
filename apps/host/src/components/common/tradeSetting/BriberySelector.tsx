import { TransactionType } from '@/@generated/gql/graphql-trading'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain, TYPE_CHAIN } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TradeSetting, updateTradeSettings } from '@/redux/modules/tradeSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Button } from '@components/ui/button.tsx'
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import TooltipWithInfo from '../TooltipWithInfo'
import { useGetNetworkFee } from '@/hooks/useGetNetWorkFee'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { ErrorTradeSettingProps } from '.'

const BriberySelector = ({
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
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const networkFee = useGetNetworkFee(activeChain as TYPE_CHAIN) as any
  const [isMaxFeeError, setIsMaxFeeError] = useState(false)
  const [isMinFeeError, setIsMinFeeError] = useState(false)
  const [briberyFee, setBriberyFee] = useState<{
    type: string
    value: string | undefined
  }>()
  const minFee = networkFee?.minTipFee || 0
  const maxFee = 2
  const dispatch = useAppDispatch()
  const decimalsBaseToken = getDefaultDecimalsByChain(activeChain)

  useEffect(() => {
    if (setIsError && isError) {
      setIsError({
        ...isError,
        isBriberyError: isMaxFeeError,
      })
    }
  }, [isMaxFeeError])

  useEffect(() => {
    const mockEvent = {
      target: { value: briberyFee?.value || '' },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    onChangeValueBriberyFee(mockEvent, true)
  }, [briberyFee?.value])

  useEffect(() => {
    if (presetSelected && sideSelected) {
      setBriberyFee({
        type: presetSelected?.[sideSelected]?.briberyFee?.type || 'auto',
        value: presetSelected?.[sideSelected]?.briberyFee?.value || '',
      })
    }
  }, [presetSelected, sideSelected])

  const handleBriberyChange = (type: string, value?: string) => {
    const valueMapped = type === 'custom' ? value : briberyFee?.value
    setBriberyFee({
      type: type,
      value: valueMapped,
    })
    const updatedSettings = tradeSettingsByChain.map((item) => {
      if (item.key === presetSelected.key) {
        return {
          ...item,
          [sideSelected]: {
            ...item[sideSelected],
            briberyFee: {
              type,
              value: valueMapped,
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

  //Set max briberyFee value = 2 when value < minFee & value > maxFee
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e?.target?.value
    if (!rawValue) {
      handleBriberyChange('auto')
    }
    if (isMaxFeeError && isForm) {
      const maxPriorityValue = '2'
      setIsMaxFeeError(false)
      handleBriberyChange('custom', maxPriorityValue)
    }
  }

  const onChangeValueBriberyFee = (e: ChangeEvent<HTMLInputElement>, isAmountd?: boolean) => {
    let newValue = e.target.value.replace(/[^0-9.,]/g, '')
    newValue = newValue.replace(/,/g, '.')
    if (newValue.includes('.')) {
      const parts = newValue.split('.')
      newValue = parts[0] + '.' + parts[1]
    }
    const feeValue = Number(newValue)
    if ((feeValue < Number(minFee) || feeValue > Number(maxFee) || isNaN(feeValue)) && !!newValue) {
      if (feeValue < Number(minFee)) {
        setIsMinFeeError(true)
      } else {
        setIsMaxFeeError(true)
      }
    } else {
      setIsMaxFeeError(false)
      setIsMinFeeError(false)
    }
    if (isAmountd) return
    handleBriberyChange('custom', newValue)
  }

  const getTextToolTip = (minFee: number, maxFee: number, chain?: string) => {
    return !!briberyFee?.value && +briberyFee?.value > maxFee
      ? t('tradeSettings.error.bribeFeeTooHigh', {
          value: formatAmount(maxFee, {
            roundMode: 'ceil',
          }),
          chain: chain,
        })
      : t('tradeSettings.error.bribeFeeTooLow', {
          value: formatAmount(minFee, {
            roundMode: 'ceil',
          }),
          chain: chain,
        })
  }

  if (activeChain === TYPE_CHAIN.SOLANA) {
    if (isForm) {
      return (
        <div className="flex items-center gap-1 mt-2.5">
          <div className="flex items-center gap-1 w-24">
            <span className="font-[400] text-[12px] text-[#605e68] leading-none">{`${t('tradeSettings.bribeFee')}`}</span>
            <TooltipWithInfo
              tooltipKey={t('tradeSettings.toolTip.bribeFee')}
              tooltipContentClassName="!max-w-[320px]"
            ></TooltipWithInfo>
          </div>
          <div className="flex flex-1 items-center gap-2.5">
            {networkFee && networkFee?.autoTipFee && (
              <Button
                type="button"
                className={cn(
                  'flex-1 rounded-md transition-colors duration-200 text-[14px] font-normal text-white h-7.5 bg-[#1f1e25] px-0',
                  {
                    'border-[#c8a7fd] border-[1px]': briberyFee?.type === 'auto',
                  },
                )}
                onClick={() => {
                  handleBriberyChange('auto')
                  setIsMaxFeeError(false)
                  setIsMinFeeError(false)
                }}
              >
                <div className="flex items-center gap-0.5">
                  {/* <span>{priorityFeePriceKeyToLabel(key)}</span> */}
                  <span>{t('orderForm.form.automatic')}</span>
                  <span>
                    {formatAmount(networkFee?.autoTipFee, {
                      roundMode: 'ceil',
                    })}
                  </span>
                </div>
              </Button>
            )}
            <div className="flex-1">
              <InputGroup
                className={cn('h-7.5 rounded-md', {
                  'border-[#c8a7fd]': !!briberyFee?.value && briberyFee?.type === 'custom',
                })}
              >
                <InputGroupInput
                  name="briberyFee"
                  className={cn('', {
                    'text-[#EA963A]': isMaxFeeError || isMinFeeError,
                  })}
                  placeholder={`${formatAmount(minFee, {
                    roundMode: 'ceil',
                  })} ~ 2`}
                  value={briberyFee?.value}
                  inputMode="decimal"
                  onBlur={(e) => handleBlur(e)}
                  onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                  onFocus={(e) => onChangeValueBriberyFee(e)}
                  onChange={(e) => onChangeValueBriberyFee(e)}
                />
                {(isMaxFeeError || isMinFeeError) && (
                  <InputGroupAddon align="inline-end">
                    <TooltipWithInfo
                      tooltipKey={getTextToolTip(minFee, maxFee, getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA))}
                      isWarning={true}
                    />
                  </InputGroupAddon>
                )}
              </InputGroup>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="mt-5">
        <div className="flex items-center gap-1">
          <span className="font-[330] text-[15px] text-white leading-none">
            {`${t('tradeSettings.bribeFee')}`} ({t('filter.maximum')}: {maxFee}{' '}
            {getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA)})
          </span>
          <TooltipWithInfo tooltipKey={t('tradeSettings.toolTip.bribeFee')}></TooltipWithInfo>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          {networkFee && networkFee?.autoTipFee && (
            <Button
              type="button"
              className={cn(
                'h-10 w-27 bg-[#2b2b33] flex items-center justify-center py-3 rounded-md cursor-pointer font-[400] text-[14px] text-[#908e98] hover:text-white leading-none transition-colors duration-200',
                {
                  'text-white border-[1px] border-[#c8a7fd]': briberyFee?.type === 'auto',
                },
              )}
              onClick={() => {
                handleBriberyChange('auto')
                setIsMaxFeeError(false)
                setIsMinFeeError(false)
              }}
            >
              <div className="flex items-center gap-0.5">
                <span>{t('orderForm.form.automatic')}</span>
                <span>
                  {formatAmount(networkFee?.autoTipFee, {
                    roundMode: 'ceil',
                  })}
                </span>
              </div>
            </Button>
          )}

          <div className="flex-1">
            <InputGroup
              className={cn('h-10 rounded-md', {
                'border-[#c8a7fd]': !!briberyFee?.value && briberyFee?.type === 'custom',
              })}
            >
              <InputGroupInput
                name="briberyFee"
                className=""
                placeholder={
                  `${formatAmount(networkFee?.minTipFee, {
                    roundMode: 'ceil',
                  })}` + ` ~ 2`
                }
                defaultValue={briberyFee?.value}
                value={briberyFee?.value}
                inputMode="decimal"
                onBlur={(e) => handleBlur(e)}
                onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                onFocus={(e) => onChangeValueBriberyFee(e)}
                onChange={(e) => onChangeValueBriberyFee(e)}
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[14px] text-[#908e98] font-[400]">
                  {getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA)}
                </span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        {(isMaxFeeError || isMinFeeError) && briberyFee?.type !== 'auto' &&  (
          <div
            className={cn('mt-2 text-[14px] text-[#ff6e27] font-[350] leading-[1.3]', {
              'text-[#EA3B4F]': !!briberyFee?.value && +briberyFee?.value > maxFee,
            })}
          >
            {getTextToolTip(minFee, maxFee, getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA))}
          </div>
        )}
      </div>
    )
  }

  return <></>
}

export default BriberySelector
