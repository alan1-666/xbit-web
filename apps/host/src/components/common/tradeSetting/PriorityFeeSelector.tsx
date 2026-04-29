import { TransactionType } from '@/@generated/gql/graphql-trading'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain, TYPE_CHAIN } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TradeSetting, updateTradeSettings } from '@/redux/modules/tradeSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Button } from '@components/ui/button.tsx'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import TooltipWithInfo from '../TooltipWithInfo'
import { useGetNetworkFee } from '@/hooks/useGetNetWorkFee'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { ErrorTradeSettingProps } from '.'

const PriorityFeeSelector = ({
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
  //Priority Fee
  const [fee, setFee] = useState<{
    type: string
    value: string | undefined
  }>()
  const dispatch = useAppDispatch()
  const decimalsBaseToken = getDefaultDecimalsByChain(activeChain)

  useEffect(() => {
    if (setIsError && isError) {
      setIsError({
        ...isError,
        isPriorityFeeError: isMaxFeeError,
      })
    }
  }, [isMaxFeeError])

  useEffect(() => {
    if (presetSelected && sideSelected) {
      setFee({
        type: presetSelected?.[sideSelected]?.fee?.type || 'high',
        value: presetSelected?.[sideSelected]?.fee?.value || '',
      })
    }
  }, [presetSelected, sideSelected])

  const getFeeSol = useCallback(
    (sol: number) => {
      if (sol) return (sol * networkFee?.maxComputeUnits) / Math.pow(10, 15)
      return 0
    },
    [networkFee],
  )

  const handleFeeChange = (type: string, value?: string) => {
    const valueMapped = type === 'custom' ? value : fee?.value
    setFee({
      type: type,
      value: valueMapped,
    })
    const updatedSettings = tradeSettingsByChain.map((item) => {
      if (item.key === presetSelected.key) {
        return {
          ...item,
          [sideSelected]: {
            ...item[sideSelected],
            fee: {
              type: type,
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

  //Set max priority Fee value = 2 when value < minFee & value > maxFee
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e?.target?.value
    if (!rawValue || +rawValue === 0) {
      setFee({
        type: 'high',
        value: '',
      })
      handleFeeChange('high')
    }
  
    if (isMaxFeeError && isForm) {
      const maxPriorityValue = '2'
      setIsMaxFeeError(false)
      setFee({
        type: 'custom',
        value: maxPriorityValue,
      })
      handleFeeChange('custom', maxPriorityValue)
    }
  }

  const handleChangePriorityFee = (
    e: ChangeEvent<HTMLInputElement>,
    minFee: number,
    maxFee?: number,
    isMounted?: boolean,
  ) => {
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
    if (isMounted) return
    handleFeeChange('custom', newValue)
  }

  const getTextToolTip = (minFee: number, maxFee: number, chain?: string) => {
    return !!fee?.value && +fee?.value > maxFee
      ? t('tradeSettings.error.priorityFeeTooHigh', {
          value: formatAmount(maxFee, {
            roundMode: 'ceil',
          }),
          chain: chain,
        })
      : t('tradeSettings.error.priorityFeeTooLow', {
          value: formatAmount(minFee, {
            roundMode: 'ceil',
          }),
          chain: chain,
        })
  }

  if (activeChain === TYPE_CHAIN.SOLANA) {
    const minFee = getFeeSol(networkFee?.priorityFeePrice?.medium) || 0
    const maxFee = 2

    useEffect(() => {
      const mockEvent = {
        target: { value: fee?.value || '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleChangePriorityFee(mockEvent, minFee, maxFee, true)
    }, [fee?.value, minFee, maxFee])

    if (isForm) {
      return (
        <div className="flex items-center gap-1 mt-2.5">
          <div className="flex items-center gap-1 w-24">
            <span className="font-[400] text-[12px] text-[#605e68] leading-none">{t('tradeSettings.priorityFee')}</span>
            <TooltipWithInfo
              tooltipKey={t('tradeSettings.toolTip.priorityFee')}
              tooltipContentClassName="!max-w-[320px]"
            />
          </div>
          <div className="flex flex-1 items-center gap-2.5">
            {networkFee &&
              networkFee.priorityFeePrice &&
              Object?.keys(networkFee.priorityFeePrice).map((key) => {
                const priorityFee = networkFee.priorityFeePrice[key]
                if (key === 'high')
                  return (
                    <Button
                      key={key}
                      type="button"
                      className={cn(
                        'flex-1 rounded-md transition-colors duration-200 text-[14px] font-normal text-white h-7.5 bg-[#1f1e25] px-0',
                        {
                          'border-[1px] border-[#c8a7fd]': key === fee?.type,
                        },
                      )}
                      onClick={() => {
                        handleFeeChange(key)
                        setIsMaxFeeError(false)
                      }}
                    >
                      <div className="flex items-center gap-0.5">
                        {/* <span>{priorityFeePriceKeyToLabel(key)}</span> */}
                        <span>{t('orderForm.form.automatic')}</span>
                        <span>
                          {formatAmount(getFeeSol(priorityFee).toFixed(6), {
                            roundMode: 'ceil',
                          })}
                        </span>
                      </div>
                    </Button>
                  )
              })}

            <div className="flex-1">
              <InputGroup
                className={cn('h-7.5 rounded-md', {
                  'border-[#c8a7fd]': !!fee?.value && fee?.type === 'custom',
                })}
              >
                <InputGroupInput
                  name="priorityFee"
                  placeholder={`${formatAmount(getFeeSol(networkFee?.priorityFeePrice.medium), {
                    roundMode: 'ceil',
                  })} ~ ${maxFee}`}
                  value={fee?.value}
                  className={cn('', {
                    'text-[#EA963A]': isMaxFeeError || isMinFeeError,
                  })}
                  inputMode="decimal"
                  onBlur={(e) => handleBlur(e)}
                  onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                  onFocus={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                  onChange={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                />
                {(isMaxFeeError || isMinFeeError) && (
                  <InputGroupAddon align="inline-end">
                    <TooltipWithInfo tooltipKey={getTextToolTip(minFee, maxFee)} isWarning={true} />
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
            {t('tradeSettings.priorityFee')}{' '}
            {`(${t('filter.maximum')}: ${maxFee} ${getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA)})`}
          </span>
          <TooltipWithInfo tooltipKey={t('tradeSettings.toolTip.priorityFee2')} />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          {networkFee &&
            networkFee.priorityFeePrice &&
            Object?.keys(networkFee.priorityFeePrice).map((key) => {
              const priorityFee = networkFee.priorityFeePrice[key]
              if (key === 'high')
                return (
                  <Button
                    key={key}
                    type="button"
                    className={cn(
                      'h-10 w-27 bg-[#2b2b33] flex items-center justify-center py-3 rounded-md cursor-pointer font-[400] text-[14px] text-[#908e98] hover:text-white leading-none transition-colors duration-200',
                      {
                        'text-white border-[1px] border-[#c8a7fd]': key === fee?.type,
                      },
                    )}
                    onClick={() => {
                      handleFeeChange(key)
                      setIsMaxFeeError(false)
                      setIsMinFeeError(false)
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      {/* <span>{priorityFeePriceKeyToLabel(key)}</span> */}
                      <span>{t('orderForm.form.automatic')}</span>
                      <span>
                        {formatAmount(getFeeSol(priorityFee).toFixed(6), {
                          roundMode: 'ceil',
                        })}
                      </span>
                    </div>
                  </Button>
                )
            })}

          <div className="flex-1">
            <InputGroup
              className={cn('h-10 rounded-md', {
                'border-[#c8a7fd]': !!fee?.value && fee?.type === 'custom',
              })}
            >
              <InputGroupInput
                name="priorityFee"
                className=""
                placeholder={`${formatAmount(getFeeSol(networkFee?.priorityFeePrice.medium), {
                  roundMode: 'ceil',
                })} ~ 2`}
                value={fee?.value}
                inputMode="decimal"
                onBlur={(e) => handleBlur(e)}
                onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                onFocus={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                onChange={(e) => handleChangePriorityFee(e, minFee, maxFee)}
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[14px] text-[#908e98] font-[400]">
                  {getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA)}
                </span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        {(isMaxFeeError || isMinFeeError) && fee?.type !== 'high' && (
          <div
            className={cn('mt-2 text-[14px] text-[#ff6e27] font-[350] leading-[1.3]', {
              'text-[#EA3B4F]': !!fee?.value && +fee?.value > maxFee,
            })}
          >
            {getTextToolTip(minFee, maxFee, getNativeTokenByActiveChain(TYPE_CHAIN.SOLANA))}
          </div>
        )}
      </div>
    )
  }

  const gasFees = [
    {
      key: 'low',
      label: t('tradeSettings.marketPrice'),
    },
    {
      key: 'medium',
      label: t('tradeSettings.quick'),
    },
    {
      key: 'high',
      label: t('tradeSettings.fastest'),
    },
  ]

  if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON) {
    const minFee = networkFee?.low?.suggestedMaxFeePerGas || 0
    const maxFee = activeChain === TYPE_CHAIN.BSC ? 2 : 1000

    useEffect(() => {
      const mockEvent = {
        target: { value: fee?.value || '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleChangePriorityFee(mockEvent, minFee, maxFee, true)
    }, [fee?.value, minFee, maxFee])

    if (isForm) {
      return (
        <div className="flex items-center gap-1 mt-2.5">
          <div className="flex items-center gap-1 w-24">
            <span className="font-[400] text-[12px] text-[#605e68] leading-none">{t('tradeSettings.gasFee')}</span>
            <TooltipWithInfo
              tooltipKey={t('tradeSettings.toolTip.priorityFee')}
              tooltipContentClassName="!max-w-[320px]"
            />
          </div>
          <div className="flex flex-1 items-center gap-2.5">
            {networkFee &&
              gasFees.map((gasFee) => {
                if (gasFee?.key === 'high')
                  return (
                    <Button
                      key={gasFee.key}
                      className={cn(
                        'flex-1 rounded-md transition-colors duration-200 text-[14px] font-normal text-white h-7.5 bg-[#1f1e25] px-0',
                        {
                          'border-[#c8a7fd] border-[1px]': gasFee.key === fee?.type,
                        },
                      )}
                      onClick={() => {
                        handleFeeChange(gasFee.key)
                        setIsMaxFeeError(false)
                        setIsMinFeeError(false)
                      }}
                    >
                      <div className="flex items-center gap-0.5">
                        <span>{t('orderForm.form.automatic')}</span>
                        <span>
                          {formatAmount(networkFee?.[gasFee.key]?.suggestedMaxFeePerGas || 0, {
                            roundMode: 'ceil',
                          })}
                        </span>
                      </div>
                    </Button>
                  )
              })}
            <div className="flex-1">
              <InputGroup
                className={cn('h-7.5 rounded-md', {
                  'border-[#c8a7fd]': !!fee?.value && fee?.type === 'custom',
                })}
              >
                <InputGroupInput
                  name="priorityFee"
                  className={cn('', {
                    'text-[#EA963A]': isMaxFeeError || isMinFeeError,
                  })}
                  placeholder={`${formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
                    roundMode: 'ceil',
                  })} ~ ${maxFee}`}
                  value={fee?.value}
                  inputMode="decimal"
                  onBlur={(e) => handleBlur(e)}
                  onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                  onFocus={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                  onChange={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                />
                {(isMaxFeeError || isMinFeeError) && (
                  <InputGroupAddon align="inline-end">
                    <TooltipWithInfo tooltipKey={getTextToolTip(minFee, maxFee)} isWarning={true} />
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
          <span className="font-normal text-[14px] text-white/80 leading-none">{t('tradeSettings.gasFee')}</span>
          <TooltipWithInfo tooltipKey={t('tradeSettings.toolTip.priorityFee2')} />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          {networkFee &&
            gasFees.map((gasFee) => {
              if (gasFee.key === 'high')
                return (
                  <Button
                    key={gasFee.key}
                    type="button"
                    className={cn(
                      'h-10 w-27 bg-[#2b2b33] flex items-center justify-center py-3 rounded-md cursor-pointer font-[330] text-[13px] leading-none text-white transition-colors duration-200',
                      {
                        'border-[1px] border-[#c8a7fd]': gasFee.key === fee?.type,
                      },
                    )}
                    onClick={() => {
                      handleFeeChange(gasFee.key)
                      setIsMaxFeeError(false)
                      setIsMinFeeError(false)
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      <span>{t('orderForm.form.automatic')}</span>
                      <span>
                        {formatAmount(networkFee?.[gasFee.key]?.suggestedMaxFeePerGas || 0, {
                          roundMode: 'ceil',
                        })}
                      </span>
                    </div>
                  </Button>
                )
            })}
          <div className="flex-1">
            <InputGroup
              className={cn('h-10 rounded-md', {
                'border-[#c8a7fd]': !!fee?.value && fee?.type === 'custom',
              })}
            >
              <InputGroupInput
                name="priorityFee"
                className=""
                placeholder={`${formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
                  roundMode: 'ceil',
                })} ~ ${maxFee}`}
                value={fee?.value}
                inputMode="decimal"
                onBlur={(e) => handleBlur(e)}
                onFocus={(e) => handleChangePriorityFee(e, minFee, maxFee)}
                onKeyDown={(e) => onKeyDownValidateInput(e, decimalsBaseToken)}
                onChange={(e) => handleChangePriorityFee(e, minFee, maxFee)}
              />
              <InputGroupAddon align="inline-end">
                <span className="text-[14px] text-[#908e98] font-[400]">Gwei</span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        {(isMaxFeeError || isMinFeeError) && fee?.type !== 'high' && (
          <div
            className={cn('mt-2 text-[14px] text-[#ff6e27] font-[350] leading-[1.3]', {
              'text-[#EA3B4F]': !!fee?.value && +fee?.value > maxFee,
            })}
          >
            {getTextToolTip(minFee, maxFee, 'Gwei')}
          </div>
        )}
      </div>
    )
  }

  return <></>
}

export default PriorityFeeSelector
