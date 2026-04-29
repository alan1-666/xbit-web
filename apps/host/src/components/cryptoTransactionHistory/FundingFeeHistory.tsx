import { useState } from 'react'
import CurrenciesFilter from './CurrenciesFilter'
import DirectionFilters from './DirectionFilters'
import { currencyOptions, modeOptions } from './type'
import FundingFeeItem from './FundingFeeItem'

const mockFundingFeeHistory: any[] = [
  {
    coin: 'BTC',
    side: 'B',
    limitPx: '68000',
    sz: '0.2',
    origSz: '0.5',
    oid: 100001,
    timestamp: Date.now(),
    triggerCondition: '',
    isTrigger: false,
    triggerPx: '',
    children: [],
    isPositionTpsl: false,
    reduceOnly: false,
    orderType: 'Limit',
    tif: 'GTC',
    cloid: null,
    fundingRate: '0.0005%',
    paymentUSDT: 0.21,
  },
  {
    coin: 'SOL',
    side: 'A',
    limitPx: '68000',
    sz: '0.2',
    origSz: '0.5',
    oid: 100001,
    timestamp: Date.now(),
    triggerCondition: '',
    isTrigger: false,
    triggerPx: '',
    children: [],
    isPositionTpsl: false,
    reduceOnly: false,
    orderType: 'Limit',
    tif: 'GTC',
    cloid: null,
    fundingRate: '0.0005%',
    paymentUSDT: -0.33,
  },
]

export const FundingFeeHistory = () => {
  const [directionFilter, setDrectionFilter] = useState(modeOptions[0].value)
  const [currencyFilter, setCurrencyFilter] = useState(currencyOptions[0].value)

  return (
    <div>
      <div className="mt-2 flex gap-4">
        <DirectionFilters {...{ setDrectionFilter, directionFilter }} />
        <CurrenciesFilter {...{ currencyFilter, setCurrencyFilter }} />
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        {mockFundingFeeHistory.map((fundingFee) => (
          <FundingFeeItem fundingFee={fundingFee} />
        ))}
      </div>
    </div>
  )
}
