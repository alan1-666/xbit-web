import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useFormContext } from 'react-hook-form'
import { onKeyDownValidateInput, OrderFormType } from '../../useOrderForm'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import IconChecked from '@/components/icon/stroke/IconChecked'
import {
  initialStateTradeConfig,
  tradeConfigActions,
  tradeConfigChainSelected,
} from '@/redux/modules/tradeConfigs.slice'
import clsx from 'clsx'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { getNativeTokenByActiveChain, MIN_BALANCE_FORM_BUY, TYPE_CHAIN } from '@/lib/blockchain'
import { fShortenNumberAdvanced } from '@/lib/number'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const getChainIcon = (chain: TYPE_CHAIN): string => {
  switch (chain) {
    case TYPE_CHAIN.BSC:
      return '/images/orderForm/icon-bnb-gray.png'
    case TYPE_CHAIN.SOLANA:
      return '/images/orderForm/icon-sol-gray.svg'
    case TYPE_CHAIN.MON:
      return '/images/orderForm/icon-monad-gray.svg'
    default:
      return '/images/orderForm/icon-sol-gray.svg'
  }
}

const SelectQuickAmount = () => {
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [isEdit, setIsEdit] = useState(false)
  const { watch, setValue } = useFormContext<OrderFormType>()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const initConfig = initialStateTradeConfig?.tradeConfigs?.[activeChain]?.quickAmount
  const configAmounts = useAppSelector(tradeConfigChainSelected(activeChain))?.quickAmount
  const quickSellPercents =
    useAppSelector((state) => state.tradeConfigs.tradeConfigs.quickSellPercent) ||
    initialStateTradeConfig?.tradeConfigs?.quickSellPercent
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const transactionType = watch('transactionType')
  const isBuy = transactionType === TransactionType.Buy
  const listAmounts = useMemo(() => {
    if (!configAmounts || configAmounts.length > 5) {
      dispatch(
        tradeConfigActions.updateQuickAmount({
          chain: activeChain,
          // @ts-ignore
          quickAmount: initialStateTradeConfig?.tradeConfigs?.[activeChain]?.quickAmount,
        }),
      )
    }
    return configAmounts?.slice(0, configAmounts?.length - 1).map((item: number) => {
      return {
        value: item,
        unit: activeChain.toUpperCase(),
      }
    })
  }, [configAmounts])

  const [listAmountEdited, setListAmountEdited] = useState<number[]>(configAmounts)
  const [listPercentEdited, setListPercentEdited] = useState<number[]>(quickSellPercents)

  const listPercents = useMemo(() => {
    return quickSellPercents
      ?.filter((_: any, index: number) => index !== quickSellPercents.length - 2)
      .map((item: number) => {
        return {
          value: `${item}`,
          unit: '',
        }
      })
  }, [quickSellPercents])

  const onSelectAmount = (value: string) => {
    if (isEdit) return
    if (transactionType === TransactionType.Buy) {
      setValue('quoteAmount', value, { shouldValidate: true })
    }
    if (transactionType === TransactionType.Sell) {
      setValue('percent', value, { shouldValidate: true })
    }
  }

  useEffect(() => {
    if (transactionType) setIsEdit(false)
  }, [transactionType])

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    // Filter out non-numeric characters (handles IME input like Vietnamese)
    const rawValue = e.target.value
    const filteredValue = rawValue.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = filteredValue.split('.')
    let sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue

    // Limit integer part to max 18 digits
    const [integerPart, decimalPart] = sanitizedValue.split('.')
    if (integerPart && integerPart.length > 18) {
      sanitizedValue = integerPart.slice(0, 18) + (decimalPart !== undefined ? '.' + decimalPart : '')
    }

    // Update input value if it was sanitized
    if (rawValue !== sanitizedValue) {
      e.target.value = sanitizedValue
    }

    const value = sanitizedValue
    if (value !== '') {
      if (transactionType === TransactionType.Buy) {
        setListAmountEdited((prevVals) => {
          const updatedNumbers = [...prevVals]
          updatedNumbers[idx] = +value
          return updatedNumbers
        })
      }
      if (transactionType === TransactionType.Sell) {
        const val = +value >= 100 ? '100' : value
        const percent = parseFloat(val)
        if (!isNaN(percent) && percent >= 0 && percent <= 100) {
          const newList = [...listPercentEdited]
          if (idx === 3) {
            newList[idx + 1] = percent
          } else {
            newList[idx] = percent
          }
          setListPercentEdited(newList)
        }
      }
    }
  }

  const onClickSubmit = (): boolean => {
    if (transactionType === TransactionType.Buy) {
      const isValid = listAmountEdited.every((item: number) => {
        if (item < MIN_BALANCE_FORM_BUY) {
          toast.error(
            t('orderForm.errors.minimumOrderQuantity', {
              balance: MIN_BALANCE_FORM_BUY,
              chain: getNativeTokenByActiveChain(activeChain),
            }),
          )
          return false
        }
        return true
      })

      if (!isValid) {
        return false
      }

      dispatch(
        tradeConfigActions.updateQuickAmount({
          chain: activeChain,
          quickAmount: [...listAmountEdited],
        }),
      )
    }
    if (transactionType === TransactionType.Sell) {
      const newQuickSellPercent = [
        ...listPercentEdited.slice(0, listPercentEdited.length - 2),
        quickSellPercents.find((item: any, index: number) => index === quickSellPercents.length - 2),
        listPercentEdited[listPercentEdited.length - 1],
      ]
      dispatch(
        tradeConfigActions.updateQuickSellPercent({
          quickSellPercent: newQuickSellPercent,
        }),
      )
    }
    return true
  }

  const listRender = isBuy ? listAmounts : listPercents

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isEdit && inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEdit])

  return (
    <div className="flex items-center justify-center gap-1 flex-row mt-2 w-full">
      {listRender?.map((item: any, index: number) => (
        <div
          className={clsx(
            'flex items-center justify-between flex-1 rounded-[200px] h-[32px] px-2 py-2.5 gap-1 bg-[#ececed14]',
            {
              'cursor-pointer': !isEdit,
            },
          )}
          key={index}
          onClick={() => onSelectAmount(item.value)}
        >
          {isEdit ? (
            <input
              className={clsx('text-white/80 text-[13px] leading-none flex-1 w-full text-center', {
                'cursor-pointer': !isEdit,
              })}
              ref={index === 0 ? inputRef : null}
              defaultValue={item.value}
              onClick={() => onSelectAmount(item.value)}
              onKeyDown={(e) => onKeyDownValidateInput(e, isBuy ? 9 : 2)}
              disabled={!isEdit}
              onChange={(e) => onChangeInput(e, index)}
            ></input>
          ) : (
            <div
              className={clsx('text-white/80 text-[13px] leading-none w-full flex-1 overflow-hidden text-center', {})}
            >
              {fShortenNumberAdvanced(+item.value, 2, 'down')}
            </div>
          )}
          {isBuy ? (
            <img src={getChainIcon(activeChain)} className="w-3.5 h-3.5" alt="" />
          ) : (
            // <p className="text-[13px] text-white/80">%</p>
            <></>
          )}
        </div>
      ))}
      {!isBuy && (
        <div className="flex items-center justify-center rounded-[200px] h-[32px] w-[32px] px-2 py-2.5 gap-1 bg-[#ececed14] text-[13px] text-white/80">
          %
        </div>
      )}
      <div
        className="flex items-center justify-center p-2 rounded-full bg-[#ececed14] cursor-pointer"
        onClick={() => {
          if (isEdit) {
            const success = onClickSubmit()
            if (success) {
              setIsEdit(false)
            }
          } else {
            // Reset to current config values when entering edit mode
            setListAmountEdited(configAmounts)
            setListPercentEdited(quickSellPercents)
            setIsEdit(true)
          }
        }}
      >
        {isEdit ? (
          <IconChecked className="w-3.5 h-3.5 text-[#b9b9b9]" />
        ) : (
          <img src="/images/tokenDetail/ic-edit-2.svg" className="w-3.5 h-3.5" alt="" />
        )}
      </div>
    </div>
  )
}

export default SelectQuickAmount
