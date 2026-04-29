import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useCallback } from 'react'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer.ts'
import { OrderForm as BaseOrderForm } from '@/modules/prediction/components/shared/OrderForm.tsx'

import { useTranslation } from 'react-i18next'

export const OrderFormSheet = () => {
  const { isTradeDrawerOpen, selectedMarket, selectedOutcome, isEnded, orderFormState, dispatch } =
    useEventDetailsPageContext()
  const { t } = useTranslation()

  const handleOnOpenChange = useCallback(
    (open: boolean) => dispatch(eventDetailsPageActions.setTradeDrawerOpen(open)),
    [dispatch],
  )

  const handleSetSelectedOutcome = useCallback(
    (outcome: 'yes' | 'no') => dispatch(eventDetailsPageActions.setSelectedOutcome(outcome)),
    [dispatch],
  )

  const handleOnSideChange = useCallback(
    (side: 'buy' | 'sell' | undefined) => dispatch(eventDetailsPageActions.setSelectedSide(side)),
    [dispatch],
  )

  return (
    <Drawer open={isTradeDrawerOpen} onOpenChange={handleOnOpenChange}>
      <DrawerContent className="max-h-[90vh] max-w-3xl mx-auto prediction bg-[#212127] rounded-t-[20px] !">
        <DrawerHeader className="hidden flex-row items-center justify-between py-2.5 px-4">
          <DrawerTitle className="font-normal!">{t('prediction.trade.buyPosition')}</DrawerTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOnOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerHeader>
        <div className="px-4 pb-4 pt-3">
          {selectedMarket && (
            <BaseOrderForm
              market={selectedMarket}
              selectedOutcome={orderFormState?.outcome || selectedOutcome || ''}
              setSelectedOutcome={handleSetSelectedOutcome}
              isEventEnded={isEnded}
              side={orderFormState?.side || 'buy'}
              initialSize={orderFormState?.size}
              updateId={orderFormState?.timestamp}
              onSideChange={handleOnSideChange}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
