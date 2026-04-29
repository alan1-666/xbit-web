import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo, useCallback, useEffect } from 'react'
import { OrderForm as BaseOrderForm } from '@/modules/prediction/components/shared/OrderForm.tsx'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'
import { useLocation } from 'react-router-dom'

export const OrderForm = () => {
  const { event, selectedMarket, selectedOutcome, isEnded, orderFormState, dispatch, formRef } =
    useEventDetailsPageContext()
  const location = useLocation()
  const market = useMemo(() => {
    if (selectedMarket) return selectedMarket
    const markets = event?.markets || []
    return markets[0]
  }, [event, selectedMarket])

  useEffect(() => {
    const market = location.state?.market
    const outcome = location.state?.outcome?.toLowerCase()
    if (outcome === 'no' || outcome === 'down' || outcome === 'negative') {
      dispatch(eventDetailsPageActions.setSelectedOutcome('no'))
    } else {
      dispatch(eventDetailsPageActions.setSelectedOutcome('yes'))
    }
    if (market) {
      dispatch(eventDetailsPageActions.setSelectedMarket(market))
    }
  }, [location.state])

  const handleSetSelectedOutcome = useCallback(
    (outcome: 'yes' | 'no') => dispatch(eventDetailsPageActions.setSelectedOutcome(outcome)),
    [dispatch],
  )

  const handleOnSideChange = useCallback(
    (side: 'buy' | 'sell' | undefined) => dispatch(eventDetailsPageActions.setSelectedSide(side)),
    [dispatch],
  )

  return (
    <BaseOrderForm
      market={market}
      selectedOutcome={orderFormState?.outcome || selectedOutcome || ''}
      setSelectedOutcome={handleSetSelectedOutcome}
      isEventEnded={isEnded}
      side={orderFormState?.side || 'buy'}
      initialSize={orderFormState?.size}
      updateId={orderFormState?.timestamp}
      onSideChange={handleOnSideChange}
      formRef={formRef}
    />
  )
}
