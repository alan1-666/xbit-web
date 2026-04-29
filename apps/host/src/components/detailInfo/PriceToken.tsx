import { useEffect, useState } from 'react'
import eventBus from '@/lib/eventBus'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater'
import classNames from 'classnames'
import { Maybe } from '@/@generated/gql/graphql-trading'
import { setPrice } from '@/redux/modules/tokenDetail.slice.ts'
import { useAppDispatch, useAppSelector, RootState } from '@/redux/store'
import { formatPrice } from '@/lib/format'
import { OhlcUpdate } from '@/types/ohlc.ts'

const PriceToken = ({
  token,
  initialPrice,
  price,
}: {
  token: Maybe<string> | undefined
  initialPrice?: number
  price?: number
}) => {
  const [ohlcToken, setOhlcToken] = useState<any | null>()
  const dispatch = useAppDispatch()
  const { ohlcType } = useAppSelector((state: RootState) => state.chart)
  useEffect(() => {
    const listener = (data: { data: OhlcUpdate }) => {
      if (data?.data && data.data.address.toLowerCase() === token?.toLowerCase()) {
        setOhlcToken(data?.data)
        dispatch(setPrice(data?.data?.close))
      }
    }
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, listener)
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED, listener)
    }
  }, [token])

  useEffect(() => {
    setOhlcToken(null)
    dispatch(setPrice(0))
  }, [token])

  return (
    <div
      className={classNames(
        'text-right app-font-medium text-[calc(1rem*(22/16))] leading-[1] mb-[4px] whitespace-nowrap',
        {
          'text-rise':
            !!ohlcToken && !!initialPrice ? +initialPrice <= +ohlcToken?.close : +ohlcToken?.open <= +ohlcToken?.close,
          'text-fall':
            !!ohlcToken && !!initialPrice ? +initialPrice > +ohlcToken?.close : +ohlcToken?.open > +ohlcToken?.close,
        },
      )}
    >
      {!ohlcToken?.close ? (
        formatPrice(!!price && +price > 0 ? +price : undefined, {
          showCurrency: true,
        })
      ) : (
        <>
          {ohlcType === 'price'
            ? formatPrice(ohlcToken?.close, {
                showCurrency: true,
              })
            : '--'}
        </>
      )}
    </div>
  )
}
export default PriceToken
