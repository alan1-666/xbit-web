import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater'
import eventBus from '@/lib/eventBus'
import { setPrice } from '@/redux/modules/tokenDetail.slice.ts'
import { useAppDispatch } from '@/redux/store'
import { useEffect } from 'react'
import { OhlcUpdate } from '@/types/ohlc.ts'
import { TokenDetail } from '@/@generated/gql/graphql-future'

const PriceTokenSubcription = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const dispatch = useAppDispatch()
  const token = tokenDetail?.address

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: { data: OhlcUpdate }) => {
      if (data?.data && data?.data?.address === token) {
        dispatch(setPrice(data?.data?.close))
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [token])

  useEffect(() => {
    dispatch(setPrice(0))
  }, [token])

  return null
}
export default PriceTokenSubcription
