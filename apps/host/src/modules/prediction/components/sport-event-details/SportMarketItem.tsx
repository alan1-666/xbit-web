import { AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { ReactNode, Ref, useCallback, useEffect, useReducer, useRef } from 'react'
import {
  SportMarketItemContext,
  SportMarketItemSlots,
} from '@/modules/prediction/components/sport-event-details/SportMarketItemContext.ts'

export interface SportMarketItemProps {
  itemKey: string
  children: ReactNode
  triggerRef?: Ref<HTMLButtonElement>
}

export const SportMarketItem = (props: SportMarketItemProps) => {
  const { itemKey, children, triggerRef } = props
  const slots = useRef<SportMarketItemSlots>({})
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const register = useCallback((slot: keyof SportMarketItemSlots, render: () => ReactNode) => {
    const prev = slots.current[slot]
    slots.current[slot] = render

    if (!prev) {
      forceUpdate()
    }
  }, [])

  useEffect(() => {
    forceUpdate()
  }, [children])

  return (
    <SportMarketItemContext.Provider value={{ register }}>
      {children}
      <div className="border rounded-[6px] w-full">
        <AccordionItem value={itemKey} className="border-none">
          <AccordionTrigger ref={triggerRef} className="w-full last:border-none py-0" icon={<></>}>
            <div className="w-full">
              <div className="w-full flex items-center justify-between p-4">
                {slots.current.label?.()}
                {slots.current.outcomes?.()}
              </div>
              {slots.current.variants?.()}
            </div>
          </AccordionTrigger>
          {slots.current.details?.()}
        </AccordionItem>
      </div>
    </SportMarketItemContext.Provider>
  )
}
