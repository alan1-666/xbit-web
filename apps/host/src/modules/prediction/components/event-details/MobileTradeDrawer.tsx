import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { SportEventOrderForm } from '@/modules/prediction/components/sport-event-details/SportEventOrderForm.tsx'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

export const MobileTradeDrawer = () => {
  const { isTradeDrawerOpen, dispatch } = useEventDetailsPageContext()

  return (
    <AppDrawer
      open={isTradeDrawerOpen}
      setOpen={(val) => {
        if (typeof val === 'function') {
          dispatch(eventDetailsPageActions.setTradeDrawerOpen(val(isTradeDrawerOpen)))
        } else {
          dispatch(eventDetailsPageActions.setTradeDrawerOpen(val))
        }
      }}
      title="Trade drawer"
      drawerContent={<SportEventOrderForm />}
      drawerClassName="bg-[#212127]"
      repositionInputs={false}
    />
  )
}
