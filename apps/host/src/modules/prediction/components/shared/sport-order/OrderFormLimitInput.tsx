import { useState } from 'react'
import { LimitPriceInput } from './LimitPriceInput'
import { SharesInput } from './SharesInput'
import { ExpirationSelect } from './ExpirationSelect'
import { OrderSummary } from './OrderSummary'

interface OrderFormLimitInputProps {
  price: string
  setPrice: (price: string) => void
  shares: string
  setShares: (shares: string) => void
  availableFunds: number
}

export const OrderFormLimitInput = ({
  price,
  setPrice,
  shares,
  setShares,
  availableFunds,
}: OrderFormLimitInputProps) => {
  const [expirationEnabled, setExpirationEnabled] = useState(false)
  const [expirationTime, setExpirationTime] = useState('end_of_day')
  const [customDate, setCustomDate] = useState<Date | null>(null)

  const handleSharesAdjustment = (adjustment: number) => {
    const current = parseFloat(shares) || 0
    // Prevent negative shares
    const newValue = Math.max(0, current + adjustment)
    setShares(newValue.toString())
  }

  const handlePriceAdjustment = (adjustment: number) => {
    const current = parseFloat(price) || 0
    // Clamp between 1 and 99 cents typically, or 0-100
    let newValue = current + adjustment
    if (newValue < 0) newValue = 0
    if (newValue > 99) newValue = 99
    setPrice(newValue.toString())
  }

  const cost = (parseFloat(price) / 100) * (parseFloat(shares) || 0)

  return (
    <div className="flex flex-col gap-4 w-full">
      <LimitPriceInput
        price={price}
        setPrice={setPrice}
        onAdjust={handlePriceAdjustment}
        availableFunds={availableFunds}
      />

      <div className="w-full h-px bg-border/40 my-1" />

      <SharesInput
        shares={shares}
        setShares={setShares}
        onAdjust={handleSharesAdjustment}
      />

      <div className="w-full h-px bg-border/40 my-1" />

      <ExpirationSelect
        enabled={expirationEnabled}
        setEnabled={setExpirationEnabled}
        value={expirationTime}
        setValue={setExpirationTime}
        setCustomDate={setCustomDate}
      />

      <OrderSummary cost={cost} />
    </div>
  )
}

