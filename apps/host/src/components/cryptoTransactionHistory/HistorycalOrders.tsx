import { useState } from 'react'
import CurrenciesFilter from './CurrenciesFilter'
import DirectionFilters from './DirectionFilters'
import { OrderTypeTabs } from './OrderTypeTabs'
import { currencyOptions, modeOptions } from './type'
import HistorycalOrderItem from './HistoricalOrderItem'
import { xOpenOrders } from '../futuresDetails/trade/types'
import TimeRangeFilter from './TimeRangeFilter'

const mockHistorycalOrders: xOpenOrders[] = [
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
  },
  {
    coin: 'ETH',
    side: 'A',
    limitPx: '3800',
    sz: '0.1',
    origSz: '0.2',
    oid: 100002,
    timestamp: Date.now() - 60 * 1000,
    triggerCondition: '',
    isTrigger: false,
    triggerPx: '',
    children: [],
    isPositionTpsl: false,
    reduceOnly: true,
    orderType: 'Market',
    tif: 'IOC',
    cloid: null,
  },
  {
    coin: 'SOL',
    side: 'B',
    limitPx: '160',
    sz: '0.0',
    origSz: '0.1',
    oid: 100003,
    timestamp: Date.now() - 120 * 1000,
    triggerCondition: '',
    isTrigger: true,
    triggerPx: '158',
    children: [
      {
        triggerPx: '165',
        type: 'tp',
      },
      {
        triggerPx: '150',
        type: 'sl',
      },
    ],
    isPositionTpsl: true,
    reduceOnly: false,
    orderType: 'Market',
    tif: 'GTC',
    cloid: null,
  },
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
  },
]

export const HistorycalOrders = () => {
  const [directionFilter, setDrectionFilter] = useState(modeOptions[0].value)
  const [currencyFilter, setCurrencyFilter] = useState(currencyOptions[0].value)
  const [timeRangeFilter, setTimeRangerFilter] = useState('90d')

  return (
    <div>
      <OrderTypeTabs />
      <div className="mt-2 flex gap-4">
        <DirectionFilters {...{ setDrectionFilter, directionFilter }} />
        <CurrenciesFilter {...{ currencyFilter, setCurrencyFilter }} />
        <TimeRangeFilter {...{setTimeRangerFilter,timeRangeFilter}}/>
      </div>
      <div className="mt-1 flex flex-col gap-2">
        {mockHistorycalOrders.map((orderInfo, index) => (
          <HistorycalOrderItem key={index} orderInfo={orderInfo} />
        ))}
      </div>
    </div>
  )
}
