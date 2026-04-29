import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui/select.tsx'

const tabs = [
  { label: 'Buy', value: 'buy' },
  { label: 'Sell', value: 'sell' },
]

interface OrderFormTabsProps {
  type: 'buy' | 'sell'
  setType: (type: 'buy' | 'sell') => void
  orderType: 'limit' | 'market'
  setOrderType: (orderType: 'limit' | 'market') => void
}

export const OrderFormTabs = ({ type, setType, orderType, setOrderType }: OrderFormTabsProps) => {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-0">
      <MovingLineTabs
        tabs={tabs}
        defaultTab={type}
        containerClassName="justify-start bg-transparent px-0"
        itemClassName="px-0 mr-4"
        onTabChange={(value) => setType(value as 'buy' | 'sell')}
      />
      <div className="pb-2">
        <Select value={orderType} onValueChange={(value) => setOrderType(value as 'limit' | 'market')}>
          <SelectTrigger className="border-none h-8 gap-1 px-0 focus:ring-0 text-foreground font-semibold bg-transparent shadow-none w-fit">
            <span className="text-sm">{orderType === 'market' ? 'Market' : 'Limit'}</span>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="limit">Limit</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
