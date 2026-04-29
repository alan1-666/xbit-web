import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { Ref, useImperativeHandle, useState } from 'react'
import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import { OrderForm } from '@/modules/prediction/components/shared/OrderForm.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { Drawer, DrawerContent } from '@components/ui/drawer.tsx'
import { cn } from '@/lib/utils.ts'

export interface OrderFormDialogHandle {
  open: (market: MarketModel | MarketBase, outcome: string) => void
}

export interface OrderFormDialogProps {
  ref: Ref<OrderFormDialogHandle>
  defaultMarket: MarketModel | MarketBase
  isEventEnded?: boolean
}

export const OrderFormDialog = (props: OrderFormDialogProps) => {
  const { ref, defaultMarket, isEventEnded } = props
  const [market, setMarket] = useState<MarketModel | MarketBase>(defaultMarket)
  const [open, setOpen] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<string>(market.outcomes[0])
  const { isDesktop } = useResponsive()

  useImperativeHandle(ref, () => ({
    open: (newMarket: MarketModel | MarketBase, outcome: string) => {
      setMarket(newMarket)
      setSelectedOutcome(outcome)
      setOpen(true)
    },
  }))

  const DialogDerived = isDesktop ? Dialog : Drawer
  const DialogContentDerived = isDesktop ? DialogContent : DrawerContent

  return (
    <DialogDerived open={open} onOpenChange={setOpen}>
      <DialogContentDerived className="p-4">
        <OrderForm
          market={market}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={(outcome) => {
            setSelectedOutcome(outcome)
          }}
          className="p-0 bg-transparent border-none"
          isEventEnded={isEventEnded}
          onCompleted={() => setOpen(false)}
          marketInfoClassName={cn('mr-4')}
        />
      </DialogContentDerived>
    </DialogDerived>
  )
}
