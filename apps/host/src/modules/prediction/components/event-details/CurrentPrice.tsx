import { RollingNumber } from '@/modules/prediction/components/portfolio/RollingNumber.tsx'
import { PriceChartBase } from '@/@generated/gql/graphql-prediction.ts'
import { cn } from '@/lib/utils.ts'
import { SolidArrowDownIcon, SolidArrowUpIcon } from '../icons'

export interface CurrentPriceProps {
  price: number
  symbol: PriceChartBase
  color: string
  decimals: number
  isPastEvent?: boolean
  targetPrice: number
}

export const CurrentPrice = (props: CurrentPriceProps) => {
  const { price, color, decimals, isPastEvent, targetPrice } = props
  const isUp = price >= targetPrice

  return (
    <div className="mr-2 lg:mr-4 text-center border-l border-dashed pl-2 lg:pl-4 m-w-20  lg:min-w-25">
      <div className="flex items-center mb-1 gap-2 justify-center">
        <div className="text-sm text-gray-400">{isPastEvent ? 'Final Price' : 'Current price'}</div>
        {!!targetPrice && (
          <div className={cn('text-[11px] flex items-center gap-0.5', isUp ? 'text-rise' : 'text-fall')}>
            {isUp ? <SolidArrowUpIcon fill="#00ce89" /> : <SolidArrowDownIcon fill="#EA3B4F" />}
            <RollingNumber
              value={Math.abs(price - targetPrice).toLocaleString('en-US', {
                maximumFractionDigits: decimals,
                style: 'currency',
                currency: 'USD',
              })}
            />
          </div>
        )}
      </div>
      <div className={cn('text-xl lg:text-2xl font-medium')} style={{ color: isPastEvent ? 'white' : color }}>
        {!price ? (
          '--'
        ) : (
          <RollingNumber
            value={price.toLocaleString('en-US', {
              maximumFractionDigits: decimals,
              style: 'currency',
              currency: 'USD',
            })}
          />
        )}
      </div>
    </div>
  )
}
