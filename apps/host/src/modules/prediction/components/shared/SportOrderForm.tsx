import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { Event } from '@/@generated/gql/graphql-prediction'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { OrderFormHeader } from './sport-order/OrderFormHeader'
import { OrderFormTabs } from './sport-order/OrderFormTabs'
import { OrderFormOutcomes } from './sport-order/OrderFormOutcomes'
import { OrderFormInput } from './sport-order/OrderFormInput'
import { OrderFormActions } from './sport-order/OrderFormActions'
import { OrderFormLimitInput } from './sport-order/OrderFormLimitInput'

export interface OrderFormProps {
  market: MarketModel | MarketBase
  selectedOutcome: string
  setSelectedOutcome?: (outcome: string) => void
  className?: string
  event?: Event | null
  teams?: TeamModel[]
}

export const SportOrderForm = (props: OrderFormProps) => {
  const { market, selectedOutcome, setSelectedOutcome, className, event, teams } = props
  const [availableFunds] = useState(500) // Mock balance
  const [type, setType] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market')
  const [amount, setAmount] = useState<string>('')
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [shares, setShares] = useState<string>('')

  const outcomes = useMemo(() => {
    return market.outcomes || ['Yes', 'No']
  }, [market])

  const outcomePrices: number[] = useMemo(() => {
    return market?.outcomePrices || [0, 0]
  }, [market])

  return (
    <div className={cn('flex flex-col gap-4 p-4 bg-[#1C1F26] rounded-xl border border-white/5 shadow-sm', className)}>
      <OrderFormHeader event={event} teams={teams} selectedOutcome={selectedOutcome} outcomes={outcomes} />

      <OrderFormTabs type={type} setType={setType} orderType={orderType} setOrderType={setOrderType} />

      <OrderFormOutcomes
        outcomes={outcomes}
        selectedOutcome={selectedOutcome}
        setSelectedOutcome={setSelectedOutcome}
        teams={teams}
        outcomePrices={outcomePrices}
      />

      {orderType === 'market' ? (
        <OrderFormInput amount={amount} setAmount={setAmount} availableFunds={availableFunds} />
      ) : (
        <OrderFormLimitInput
          price={limitPrice}
          setPrice={setLimitPrice}
          shares={shares}
          setShares={setShares}
          availableFunds={availableFunds}
          balance={availableFunds}
        />
      )}

      <OrderFormActions type={type} selectedOutcome={selectedOutcome} teams={teams} outcomes={outcomes} />
    </div>
  )
}
