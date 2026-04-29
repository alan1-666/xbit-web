import { Maybe } from '@/@generated/gql/graphql-trading'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater'
import { usePageType } from '@/hooks/usePageType'
import eventBus from '@/lib/eventBus'
import { formatPrice, formatVolume } from '@/lib/format'
import { setPrice } from '@/redux/modules/tokenDetail.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OhlcUpdate } from '@/types/ohlc.ts'

const PriceToken = ({
  token,
  initialPrice,
  price,
  totalSupply,
}: {
  token: Maybe<string> | undefined
  initialPrice?: number
  price?: number
  totalSupply: Maybe<string> | undefined
}) => {
  const { t } = useTranslation()
  const [ohlcToken, setOhlcToken] = useState<any | null>()
  const dispatch = useAppDispatch()
  // const { ohlcType } = useAppSelector((state: RootState) => state.chart)
  const pageType = usePageType()
  const { ohlcType } = useAppSelector((state) => state.chart[pageType])

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
      setOhlcToken(null)
    }
  }, [token])

  useEffect(() => {
    setOhlcToken(null)
    dispatch(setPrice(0))
  }, [token])

  // const memoMc = useMemo(() => {
  //   return Number(totalSupply) * Number(ohlcToken?.close ?? price ?? initialPrice)
  // }, [ohlcToken, totalSupply, initialPrice, price])

  const realtimePrice = useMemo(() => {
    if (ohlcToken?.close) {
      return +ohlcToken.close
    }
    return Number(price ?? initialPrice)
  }, [price, ohlcToken])

  const realtimeMc = useMemo(() => {
    if (totalSupply && realtimePrice) {
      return +totalSupply * +realtimePrice
    }
    return undefined
  }, [totalSupply, realtimePrice])

  const displayedPrice = useMemo(() => {
    return formatPrice(realtimePrice, {
      showCurrency: true,
    })
  }, [realtimePrice])

  const displayedMc = useMemo(() => {
    return formatVolume(realtimeMc, {
      showCurrency: true,
    })
  }, [realtimeMc])

  return (
    <div className="flex flex-col items-end justify-end gap-1.5">
      <div
        className={classNames('text-[20px] font-[380] leading-none whitespace-nowrap', {
          'text-rise':
            !!ohlcToken && !!initialPrice ? +initialPrice <= +ohlcToken?.close : +ohlcToken?.open <= +ohlcToken?.close,
          'text-fall':
            !!ohlcToken && !!initialPrice ? +initialPrice > +ohlcToken?.close : +ohlcToken?.open > +ohlcToken?.close,
        })}
      >
        {ohlcType === 'price' ? displayedPrice : displayedMc}
        {/*{!ohlcToken?.close ? (*/}
        {/*  ohlcType === 'price' ? (*/}
        {/*    formatPrice(!!price && +price > 0 ? +price : undefined, {*/}
        {/*      showCurrency: true,*/}
        {/*    })*/}
        {/*  ) : memoMc ? (*/}
        {/*    formatVolume(memoMc, {*/}
        {/*      showCurrency: true,*/}
        {/*    })*/}
        {/*  ) : (*/}
        {/*    '--'*/}
        {/*  )*/}
        {/*) : (*/}
        {/*  <>*/}
        {/*    {ohlcType === 'price'*/}
        {/*      ? formatPrice(ohlcToken?.close, {*/}
        {/*          showCurrency: true,*/}
        {/*        })*/}
        {/*      : !!totalSupply*/}
        {/*        ? formatVolume(+ohlcToken?.close * +totalSupply, {*/}
        {/*            showCurrency: true,*/}
        {/*          })*/}
        {/*        : '--'}*/}
        {/*  </>*/}
        {/*)}*/}
      </div>
      <div className="text-white text-[12px] font-[330] leading none min-w-fit whitespace-nowrap">
        {ohlcType === 'price' ? t('chart.toolbar.marketCap') : t('chart.toolbar.price')}{' '}
        <>
          {ohlcType === 'price' ? displayedMc : displayedPrice}
          {/*{ohlcType === 'price'*/}
          {/*  ? memoMc*/}
          {/*    ? formatVolume(memoMc, {*/}
          {/*        roundMode: 'ceil',*/}
          {/*        showCurrency: true,*/}
          {/*      })*/}
          {/*    : '--'*/}
          {/*  : !!ohlcToken?.close*/}
          {/*    ? formatPrice(ohlcToken?.close, {*/}
          {/*        roundMode: 'ceil',*/}
          {/*        showCurrency: true,*/}
          {/*      })*/}
          {/*    : formatPrice(!!price && +price > 0 ? +price : undefined, {*/}
          {/*        roundMode: 'ceil',*/}
          {/*        showCurrency: true,*/}
          {/*      })}*/}
        </>
      </div>
    </div>
  )
}
export default PriceToken
