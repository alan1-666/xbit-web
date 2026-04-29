import React from 'react'

import { RollingNumber } from '@/modules/prediction/components/portfolio/RollingNumber.tsx'

export interface PriceToBeatProps {
  price: number | null
  decimals: number
  isUpcomingEvent?: boolean
}

export const PriceToBeat: React.FC<PriceToBeatProps> = ({ price, decimals, isUpcomingEvent }: PriceToBeatProps) => {
  return (
    <div className="mr-2 lg:mr-4 text-center min-w-20 lg:min-w-25">
      <div className="text-sm text-gray-400 mb-1">Price to beat</div>
      <div className="text-xl lg:text-2xl font-medium text-[#7b8996]">
        {isUpcomingEvent || !price ? (
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
