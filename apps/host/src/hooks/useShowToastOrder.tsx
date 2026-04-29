import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { Progress } from '@/components/ui/progress'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_UNCOMPLETED_ORDERS } from '@/lib/eventMessages.ts'
import { fShortenNumber } from '@/lib/number'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage.ts'
import { TTL_STORAGE } from '@const/configs.ts'
import { f } from 'fintech-number'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import useGetErrorMsg from './useGetErrorMsg'

const TIME_PROCESS = 30 // seconds
export default function useShowToastOrder() {
  const ID_TOAST = 'toast-process-order'
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const { t } = useTranslation()
  const [_, setToastId] = useState<string[]>([]) // unknown why still set state but not use it
  const { handleGetErrorMessage } = useGetErrorMsg()
  const TimerToastProcess = ({
    id,
    seconds,
    order,
    // setIsProcessing,
  }: {
    id: string | number
    seconds: number
    order: Order
    setIsProcessing: Dispatch<SetStateAction<boolean>>
  }) => {
    const [remaining, setRemaining] = useState(seconds)
    const [valueProcess, setValueProcess] = useState(100)

    useEffect(() => {
      // setIsProcessing(true)
      if (remaining <= 0) {
        toast.dismiss(id)
        // setIsProcessing(false)
        return
      }

      const interval = setInterval(() => {
        setRemaining((prev) => prev - 1)
      }, 1000)

      setValueProcess(0)
      return () => clearInterval(interval)
    }, [id])

    const amount = order?.transactionType === TransactionType.Buy ? order?.quoteAmount : order?.baseAmount
    const amountSymbol = order?.transactionType === TransactionType.Buy ? order?.quoteSymbol : order?.baseSymbol
    return (
      <div className="rounded-[8px] bg-[#27272a] w-100% min-w-[351px] h-fit">
        <Progress
          value={valueProcess}
          timeTran={seconds * 1000}
          className="rounded-t-[8px] rounded-b-none"
          classNameIndicaticator="bg-gradient-to-r from-[#fc65ff] via-white to-[#00fbcf]"
        />
        <div className="px-3 pb-4 pt-4 relative">
          <p className="text-sm leading-[16px]">
            {order?.baseSymbol}: {t(`orderForm.status.orderProcess`)}
          </p>
          <img
            src="/images/icons/icon-x.svg"
            className="absolute top-1 right-1 w-5 h-5 cursor-pointer"
            alt="arrow-left"
            onClick={() => toast.dismiss(id)}
          />
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className="text-xs text-[#ffffff99] leading-[16px]">
              <span>{t('history.type')}: </span>
              <br />
              <span>
                {order?.type === OrderType?.Market && t('orderForm.tabs.marketTrade')}
                {order?.type === OrderType?.Limit && t('orderForm.tabs.limitOrder')}
                {order?.type === OrderType?.TrailingTpsl && t('orderForm.tabs.trailingStopLoss')}
              </span>
              <span>
                {' '}
                {order?.transactionType === TransactionType.Buy && t('history.buy')}
                {order?.transactionType === TransactionType.Sell && t('history.sell')}
              </span>
            </p>
            <p className="text-xs text-[#ffffff99] leading-[16px]">
              <span>{t('history.orderValue')}: </span>
              <br />
              <span>
                {f(amount, {
                  decimal: 6,
                  round: 'down',
                })}{' '}
                {amountSymbol}
              </span>
            </p>
            <p className="text-xs text-[#ffffff99] leading-[16px]">
              <span>{t('history.transactionMarketValue')}: </span>
              <br />
              <span>${fShortenNumber(order?.marketCap, 3)}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const showToastProcessOrder = (order: Order) => {
    //console.log('[showToastProcessOrder]: ', order)
    const id = ID_TOAST + order?.id
    setToastId((prev) => {
      return [...prev, id]
    })
    toast.custom(
      (id) => <TimerToastProcess id={id} seconds={TIME_PROCESS} order={order} setIsProcessing={setIsProcessing} />,
      {
        id: id,
        duration: TIME_PROCESS * 1000,
      },
    )
  }

  const hiddenToastProcessOrder = () => {
    toast.dismiss(ID_TOAST)
    setIsProcessing(false)
  }

  const newHiddenToastProcessOrder = (order: Order) => {
    const id = ID_TOAST + order?.id
    toast.dismiss(id)
    setToastId((prev) => {
      return prev.filter((item) => item !== id)
    })
    setIsProcessing(false)
  }

  const showToastSubmittedSuccessOrder = (order: Order) => {
    // console.log('[showToastSubmittedSuccessOrder]: ', order)
    // appendToLocalStorageArrayWithTTL('holdingUnCompleted', order, TTL_STORAGE)
    eventBus.dispatch(REFETCH_UNCOMPLETED_ORDERS, {
      data: {
        needRefetch: true,
      },
    })

    const amount = order?.transactionType === TransactionType.Buy ? order?.quoteAmount : order?.baseAmount
    const amountSymbol = order?.transactionType === TransactionType.Buy ? order?.quoteSymbol : order?.baseSymbol
    toast.custom(
      (id: string | number) => {
        return (
          <div className="py-4 px-3 rounded-[8px] bg-[#27272a] w-100% min-w-[351px] h-fit relative">
            <p className="text-sm leading-[16px]">
              {order?.baseSymbol}:{' '}
              {order?.transactionType === TransactionType.Buy
                ? t(`orderForm.status.buyOderConfirmed`)
                : t('orderForm.status.sellOderConfirmed')}
            </p>
            <img
              src="/images/icons/icon-x.svg"
              className="absolute top-1 right-1 w-5 h-5 cursor-pointer"
              alt="arrow-left"
              onClick={() => toast.dismiss(id)}
            />
            <div className="flex items-center justify-between mt-3 gap-2">
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.type')} </span>
                <br />
                <span>
                  {order?.type === OrderType?.Market && t('orderForm.tabs.marketTrade')}
                  {order?.type === OrderType?.Limit && t('orderForm.tabs.limitOrder')}
                  {order?.type === OrderType?.TrailingTpsl && t('orderForm.tabs.trailingStopLoss')}
                </span>
                <span>
                  {' '}
                  {order?.transactionType === TransactionType.Buy && t('history.buy')}
                  {order?.transactionType === TransactionType.Sell && t('history.sell')}
                </span>
              </p>
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.orderValue')} </span>
                <br />
                <span>
                  {f(amount, {
                    decimal: 6,
                    round: 'down',
                  })}{' '}
                  {amountSymbol}
                </span>
              </p>
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.transactionMarketValue')} </span>
                <br />
                <span>{!!order?.marketCap ? `$${fShortenNumber(order?.marketCap, 3)}` : '--'}</span>
              </p>
            </div>
          </div>
        )
      },
      {
        duration: 3500,
      },
    )
  }

  const showErrorMessageSubmitOrder = (text: string) => {
    toast.custom(
      (id: string | number) => {
        return (
          <div className="flex items-center gap-2 py-4 px-3 rounded-[8px] bg-[#27272a] w-100% min-w-[351px] h-fit relative">
            <img className="cursor-pointer w-4 h-4" src="/images/icons/ic-close-circle.svg" alt="icon close" />
            <p className="text-sm leading-[16px]">{text}</p>
            <img
              src="/images/icons/icon-x.svg"
              className="absolute top-1 right-1 w-5 h-5 cursor-pointer"
              alt="arrow-left"
              onClick={() => toast.dismiss(id)}
            />
          </div>
        )
      },
      {
        duration: 3500,
      },
    )
  }

  const showToastSubmittedFailOrder = (code: string, order: Order) => {
    // console.log('[showToastSubmittedFailOrder]: ', order)
    const amount = order?.transactionType === TransactionType.Buy ? order?.quoteAmount : order?.baseAmount
    const amountSymbol = order?.transactionType === TransactionType.Buy ? order?.quoteSymbol : order?.baseSymbol
    toast.custom(
      (id: string | number) => {
        return (
          <div className="py-4 px-3 rounded-[8px] bg-[#27272a] w-100% min-w-[351px] h-fit relative">
            <p className="text-sm leading-[16px]">
              {order?.baseSymbol}: {t(`orderForm.status.transactionFail`)}
            </p>
            <img
              src="/images/icons/icon-x.svg"
              className="absolute top-1 right-1 w-5 h-5 cursor-pointer"
              alt="arrow-left"
              onClick={() => toast.dismiss(id)}
            />
            <div className="flex items-center gap-1 mt-2">
              <img className="cursor-pointer w-4 h-4" src="/images/icons/ic-close-circle.svg" alt="icon close" />
              <p className="text-sm leading-[16px]">
                {handleGetErrorMessage(code)}
              </p>
              {/* <p className="text-sm leading-[16px]">{t(`orderForm.status.${code}`)}</p> */}
            </div>
            <div className="flex items-center justify-between mt-2 gap-2">
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.type')}:</span>
                <br />
                <span>
                  {order?.type === OrderType?.Market && t('orderForm.tabs.marketTrade')}
                  {order?.type === OrderType?.Limit && t('orderForm.tabs.limitOrder')}
                  {order?.type === OrderType?.TrailingTpsl && t('orderForm.tabs.trailingStopLoss')}{' '}
                  {order?.transactionType === TransactionType.Buy && t('history.buy')}
                  {order?.transactionType === TransactionType.Sell && t('history.sell')}
                </span>
              </p>
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.orderValue')}:</span>
                <br />
                <span>
                  {f(amount, {
                    decimal: 6,
                    round: 'down',
                  })}{' '}
                  {amountSymbol}
                </span>
              </p>
              <p className="text-xs text-[#ffffff99] leading-[16px]">
                <span>{t('history.transactionMarketValue')}: </span> <br />
                <span>{!!order?.marketCap ? `$${fShortenNumber(order?.marketCap, 3)}` : '--'}</span>
              </p>
            </div>
          </div>
        )
      },
      {
        duration: 3500,
      },
    )
  }
  return {
    showToastProcessOrder,
    hiddenToastProcessOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
    showToastSubmittedFailOrder,
    showErrorMessageSubmitOrder,
    isOrderProcessing: isProcessing,
  }
}
