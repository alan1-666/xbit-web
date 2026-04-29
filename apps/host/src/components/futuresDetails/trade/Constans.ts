import { UITab } from '@/types/uiTabs'
import { ITimeOption, OrderSide, Tif, TriggerTypeEmum } from './type.order'
import i18n from '@/i18n'

export const currencyList: UITab[] = [
  {
    value: 'USD',
    label: 'USD',
  },
  {
    value: 'BTC',
    label: 'BTC',
  },
]
export const triggerTypeOptions: UITab[] = [
  {
    value: TriggerTypeEmum.MarketOrder,
    label: '市价委托',
  },
  {
    value: TriggerTypeEmum.LimitOrder,
    label: '限价委托',
  },
]

export const calcList: UITab[] = [
  {
    label: '强平价格',
    value: '65,724',
  },
  {
    label: '订单价值',
    value: '$3304.80',
  },

  {
    label: '保证金',
    value: '$165.22',
  },
]

export const orderTypeOptions = (): UITab[] => [
  {
    value: 'market',
    label: i18n.t('futuresDetails.tabs.marketOrder'),
  },
  {
    value: 'limit',
    label: i18n.t('futuresDetails.tabs.limitOrder'),
  },
  // {
  //   value: 'tpsl',
  //   label: '止盈止损',
  // },
  // {
  //   value: 'phased',
  //   label: '分段委托',
  // },
  // {
  //   value: 'twap',
  //   label: '分时委托',
  // },
]

export const orderSideOptions: UITab[] = [
  {
    value: OrderSide.buy,
    label: '买入',
  },
  {
    value: OrderSide.sell,
    label: '卖出',
  },
]

export const periods: ITimeOption[] = [
  { value: 60, unit: 'h', lable: '1' },
  { value: 360, unit: 'h', lable: '6' },
  { value: 720, unit: 'h', lable: '12' },
  { value: 1440, unit: 'h', lable: '24' },
]

export const effectiveList: UITab[] = [
  {
    label: 'GTC(Good Til Cancel)',
    value: 'Gtc' as Tif, 
  },
  {
    label: 'IOC(Immediate Or Cancel)', 
    value: 'Ioc' as Tif,
  },
  {
    label: 'ALO(Add Liquidity Only)',
    value: 'Alo' as Tif,
  },
]