import { useState } from 'react'
import DirectionFilters from './DirectionFilters'
import { OrderTypeTabs } from './OrderTypeTabs'
import { modeOptions } from './type'
import CheckboxWithLabel from '../common/CheckboxWithLabel'
import MyPositionCard from '../futuresDetails/trade/MyPositionList/MyPositionCard'
import { IconEmpty } from '../icon'
import { xPositions } from '../futuresDetails/trade/types'
import './style.css'

const filterPositions: xPositions[] = [
  {
    coin: 'BTC',
    cumFunding: {
      allTime: '-12.3',
      sinceChange: '-0.3',
      sinceOpen: '-0.5',
    },
    entryPx: '43000',
    leverage: {
      rawUsd: '500',
      type: 'cross',
      value: 10,
    },
    side: 'B',
    liquidationPx: '39000',
    marginUsed: '50',
    maxLeverage: 20,
    positionValue: '500',
    returnOnEquity: '0.12',
    markPrice: '43500',
    szi: '0.05',
    unrealizedPnl: '20',
    tpPrice: '45000',
    slPrice: '42000',
    midPrice: '43200',
    timestamp: Date.now() - 90 * 1000,
  },
  {
    coin: 'ETH',
    cumFunding: {
      allTime: '1.2',
      sinceChange: '0.1',
      sinceOpen: '0.3',
    },
    entryPx: '3000',
    leverage: {
      rawUsd: '300',
      type: 'isolated',
      value: 5,
    },
    side: 'A',
    liquidationPx: '2800',
    marginUsed: '60',
    maxLeverage: 10,
    positionValue: '300',
    returnOnEquity: '-0.05',
    markPrice: '2900',
    szi: '-0.1',
    unrealizedPnl: '-15',
    tpPrice: '3100',
    slPrice: '2850',
    midPrice: '2950',
    timestamp: Date.now() - 110 * 1000,
  },
  {
    coin: 'SOL',
    cumFunding: {
      allTime: '0.5',
      sinceChange: '0.05',
      sinceOpen: '0.1',
    },
    entryPx: '100',
    leverage: {
      rawUsd: '100',
      type: 'cross',
      value: 3,
    },
    side: 'B',
    liquidationPx: '85',
    marginUsed: '33.33',
    maxLeverage: 5,
    positionValue: '100',
    returnOnEquity: '0.09',
    markPrice: '105',
    szi: '1',
    unrealizedPnl: '9',
    tpPrice: '110',
    slPrice: '95',
    midPrice: '103',
    timestamp: Date.now() - 120 * 1000,
  },
  {
    coin: 'XRP',
    cumFunding: {
      allTime: '-0.2',
      sinceChange: '-0.01',
      sinceOpen: '-0.05',
    },
    entryPx: '0.5',
    leverage: {
      rawUsd: '200',
      type: 'isolated',
      value: 4,
    },
    side: 'A',
    liquidationPx: '0.4',
    marginUsed: '50',
    maxLeverage: 8,
    positionValue: '200',
    returnOnEquity: '-0.1',
    markPrice: '0.45',
    szi: '-400',
    unrealizedPnl: '-20',
    tpPrice: '0.6',
    slPrice: '0.42',
    midPrice: '0.47',
  },
  {
    coin: 'DOGE',
    cumFunding: {
      allTime: '0.05',
      sinceChange: '0.01',
      sinceOpen: '0.03',
    },
    entryPx: '0.1',
    leverage: {
      rawUsd: '50',
      type: 'cross',
      value: 2,
    },
    side: 'B',
    liquidationPx: '0.08',
    marginUsed: '25',
    maxLeverage: 5,
    positionValue: '50',
    returnOnEquity: '0.04',
    markPrice: '0.102',
    szi: '500',
    unrealizedPnl: '2',
    tpPrice: '0.12',
    slPrice: '0.095',
    midPrice: '0.101',
    timestamp: Date.now() - 10 * 1000,
  },
]

export const MyPositions = () => {
  const [directionFilter, setDrectionFilter] = useState(modeOptions[0].value)
  const [checked, setChecked] = useState(false)

  return (
    <div>
      <OrderTypeTabs />
      <div className="mt-2 flex items-center justify-between">
        <DirectionFilters {...{ setDrectionFilter, directionFilter }} />
        <div className="text-xs leading-[calc(1rem*(12/16))] text-[#FFFFFF]">一键全部平仓</div>
      </div>
      <CheckboxWithLabel
        label="只展示当前币种"
        containerClassName="mt-1.5"
        isChecked={checked}
        onChange={() => {
          setChecked(!checked)
        }}
      />
      <div className="mt-3 flex flex-col gap-2">
        {filterPositions.map((item) => (
          <MyPositionCard positionInfo={item} key={item.coin} />
        ))}
        {filterPositions?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-80">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">没有数据</span>
          </div>
        )}
      </div>
    </div>
  )
}
