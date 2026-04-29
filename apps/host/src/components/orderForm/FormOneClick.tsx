import ButtonOneClick from '@components/orderForm/ButtonOneClick.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormValues } from './'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import {
  initialStateTradeConfig,
  tradeConfigActions,
  tradeConfigChainSelected,
} from '@/redux/modules/tradeConfigs.slice'
import BuySettings from '@components/orderForm/BuySettings.tsx'
import SellSettings from '@components/orderForm/SellSettings.tsx'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain, TYPE_CHAIN } from '@/lib/blockchain'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { formatInputValue } from '@/lib/number'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { IconSolana } from '../common/Icon'
import Decimal from 'decimal.js'

const FormOneClick = ({ tokenDetail, totalToken }: { tokenDetail: TokenDetail; totalToken: string }) => {
  const { setValue, watch } = useFormContext<FormValues>()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const configAmounts = useAppSelector(tradeConfigChainSelected(activeChain))?.quickAmount
  const quickSellPercents =
    useAppSelector((state) => state.tradeConfigs.tradeConfigs.quickSellPercent) ||
    initialStateTradeConfig?.tradeConfigs?.quickSellPercent
  const decimals = tokenDetail?.decimals ? tokenDetail?.decimals : getDefaultDecimalsByChain(activeChain)

  const transactionType = watch('transactionType')
  const dispatch = useAppDispatch()
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
    return configAmounts?.map((item: number) => {
      return {
        value: item,
        unit: activeChain.toUpperCase(),
      }
    })
  }, [configAmounts])

  const listPercents = useMemo(() => {
    return quickSellPercents?.map((item: number) => {
      return {
        value: `${item}%`,
        unit: '',
      }
    })
  }, [quickSellPercents])

  const [val, setVal] = useState<string>(listAmounts?.[0]?.value ?? '')
  const [quickBuyIdx, setQuickBuyIdx] = useState<number>(0)
  const [quickSellIdx, setQuickSellIdx] = useState<number>(0)
  const handleButtonClick = (value: string, type: TransactionType) => {
    if (type === TransactionType.Buy) setValue('quoteAmount', value)
    if (type === TransactionType.Sell) {
      const valPercent = value.split('%')?.[0]
      const baseAmount = +valPercent === 100 ? totalToken : new Decimal(totalToken).mul(valPercent).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()
      setValue('baseAmount', baseAmount)
    }
    setVal(value)
  }

  useEffect(() => {
    if (transactionType === TransactionType.Buy) {
      const val = listAmounts?.[quickBuyIdx]?.value
      setValue('quoteAmount', val)
      setVal(val)
      handleButtonClick(val, TransactionType.Buy)
    }
  }, [listAmounts?.[quickBuyIdx]])

  useEffect(() => {
    if (transactionType === TransactionType.Sell) {
      const val = listPercents?.[quickSellIdx]?.value
      const valPercent = val.split('%')?.[0]
      const baseAmount = +valPercent === 100 ? totalToken : new Decimal(totalToken).mul(valPercent).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()
      setValue('baseAmount', baseAmount)
      setVal(val)
      handleButtonClick(val, TransactionType.Sell)
    }
  }, [listPercents[quickSellIdx]])

  useEffect(() => {
    if (transactionType === TransactionType.Buy) {
      setValue('quoteAmount', listAmounts?.[quickBuyIdx]?.value)
      setVal(listAmounts?.[quickBuyIdx]?.value)
    }
    if (transactionType === TransactionType.Sell) {
      const valPercent = quickSellPercents?.[quickSellIdx]
      const baseAmount = +valPercent === 100 ? totalToken : new Decimal(totalToken).mul(valPercent).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()
      setValue('baseAmount', baseAmount)
      setVal(`${valPercent}%`)
    }
  }, [transactionType, totalToken])

  return (
    <div className="w-full grid grid-cols-2 gap-x-1.5 gap-y-1.5">
      {transactionType === TransactionType.Buy ? (
        <>
          {listAmounts?.map((button: any, index: number) => (
            <ButtonOneClick
              type="button"
              key={index}
              className="hover-scale"
              // unit={button.unit}
              unit={getNativeTokenByActiveChain(activeChain)}
              transactionType={TransactionType.Buy}
              value={button.value}
              isActive={val === button.value}
              onClick={() => {
                handleButtonClick(button.value, TransactionType.Buy)
                setQuickBuyIdx(index)
              }}
              iconProps={
                activeChain === TYPE_CHAIN.SOLANA ? (
                  <IconSolana color={val === button.value ? '#ffffff' : '#464456'} className="ml-1" />
                ) : (
                  <></>
                )
              }
              unitClassName="pb-[1.5px]"
            />
          ))}
          <div className="col-span-1">
            <BuySettings />
          </div>
        </>
      ) : (
        <>
          {listPercents.map((item: any, index: number) => (
            <ButtonOneClick
              type="button"
              key={index}
              className="hover-scale"
              unit={item.unit}
              transactionType={TransactionType.Sell}
              value={item.value}
              isActive={val === item.value}
              onClick={() => {
                handleButtonClick(item.value, TransactionType.Sell)
                setQuickSellIdx(index)
              }}
              iconUrl={''} // should be dynamic
            />
          ))}
          <div className="col-span-1">
            <SellSettings />
          </div>
        </>
      )}
    </div>
  )
}

export default FormOneClick
